import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { record } = await req.json();

    if (!record) {
      return new Response(
        JSON.stringify({ error: '缺少record参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    let starRating = 1;

    // 根据指标类型计算星级
    if (record.indicator_code === '语文_识字量') {
      const words = record.raw_data?.words_learned || 0;
      if (words >= 800) starRating = 3;
      else if (words >= 600) starRating = 2;
    } else if (record.indicator_code === '数学_口算速度') {
      const speed = record.raw_data?.problems_per_minute || 0;
      if (speed >= 20) starRating = 3;
      else if (speed >= 15) starRating = 2;
    } else if (record.domain === '品德发展') {
      // 行为频次统计
      const { count } = await supabase
        .from('evaluation_records')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', record.student_id)
        .eq('star_rating', 3)
        .eq('domain', '品德发展');

      const goodBehaviorCount = count || 0;
      starRating = goodBehaviorCount >= 10 ? 3 : goodBehaviorCount >= 5 ? 2 : 1;
    } else if (record.indicator_code === '课堂_发言次数') {
      // 发言次数统计（今日）
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('evaluation_records')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', record.student_id)
        .eq('indicator_code', '课堂_发言次数')
        .gte('created_at', `${today}T00:00:00`);

      const todayCount = count || 0;
      starRating = todayCount >= 3 ? 3 : todayCount >= 1 ? 2 : 1;
    }

    // 更新星级
    const { data, error } = await supabase
      .from('evaluation_records')
      .update({ star_rating: starRating })
      .eq('id', record.id)
      .select()
      .single();

    if (error) {
      console.error('更新失败:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, starRating, data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge Function 错误:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});


