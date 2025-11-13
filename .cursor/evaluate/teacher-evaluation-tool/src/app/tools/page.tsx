'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BarChart3, Search, Users, FileText, BookOpen, Thermometer, TreePine, Train } from 'lucide-react';

const tools = {
  teacher: [
    { id: 'class-heatmap', name: '课堂发言热力图', icon: BarChart3, desc: '记录学生发言次数', href: '/heatmap' },
    { id: 'homework-microscope', name: '作业显微镜评价表', icon: Search, desc: '检查书写质量', href: '/tools/homework-microscope' },
    { id: 'group-contribution', name: '小组合作贡献值', icon: Users, desc: '记录合作表现', href: '/tools/group-contribution' },
  ],
  parent: [
    { id: 'home-habits', name: '家庭学习习惯观察表', icon: FileText, desc: '记录家庭学习习惯', href: '/tools/home-habits' },
    { id: 'reading-card', name: '亲子阅读记录卡', icon: BookOpen, desc: '记录阅读时光', href: '/tools/reading-card' },
    { id: 'emotion-meter', name: '情绪温度计量表', icon: Thermometer, desc: '每日心情记录', href: '/tools/emotion-meter' },
  ],
  student: [
    { id: 'growth-tree', name: '"我能行"成长树', icon: TreePine, desc: '目标达成记录', href: '/tools/growth-tree' },
    { id: 'mistake-train', name: '错题追踪小火车', icon: Train, desc: '错题订正管理', href: '/tools/mistake-train' },
  ],
};

export default function ToolsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">评价工具</h1>

      <div className="space-y-6">
        {/* 教师工具 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              教师用工具包
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tools.teacher.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{tool.name}</h3>
                        <p className="text-sm text-gray-600">{tool.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 家长工具 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              家长用工具包
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tools.parent.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{tool.name}</h3>
                        <p className="text-sm text-gray-600">{tool.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 学生自评工具 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              学生自评工具
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.student.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{tool.name}</h3>
                        <p className="text-sm text-gray-600">{tool.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

