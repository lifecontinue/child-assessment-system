'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { getCurrentWeek } from '@/lib/supabase';
import { EVALUATION_DOMAINS, SUBJECTS } from '@/lib/constants';

interface EvaluationFormProps {
  studentId: number | string; // 支持 BIGINT (number) 和 UUID (string)
  onSuccess?: () => void;
}

export default function EvaluationForm({ studentId, onSuccess }: EvaluationFormProps) {
  const [domain, setDomain] = useState('学科素养');
  const [subject, setSubject] = useState('chinese');
  const [indicator, setIndicator] = useState('');
  const [starRating, setStarRating] = useState<number>(1);
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const week = getCurrentWeek();
      const indicatorCode = `${subject}_${indicator}`;

      // 确保 student_id 是数字类型（BIGINT）
      const studentIdNum = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
      
      const { data, error } = await supabase
        .from('evaluation_records')
        .insert({
          student_id: studentIdNum,
          week_number: week,
          domain,
          indicator_code: indicatorCode,
          star_rating: starRating,
          evidence,
          raw_data: {},
        })
        .select()
        .single();

      if (error) throw error;

      // 触发自动评级
      try {
        await supabase.functions.invoke('auto-rating', {
          body: { record: data },
        });
      } catch (err) {
        console.warn('自动评级功能未部署:', err);
      }

      // 重置表单
      setEvidence('');
      setStarRating(1);
      onSuccess?.();
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">评价领域</label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          {EVALUATION_DOMAINS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.icon} {d.name}
            </option>
          ))}
        </select>
      </div>

      {domain === '学科素养' && (
        <div>
          <label className="block text-sm font-medium mb-2">学科</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            {SUBJECTS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">评价指标</label>
        <input
          type="text"
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
          placeholder="例如：识字量、口算速度等"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">星级评价</label>
        <div className="flex gap-2">
          {[1, 2, 3].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setStarRating(star)}
              className={`px-4 py-2 rounded ${
                starRating >= star
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {'★'.repeat(star)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">评价证据</label>
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="描述学生的具体表现..."
          rows={4}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '提交中...' : '提交评价'}
      </button>
    </form>
  );
}


