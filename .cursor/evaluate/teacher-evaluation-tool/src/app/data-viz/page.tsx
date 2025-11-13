'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RadarChart from '@/components/RadarChart';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { EVALUATION_DOMAINS } from '@/lib/constants';

export default function DataVizPage() {
  const [radarData, setRadarData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      try {
        // 获取所有评价记录
        const { data: records } = await supabase
          .from('evaluation_records')
          .select('domain, star_rating, week_number')
          .order('week_number');

        if (records) {
          // 计算雷达图数据
          const domainScores: Record<string, number[]> = {};
          records.forEach((record) => {
            if (!domainScores[record.domain]) {
              domainScores[record.domain] = [];
            }
            domainScores[record.domain].push(record.star_rating || 0);
          });

          const radarChartData = EVALUATION_DOMAINS.map((domain) => {
            const scores = domainScores[domain.code] || [0];
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            return {
              domain: domain.name,
              score: Math.round((avgScore / 3) * 100),
            };
          });

          setRadarData(radarChartData);

          // 计算趋势数据（按周）
          const weeklyData: Record<number, Record<string, number[]>> = {};
          records.forEach((record) => {
            if (!weeklyData[record.week_number]) {
              weeklyData[record.week_number] = {};
            }
            if (!weeklyData[record.week_number][record.domain]) {
              weeklyData[record.week_number][record.domain] = [];
            }
            weeklyData[record.week_number][record.domain].push(record.star_rating || 0);
          });

          const trendChartData = Object.keys(weeklyData)
            .map(Number)
            .sort((a, b) => a - b)
            .map((week) => {
              const weekData: any = { week: `第${week}周` };
              EVALUATION_DOMAINS.forEach((domain) => {
                const scores = weeklyData[week][domain.code] || [0];
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                weekData[domain.name] = Math.round((avg / 3) * 100);
              });
              return weekData;
            });

          setTrendData(trendChartData);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">数据分析</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 五维雷达图 */}
        <Card>
          <CardHeader>
            <CardTitle>📈 五维雷达图</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsRadarChart data={radarData}>
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
          </CardContent>
        </Card>

        {/* 学科发展趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>📊 学科发展趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {EVALUATION_DOMAINS.map((domain, index) => {
                  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
                  return (
                    <Line
                      key={domain.code}
                      type="monotone"
                      dataKey={domain.name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

