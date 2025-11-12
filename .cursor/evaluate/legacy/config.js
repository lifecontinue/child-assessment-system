// Supabase 配置
// 注意：浏览器环境没有 process，对其访问必须做防御判断
// 在 Vercel 中，可通过注入到 window 的变量获取（见 inject-env.js）
(function() {
    const w = typeof window !== 'undefined' ? window : {};
    const p = typeof process !== 'undefined' ? process : undefined;
    const fromProcess = (key) => {
        try {
            // 某些环境没有 process 或 env，这里做防御
            return p && p.env && p.env[key] ? p.env[key] : undefined;
        } catch (_) {
            return undefined;
        }
    };

    // 优先使用 window 注入的运行时配置；其次尝试进程环境（本地构建时）；最后使用开发默认值
    const SUPABASE_CONFIG = {
        url: w.SUPABASE_URL || fromProcess('SUPABASE_URL') || 'https://nmkjzhqonmdyghydvdyy.supabase.co',
        anonKey: w.SUPABASE_ANON_KEY || fromProcess('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta2p6aHFvbm1keWdoeWR2ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDE1NzYsImV4cCI6MjA3ODUxNzU3Nn0.HKcwvEzCjocdGl-jAF0imGCwhDtjh1iqR2N5tNrvubY'
    };

    // 暴露到 window，供其他脚本访问
    w.SUPABASE_CONFIG = SUPABASE_CONFIG;
})();

// 初始化 Supabase 客户端
let supabase = null;

function initSupabase() {
    // 检查 Supabase 库是否已加载
    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase JS 库未加载');
        return false;
    }
    
    const cfg = window.SUPABASE_CONFIG;
    if (cfg && cfg.url && cfg.url !== 'YOUR_SUPABASE_URL' &&
        cfg.anonKey && cfg.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            supabase = window.supabase.createClient(cfg.url, cfg.anonKey);
            return true;
        } catch (error) {
            console.error('初始化 Supabase 失败:', error);
            return false;
        }
    }
    return false;
}

