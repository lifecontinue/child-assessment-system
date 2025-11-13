'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { getCurrentWeek } from '@/lib/supabase';
import { Bell, Settings } from 'lucide-react';

interface Student {
  id: string;
  name: string;
}

export default function Header() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('students')
        .select('id, name')
        .order('name');
      setStudents(data || []);
    };

    fetchStudents();
    setCurrentWeek(getCurrentWeek());
  }, []);

  const handleStudentChange = (studentId: string) => {
    setCurrentStudentId(studentId);
    // 可以在这里触发全局状态更新
    // 注意：studentId 可能是字符串形式的数字（BIGINT）
  };

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">首页</h1>
        <div className="text-sm text-gray-500">评价系统</div>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={currentStudentId}
          onChange={(e) => handleStudentChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">选择学生</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="通知">
          <Bell className="w-5 h-5" />
        </button>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="设置">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

