import { createBrowserClient } from '@supabase/ssr';

// 客户端组件使用
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// 获取当前教学周
export const getCurrentWeek = (): number => {
  const startDate = new Date('2025-09-01'); // 开学日
  const today = new Date();
  const diff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(20, Math.ceil(diff / 7))); // 限制在1-20周
};


