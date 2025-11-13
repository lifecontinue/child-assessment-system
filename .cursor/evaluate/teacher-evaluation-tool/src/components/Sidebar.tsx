'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  BookOpen,
  Star,
  Wrench,
  FileText,
  BarChart3,
  Users,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home, screen: 'dashboard' },
  { href: '/subject-assessment', label: '学科评价', icon: BookOpen, screen: 'subject-assessment' },
  { href: '/comprehensive-assessment', label: '综合素质', icon: Star, screen: 'comprehensive-assessment' },
  { href: '/tools', label: '评价工具', icon: Wrench, screen: 'tools' },
  { href: '/reports', label: '评价报告', icon: FileText, screen: 'reports' },
  { href: '/data-viz', label: '数据分析', icon: BarChart3, screen: 'data-viz' },
  { href: '/students', label: '学生管理', icon: Users, screen: 'students' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white shadow-lg flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-5 border-b flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎓 评价系统
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          ☰
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span>使用帮助</span>}
        </button>
      </div>
    </aside>
  );
}

