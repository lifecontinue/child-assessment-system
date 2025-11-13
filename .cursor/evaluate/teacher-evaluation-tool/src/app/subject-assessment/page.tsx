'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EvaluationForm from '@/components/EvaluationForm';
import { BookOpen, Calculator, Languages } from 'lucide-react';

const subjects = {
  chinese: { name: '语文', icon: '📖', color: 'blue', indicators: ['识字量', '朗读流利度', '阅读理解', '看图写话'] },
  math: { name: '数学', icon: '🔢', color: 'green', indicators: ['口算速度', '乘法口诀', '应用题', '图形认知'] },
  english: { name: '英语', icon: '🔤', color: 'purple', indicators: ['单词认读', '口语表达', '听力理解', '书写规范'] },
};

function SubjectAssessmentContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject') || 'chinese';
  const [activeSubject, setActiveSubject] = useState<string>(subjectParam);
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
      const subjectName = subjects[activeSubject as keyof typeof subjects]?.name || '语文';
      const { data: assessmentsData } = await supabase
        .from('evaluation_records')
        .select('*')
        .eq('domain', '学科素养')
        .like('indicator_code', `${activeSubject}_%`)
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
  }, [activeSubject]);

  const subject = subjects[activeSubject as keyof typeof subjects] || subjects.chinese;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">学科评价</h1>
        
        {/* 学科切换标签 */}
        <div className="flex gap-2 border-b">
          {(Object.keys(subjects) as Array<keyof typeof subjects>).map((key) => {
            const subj = subjects[key];
            const isActive = activeSubject === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSubject(key)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  isActive
                    ? `border-${subj.color}-500 text-${subj.color}-600`
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{subj.icon}</span>
                {subj.name}
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
                    // 刷新评价记录
                    window.location.reload();
                  }}
                />
              ) : (
                <p className="text-gray-500 text-sm">请先选择学生</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：评价记录 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{subject.name}评价记录</CardTitle>
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

export default function SubjectAssessmentPage() {
  return (
    <Suspense fallback={<div className="p-6">加载中...</div>}>
      <SubjectAssessmentContent />
    </Suspense>
  );
}

