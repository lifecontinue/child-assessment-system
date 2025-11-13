'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import SpeakingHeatmap from '@/components/SpeakingHeatmap';

interface Student {
  id: string;
  name: string;
  seat_x: number;
  seat_y: number;
  count: number;
}

export default function HeatmapPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('students')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('获取学生列表失败:', error);
      } else {
        // 模拟座位分配（6列布局）
        const studentsWithSeats: Student[] = (data || []).map((s, index) => ({
          id: s.id,
          name: s.name,
          seat_x: (index % 6) + 1,
          seat_y: Math.floor(index / 6) + 1,
          count: 0,
        }));
        setStudents(studentsWithSeats);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 课堂发言热力图</h1>
      <p className="text-gray-600 mb-6">
        点击学生座位记录发言次数，颜色越深表示发言越积极
      </p>
      <SpeakingHeatmap students={students} />
    </div>
  );
}


