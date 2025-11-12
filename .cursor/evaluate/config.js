// Supabase 配置
// 注意：在生产环境中，这些值应该从环境变量中读取
// 在 Vercel 中，可以通过构建时注入或运行时从 window 对象读取
const SUPABASE_CONFIG = {
    // 优先从 window 对象读取（Vercel 环境变量注入）
    // 如果未设置环境变量，使用以下默认值（仅用于开发测试）
    url: window.SUPABASE_URL || process.env.SUPABASE_URL || 'https://nmkjzhqonmdyghydvdyy.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta2p6aHFvbm1keWdoeWR2ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDE1NzYsImV4cCI6MjA3ODUxNzU3Nn0.HKcwvEzCjocdGl-jAF0imGCwhDtjh1iqR2N5tNrvubY'
};

// 初始化 Supabase 客户端
let supabase = null;

function initSupabase() {
    // 检查 Supabase 库是否已加载
    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase JS 库未加载');
        return false;
    }
    
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
        SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            return true;
        } catch (error) {
            console.error('初始化 Supabase 失败:', error);
            return false;
        }
    }
    return false;
}

