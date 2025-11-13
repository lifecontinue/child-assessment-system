import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { student_id, report_type } = await req.json();

    if (!student_id || !report_type) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 获取所有评价数据
    const { data: records, error } = await supabase
      .from('evaluation_records')
      .select('*')
      .eq('student_id', student_id);

    if (error) throw error;

    // 2. 计算各domain平均分
    const domainScores: Record<string, { total: number; count: number }> = {};
    records?.forEach((record) => {
      if (!domainScores[record.domain]) {
        domainScores[record.domain] = { total: 0, count: 0 };
      }
      domainScores[record.domain].total += record.star_rating || 0;
      domainScores[record.domain].count += 1;
    });

    const domainAverages: Record<string, number> = {};
    Object.keys(domainScores).forEach((domain) => {
      const { total, count } = domainScores[domain];
      domainAverages[domain] = count > 0 ? total / count : 0;
    });

    // 3. 生成评语（简化版）
    const comments = generateComment(domainAverages);

    // 4. 存入reports表
    const report = {
      student_id,
      report_type,
      report_data: {
        domainScores: domainAverages,
        comments,
        evidence: records,
        generated_at: new Date().toISOString(),
      },
    };

    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single();

    if (reportError) throw reportError;

    return new Response(
      JSON.stringify(reportData),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('生成报告失败:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function generateComment(domainScores: Record<string, number>): string {
  const comments: string[] = [];

  if (domainScores['学科素养'] >= 2.5) {
    comments.push('学科素养表现优秀，基础知识掌握扎实。');
  } else if (domainScores['学科素养'] >= 2) {
    comments.push('学科素养良好，继续努力。');
  } else {
    comments.push('学科素养需要加强，建议多练习。');
  }

  if (domainScores['品德发展'] >= 2.5) {
    comments.push('品德发展优秀，行为规范良好。');
  } else if (domainScores['品德发展'] >= 2) {
    comments.push('品德发展良好，继续保持。');
  } else {
    comments.push('品德发展需要关注，建议加强引导。');
  }

  return comments.join(' ');
}


