'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EvaluationForm from '@/components/EvaluationForm';
import { EVALUATION_DOMAINS } from '@/lib/constants';

const domainMap: Record<string, { name: string; icon: string; indicators: string[] }> = {
  品德发展: { name: '品德发展', icon: '🌟', indicators: ['规则意识', '诚实守信', '责任担当', '文明有礼'] },
  身心健康: { name: '身心健康', icon: '💪', indicators: ['运动能力', '情绪管理', '生活习惯'] },
  审美素养: { name: '审美素养', icon: '🎨', indicators: ['音乐感知', '美术创作', '文学欣赏'] },
  劳动实践: { name: '劳动实践', icon: '🔨', indicators: ['值日劳动', '手工制作', '种植活动'] },
};

function ComprehensiveAssessmentContent() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain') || '品德发展';
  const [activeDomain, setActiveDomain] = useState<string>(domainParam);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 获取学生列表
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .order('name');
      setStudents(studentsData || []);

      // 获取评价记录（手动关联学生信息）
      const { data: assessmentsData } = await supabase
        .from('evaluation_records')
        .select('*')
        .eq('domain', activeDomain)
        .order('created_at', { ascending: false })
        .limit(20);
      
      // 手动关联学生信息
      if (assessmentsData && assessmentsData.length > 0) {
        const studentIds = [...new Set(assessmentsData.map(a => a.student_id))];
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, name')
          .in('id', studentIds);
        
        const studentsMap = new Map((studentsData || []).map(s => [s.id, s]));
        assessmentsData.forEach(assessment => {
          (assessment as any).student = studentsMap.get(assessment.student_id);
        });
      }
      
      setAssessments(assessmentsData || []);
    };

    fetchData();
  }, [activeDomain]);

  const domain = domainMap[activeDomain] || domainMap['品德发展'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">综合素质评价</h1>
        
        {/* 领域切换标签 */}
        <div className="flex gap-2 border-b flex-wrap">
          {EVALUATION_DOMAINS.filter(d => d.code !== '学科素养').map((d) => {
            const isActive = activeDomain === d.code;
            return (
              <button
                key={d.code}
                onClick={() => setActiveDomain(d.code)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{d.icon}</span>
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：评价表单 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>添加评价</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">选择学生</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">请选择学生</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent ? (
                <EvaluationForm
                  studentId={selectedStudent}
                  onSuccess={() => {
                    setSelectedStudent('');
                    window.location.reload();
                  }}
                />
              ) : (
                <p className="text-gray-500 text-sm">请先选择学生</p>
              )}
            </CardContent>
          </Card>

          {/* 评价指标说明 */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">评价指标</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domain.indicators.map((indicator) => (
                  <div key={indicator} className="text-sm text-gray-600">
                    • {indicator}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：评价记录 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{domain.name}评价记录</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <p className="text-gray-500">暂无评价记录</p>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {(assessment as any).student?.name || '未知学生'}
                          </p>
                          <p className="text-sm text-gray-600">{assessment.indicator_code}</p>
                          <p className="text-sm text-gray-500 mt-1">{assessment.evidence}</p>
                        </div>
                        <div className="text-yellow-500 text-lg">
                          {'★'.repeat(assessment.star_rating || 0)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(assessment.created_at).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ComprehensiveAssessmentPage() {
  return (
    <Suspense fallback={<div className="p-6">加载中...</div>}>
      <ComprehensiveAssessmentContent />
    </Suspense>
  );
}

