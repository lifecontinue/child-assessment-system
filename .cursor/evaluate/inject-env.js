// 在构建时注入环境变量到 HTML
const fs = require('fs');
const path = require('path');

// 从环境变量读取配置
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('警告: SUPABASE_URL 或 SUPABASE_ANON_KEY 未设置');
}

// 读取 index.html
const htmlPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(htmlPath)) {
    console.error('错误: index.html 不存在');
    process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// 在 </head> 之前注入配置脚本
const configScript = `
<script>
  // 从环境变量注入的 Supabase 配置
  window.SUPABASE_URL = '${supabaseUrl}';
  window.SUPABASE_ANON_KEY = '${supabaseKey}';
</script>
`;

// 检查是否已经注入过（避免重复）
if (!html.includes('window.SUPABASE_URL')) {
    html = html.replace('</head>', configScript + '</head>');
    fs.writeFileSync(htmlPath, html);
    console.log('✓ 环境变量已注入到 index.html');
} else {
    console.log('⚠ 环境变量已存在，跳过注入');
}

