'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';

interface Report {
  id: string;
  student_id: string;
  report_type: string;
  report_data: any;
  generated_at: string;
  students?: { name: string };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportType, setReportType] = useState('initial');
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 获取报告列表（手动关联学生信息）
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .order('generated_at', { ascending: false });

      // 手动关联学生信息
      if (reportsData && reportsData.length > 0) {
        const studentIds = [...new Set(reportsData.map(r => r.student_id))];
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, name')
          .in('id', studentIds);
        
        const studentsMap = new Map((studentsData || []).map(s => [s.id, s]));
        reportsData.forEach(report => {
          (report as any).student = studentsMap.get(report.student_id);
        });
      }

      setReports(reportsData || []);

      // 获取学生列表
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .order('name');
      setStudents(studentsData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedStudent || !reportType) {
      alert('请选择学生和报告类型');
      return;
    }

    try {
      const response = await fetch('/api/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          reportType: reportType,
        }),
      });

      if (response.ok) {
        alert('报告生成成功！');
        setShowGenerateModal(false);
        window.location.reload();
      } else {
        alert('报告生成失败');
      }
    } catch (error) {
      console.error('生成报告失败:', error);
      alert('生成报告失败');
    }
  };

  const reportTypeNames: Record<string, string> = {
    initial: '学期初诊断',
    mid: '学期中发展',
    final: '学期末总结',
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">评价报告</h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          生成新报告
        </button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无报告，点击上方按钮生成新报告</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">
                  {reportTypeNames[report.report_type] || report.report_type}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  学生：{(report as any).student?.name || '未知'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(report.generated_at).toLocaleDateString('zh-CN')}
                </p>
                <div className="mt-4 pt-4 border-t">
                  <button className="text-blue-600 hover:underline text-sm">
                    查看详情
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 生成报告模态框 */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">生成新报告</h2>
            
            <div className="space-y-4">
              <div>
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

              <div>
                <label className="block text-sm font-medium mb-2">报告类型</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="initial">学期初诊断</option>
                  <option value="mid">学期中发展</option>
                  <option value="final">学期末总结</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleGenerateReport}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                生成报告
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

