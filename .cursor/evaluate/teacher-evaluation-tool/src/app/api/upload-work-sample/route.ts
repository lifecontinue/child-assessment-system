import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;

    if (!file || !studentId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 上传至Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('work-samples')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 获取公开URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('work-samples').getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { error: '上传失败' },
      { status: 500 }
    );
  }
}


