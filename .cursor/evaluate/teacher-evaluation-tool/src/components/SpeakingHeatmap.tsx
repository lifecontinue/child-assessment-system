'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { getCurrentWeek } from '@/lib/supabase';

interface Student {
  id: number | string; // 支持 BIGINT (number) 和 UUID (string)
  name: string;
  seat_x: number;
  seat_y: number;
  count: number;
}

interface SpeakingHeatmapProps {
  students: Student[];
}

export default function SpeakingHeatmap({ students: initialStudents }: SpeakingHeatmapProps) {
  const [seatData, setSeatData] = useState<Student[]>(initialStudents);
  const supabase = createClient();

  useEffect(() => {
    // 加载今日发言数据
    const loadTodayData = async () => {
      const week = getCurrentWeek();
      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('evaluation_records')
        .select('student_id, raw_data')
        .eq('week_number', week)
        .eq('indicator_code', '课堂_发言次数')
        .gte('created_at', `${today}T00:00:00`);

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((record) => {
          const studentId = record.student_id;
          const increment = (record.raw_data as any)?.increment || 1;
          counts[studentId] = (counts[studentId] || 0) + increment;
        });

        setSeatData((prev) =>
          prev.map((s) => ({
            ...s,
            count: counts[s.id] || 0,
          }))
        );
      }
    };

    loadTodayData();
  }, [supabase]);

  const handleSeatClick = async (studentId: number | string) => {
    // 1. 更新本地状态
    const updated = seatData.map((s) =>
      s.id === studentId ? { ...s, count: s.count + 1 } : s
    );
    setSeatData(updated);

    // 2. 数据库记录
    const week = getCurrentWeek();
    // 确保 student_id 是数字类型（BIGINT）
    const studentIdNum = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    
    const { data, error } = await supabase
      .from('evaluation_records')
      .insert({
        student_id: studentIdNum,
        week_number: week,
        domain: '学科素养',
        indicator_code: '课堂_发言次数',
        star_rating: 1, // 暂存，由Edge Functions自动升级
        evidence: '课堂举手发言1次',
        raw_data: { increment: 1 },
      })
      .select()
      .single();

    if (error) {
      console.error('保存失败:', error);
      // 回滚本地状态
      setSeatData(seatData);
      return;
    }

    // 3. 触发自动评级（如果Edge Function已部署）
    try {
      await supabase.functions.invoke('auto-rating', {
        body: { record: data },
      });
    } catch (err) {
      console.warn('自动评级功能未部署:', err);
    }
  };

  const getColor = (count: number): string => {
    if (count >= 3) return 'bg-orange-500 text-white';
    if (count >= 1) return 'bg-yellow-300 text-gray-800';
    return 'bg-gray-200 text-gray-600';
  };

  // 按座位位置排序（6列布局）
  const sortedStudents = [...seatData].sort((a, b) => {
    if (a.seat_y !== b.seat_y) return a.seat_y - b.seat_y;
    return a.seat_x - b.seat_x;
  });

  return (
    <div className="grid grid-cols-6 gap-2 p-4">
      {sortedStudents.map((student) => (
        <button
          key={student.id}
          onClick={() => handleSeatClick(student.id)}
          className={`${getColor(student.count)} p-4 rounded-lg transition-all hover:scale-105 cursor-pointer`}
        >
          <div className="font-bold text-sm">{student.name}</div>
          <div className="text-2xl font-bold mt-1">{student.count}</div>
        </button>
      ))}
    </div>
  );
}


