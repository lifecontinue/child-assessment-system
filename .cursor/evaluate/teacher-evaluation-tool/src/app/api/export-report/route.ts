import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { studentId, reportType } = await request.json();

    if (!studentId || !reportType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 确保 student_id 是数字类型（BIGINT）
    const studentIdNum = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;

    // 获取所有评价数据
    const { data: records, error } = await supabase
      .from('evaluation_records')
      .select('*')
      .eq('student_id', studentIdNum);

    if (error) throw error;

    // 计算各领域平均分
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

    // 生成评语（简化版）
    const comments = generateComment(domainAverages);

    // 创建报告数据
    const reportData = {
      student_id: studentIdNum,
      report_type: reportType,
      report_data: {
        domainScores: domainAverages,
        comments,
        evidence: records,
        generated_at: new Date().toISOString(),
      },
    };

    // 保存报告
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();

    if (reportError) throw reportError;

    return NextResponse.json(report);
  } catch (error) {
    console.error('生成报告失败:', error);
    return NextResponse.json(
      { error: '生成报告失败' },
      { status: 500 }
    );
  }
}

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
  }

  return comments.join(' ');
}


