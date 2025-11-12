# 快速部署到 Vercel

## 方法一：通过 Vercel 网站（推荐）

### 步骤 1: 准备代码
1. 确保所有文件已保存
2. （可选）初始化 Git 仓库：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

### 步骤 2: 推送到 GitHub
1. 在 GitHub 创建新仓库
2. 推送代码：
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

### 步骤 3: 在 Vercel 部署
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "Add New Project"
4. 选择你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (留空)
   - **Output Directory**: ./
6. 添加环境变量（在 Environment Variables 部分）：
   - `SUPABASE_URL`: 你的 Supabase 项目 URL
   - `SUPABASE_ANON_KEY`: 你的 Supabase anon key
7. 点击 "Deploy"

### 步骤 4: 获取链接
部署完成后，Vercel 会提供一个链接，格式如：
- `https://your-project-name.vercel.app`
- 或自定义域名（如果已配置）

## 方法二：通过 Vercel CLI

### 安装 CLI
```bash
npm i -g vercel
```

### 登录
```bash
vercel login
```

### 部署
```bash
# 在项目目录中运行
vercel

# 首次部署会询问配置，选择：
# - Set up and deploy? Yes
# - Which scope? (选择你的账户)
# - Link to existing project? No
# - Project name? (输入项目名)
# - Directory? ./
```

### 设置环境变量
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

### 重新部署
```bash
vercel --prod
```

## 配置 Supabase 环境变量

由于这是静态站点，需要在 HTML 中注入环境变量。

### 选项 1: 使用 Vercel 的环境变量注入脚本

创建 `inject-env.js`:

```javascript
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let html = fs.readFileSync('index.html', 'utf8');

const script = `
<script>
  window.SUPABASE_URL = '${supabaseUrl}';
  window.SUPABASE_ANON_KEY = '${supabaseKey}';
</script>
`;

html = html.replace('</head>', script + '</head>');
fs.writeFileSync('index.html', html);
```

然后在 `package.json` 中添加：
```json
{
  "scripts": {
    "build": "node inject-env.js"
  }
}
```

### 选项 2: 直接在 config.js 中配置（临时方案）

修改 `config.js`，直接填入你的 Supabase 配置（仅用于快速测试）。

## 部署后检查清单

- [ ] 访问部署链接，确认页面加载
- [ ] 测试注册功能
- [ ] 测试登录功能
- [ ] 测试数据保存
- [ ] 检查浏览器控制台是否有错误

## 常见问题

### 环境变量未生效
- 确保在 Vercel 项目设置中正确添加了环境变量
- 如果使用构建脚本注入，确保 `package.json` 中有 `build` 脚本
- 重新部署项目

### Supabase 连接失败
- 检查环境变量是否正确
- 检查 Supabase 项目是否正常运行
- 查看浏览器控制台的错误信息

### 页面 404
- 确保 `vercel.json` 配置正确
- 检查文件路径是否正确

## 获取部署链接

部署成功后，你可以在以下位置找到链接：

1. **Vercel Dashboard**: 
   - 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
   - 点击你的项目
   - 在 "Domains" 部分可以看到部署链接

2. **部署日志**:
   - 部署完成后，Vercel 会在终端/网页显示链接

3. **项目设置**:
   - 在项目设置中可以查看和配置域名

## 示例链接格式

部署后的链接通常是：
```
https://child-assessment-system-xxx.vercel.app
```

或者如果你配置了自定义域名：
```
https://yourdomain.com
```

