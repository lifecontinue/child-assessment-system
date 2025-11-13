'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { getCurrentWeek } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, AlertTriangle, BookOpen, Star, Activity, TrendingUp } from 'lucide-react';
import RadarChart from './RadarChart';
import Link from 'next/link';
import { EVALUATION_DOMAINS } from '@/lib/constants';

interface TeachingTask {
  id: number;
  week_number: number;
  subject: string;
  chapter: string;
  evaluation_type: string;
}

interface RiskStudent {
  id: string;
  name: string;
  class: string;
  risk_count: number;
}

interface Student {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [todayTasks, setTodayTasks] = useState<TeachingTask[]>([]);
  const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [progress, setProgress] = useState({ initial: 0, mid: 0, final: 0 });
  const [loading, setLoading] = useState(true);
  const currentWeek = getCurrentWeek();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const week = getCurrentWeek();

      try {
        // 获取今日评价任务
        const { data: tasks } = await supabase
          .from('teaching_progress')
          .select('*')
          .eq('week_number', week)
          .eq('is_node', true);

        setTodayTasks(tasks || []);

        // 获取预警学生
        try {
          const { data: risks } = await supabase.rpc('get_risk_students');
          setRiskStudents(risks || []);
        } catch (err) {
          console.warn('获取预警学生失败:', err);
        }

        // 获取最近评价记录（关联查询学生信息）
        // 注意：如果关联查询失败，可以分别查询然后手动关联
        const { data: assessments } = await supabase
          .from('evaluation_records')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        // 手动关联学生信息
        if (assessments && assessments.length > 0) {
          const studentIds = [...new Set(assessments.map(a => a.student_id))];
          const { data: studentsData } = await supabase
            .from('students')
            .select('id, name')
            .in('id', studentIds);
          
          const studentsMap = new Map((studentsData || []).map(s => [s.id, s]));
          assessments.forEach(assessment => {
            (assessment as any).student = studentsMap.get(assessment.student_id);
          });
        }

        setRecentAssessments(assessments || []);

        // 计算评价进度
        const { count: initialCount } = await supabase
          .from('evaluation_records')
          .select('*', { count: 'exact', head: true })
          .lte('week_number', 3);

        const { count: midCount } = await supabase
          .from('evaluation_records')
          .select('*', { count: 'exact', head: true })
          .gte('week_number', 4)
          .lte('week_number', 12);

        const { count: finalCount } = await supabase
          .from('evaluation_records')
          .select('*', { count: 'exact', head: true })
          .gte('week_number', 13);

        setProgress({
          initial: Math.min(100, ((initialCount || 0) / 10) * 100),
          mid: Math.min(100, ((midCount || 0) / 20) * 100),
          final: Math.min(100, ((finalCount || 0) / 10) * 100),
        });
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 学生概况 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            学生概况
          </CardTitle>
          <Link href="/students" className="text-sm text-blue-600 hover:underline">
            管理
          </Link>
        </CardHeader>
        <CardContent>
          {currentStudent ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {currentStudent.name[0]}
              </div>
              <div>
                <p className="font-medium text-lg">{currentStudent.name}</p>
                <p className="text-sm text-gray-500">当前学生</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">请先添加学生信息</p>
          )}
        </CardContent>
      </Card>

      {/* 五大领域快速入口 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            五大评价领域
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {EVALUATION_DOMAINS.map((domain) => (
              <Link
                key={domain.code}
                href={`/comprehensive-assessment?domain=${domain.code}`}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center cursor-pointer"
              >
                <div className="text-3xl mb-2">{domain.icon}</div>
                <div className="font-medium">{domain.name}</div>
                <div className="text-sm text-gray-500">权重 {domain.weight}%</div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 今日评价任务 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">今日评价任务</CardTitle>
            <Target className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-gray-500">今日暂无评价任务</p>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className="mb-2 p-2 bg-gray-50 rounded">
                  <p className="font-medium">
                    {task.subject} - {task.chapter}
                  </p>
                  <p className="text-sm text-gray-600">
                    评价: {task.evaluation_type}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 班级整体水平 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">班级整体水平</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart />
          </CardContent>
        </Card>

        {/* 关注学生 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">关注学生</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            {riskStudents.length === 0 ? (
              <p className="text-gray-500">暂无需要关注的学生</p>
            ) : (
              riskStudents.map((student) => (
                <div key={student.id} className="mb-2">
                  <span className="text-red-600 font-medium">{student.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    待发展{student.risk_count}项
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 最近评价记录 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            最近评价
          </CardTitle>
          <Link href="/reports" className="text-sm text-blue-600 hover:underline">
            查看全部
          </Link>
        </CardHeader>
        <CardContent>
          {recentAssessments.length === 0 ? (
            <p className="text-gray-500">暂无评价记录</p>
          ) : (
            <div className="space-y-2">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {(assessment as any).student?.name || '未知学生'}
                      </p>
                      <p className="text-sm text-gray-600">{assessment.domain}</p>
                      <p className="text-xs text-gray-500 mt-1">{assessment.evidence}</p>
                    </div>
                    <div className="text-yellow-500">
                      {'★'.repeat(assessment.star_rating || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 评价进度 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            评价进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>学期初诊断</span>
                <span>{Math.round(progress.initial)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.initial}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>学期中发展</span>
                <span>{Math.round(progress.mid)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.mid}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>学期末总结</span>
                <span>{Math.round(progress.final)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.final}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            快速操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Link
              href="/subject-assessment?subject=chinese"
              className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="font-medium">语文评价</div>
            </Link>
            <Link
              href="/subject-assessment?subject=math"
              className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">🔢</div>
              <div className="font-medium">数学评价</div>
            </Link>
            <Link
              href="/subject-assessment?subject=english"
              className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">🔤</div>
              <div className="font-medium">英语评价</div>
            </Link>
            <Link
              href="/tools"
              className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <div className="text-2xl mb-2">🛠️</div>
              <div className="font-medium">评价工具</div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            系统信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600">版本</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">学期</span>
              <span className="font-medium">2024-2025上学期</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">当前周次</span>
              <span className="font-medium">第{currentWeek}周</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">评价标准</span>
              <span className="font-medium">2022版新课标</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


