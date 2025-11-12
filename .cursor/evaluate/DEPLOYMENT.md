# 部署指南

## 快速部署步骤

### 1. 设置 Supabase

1. 访问 [Supabase](https://supabase.com) 并创建账户
2. 创建新项目
3. 在项目设置 > API 中获取：
   - Project URL
   - anon/public key
4. 在 SQL Editor 中执行 `supabase-setup.sql` 创建表结构
5. 在 Authentication > Providers 中启用 GitHub OAuth（可选）

### 2. 配置 GitHub OAuth（可选）

1. 在 GitHub 创建 OAuth App：
   - Settings > Developer settings > OAuth Apps > New OAuth App
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
2. 在 Supabase 中配置：
   - Authentication > Providers > GitHub
   - 填入 Client ID 和 Client Secret

### 3. 部署到 Vercel

#### 方法一：通过 GitHub

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在项目设置 > Environment Variables 中添加：
   - `SUPABASE_URL`: 你的 Supabase 项目 URL
   - `SUPABASE_ANON_KEY`: 你的 Supabase anon key
4. 部署

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在项目目录中部署
vercel

# 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

### 4. 配置环境变量注入

由于这是静态站点，需要在 HTML 中注入环境变量。有几种方法：

#### 方法一：使用 Vercel 的构建时注入

创建 `build.js`:

```javascript
const fs = require('fs');
const path = require('path');

// 读取环境变量
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// 读取 index.html
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 在 </head> 之前注入配置
const configScript = `
<script>
  window.SUPABASE_URL = '${supabaseUrl}';
  window.SUPABASE_ANON_KEY = '${supabaseKey}';
</script>
`;

html = html.replace('</head>', configScript + '</head>');

// 写入新文件
fs.writeFileSync(htmlPath, html);
```

在 `package.json` 中添加：

```json
{
  "scripts": {
    "build": "node build.js"
  }
}
```

#### 方法二：直接在 config.js 中配置（开发用）

修改 `config.js`，直接填入你的 Supabase 配置（不推荐用于生产环境）。

### 5. 验证部署

1. 访问部署的 URL
2. 测试注册/登录功能
3. 测试数据保存和加载
4. 测试 GitHub OAuth（如已配置）

## 页面跳转流程

1. **未登录用户** → `authScreen` (登录/注册页面)
2. **登录成功** → `dailyRecordScreen` (日常记录页面)
3. **日常记录页面** → 可以跳转到：
   - `studentInfoScreen` (学生信息)
   - `assessmentScreen` (完整测评)
   - `resultScreen` (推荐/结果)
   - `assessmentRecordsScreen` (评估记录)
   - `multiAnalysisScreen` (趋势分析)

## 故障排查

### Supabase 连接失败

- 检查环境变量是否正确设置
- 检查 Supabase 项目是否正常运行
- 检查浏览器控制台错误信息

### GitHub OAuth 不工作

- 检查回调 URL 是否正确配置
- 检查 GitHub OAuth App 的配置
- 检查 Supabase 中的 GitHub Provider 配置

### 数据保存失败

- 检查 Supabase 表结构是否正确创建
- 检查 RLS 策略是否正确配置
- 检查用户是否已登录

## 安全建议

1. **启用 RLS (Row Level Security)**：确保用户只能访问自己的数据
2. **使用环境变量**：不要在代码中硬编码敏感信息
3. **定期更新依赖**：保持 Supabase JS 客户端最新
4. **监控使用情况**：在 Supabase 仪表板中监控 API 使用

## 支持

如有问题，请查看：
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)

