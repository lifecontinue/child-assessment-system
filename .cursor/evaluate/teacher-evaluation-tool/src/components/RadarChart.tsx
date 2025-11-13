'use client';

import { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { createClient } from '@/lib/supabase';
import { EVALUATION_DOMAINS } from '@/lib/constants';

export default function RadarChart() {
  const [data, setData] = useState<Array<{ domain: string; score: number }>>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      try {
        // 获取所有评价记录，计算各领域平均分
        const { data: records } = await supabase
          .from('evaluation_records')
          .select('domain, star_rating');

        if (records) {
          const domainScores: Record<string, number[]> = {};

          records.forEach((record) => {
            if (!domainScores[record.domain]) {
              domainScores[record.domain] = [];
            }
            domainScores[record.domain].push(record.star_rating || 0);
          });

          const chartData = EVALUATION_DOMAINS.map((domain) => {
            const scores = domainScores[domain.code] || [0];
            const avgScore =
              scores.reduce((a, b) => a + b, 0) / scores.length;
            return {
              domain: domain.name,
              score: Math.round((avgScore / 3) * 100), // 转换为0-100分
            };
          });

          setData(chartData);
        }
      } catch (error) {
        console.error('获取雷达图数据失败:', error);
        // 使用默认数据
        setData(
          EVALUATION_DOMAINS.map((domain) => ({
            domain: domain.name,
            score: 60,
          }))
        );
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="domain" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="班级平均"
          dataKey="score"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}


