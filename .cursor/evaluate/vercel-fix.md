# 修复 Vercel 404 错误

## 已修复的问题

1. ✅ 更新了 `vercel.json` 配置
   - 添加了 `rewrites` 规则，确保所有路由都指向 `index.html`（SPA 应用需要）
   - 修复了构建命令
   - 添加了缓存控制头

2. ✅ 改进了 `inject-env.js`
   - 添加了错误处理，避免构建失败
   - 支持更新已存在的环境变量

## 下一步操作

### 1. 提交更改到 GitHub

```bash
git add vercel.json inject-env.js
git commit -m "Fix Vercel 404 error - update configuration"
git push
```

### 2. 在 Vercel 中重新部署

有两种方式：

**方式 A: 自动重新部署**
- Vercel 会自动检测到 GitHub 的推送
- 等待自动部署完成（通常 1-2 分钟）

**方式 B: 手动触发重新部署**
1. 访问 Vercel Dashboard
2. 进入你的项目
3. 点击 "Deployments" 标签
4. 找到最新的部署，点击 "..." → "Redeploy"

### 3. 检查 Vercel 项目设置

确保在 Vercel 项目设置中：

1. **General Settings**:
   - Framework Preset: **Other** 或 **None**
   - Build Command: `node inject-env.js` 或留空
   - Output Directory: `.` 或留空
   - Install Command: 留空

2. **Environment Variables**:
   - `SUPABASE_URL` = 你的 Supabase URL
   - `SUPABASE_ANON_KEY` = 你的 Supabase anon key

### 4. 验证修复

部署完成后：
1. 访问你的 Vercel 链接
2. 应该能看到登录页面，而不是 404
3. 检查浏览器控制台是否有错误

## 如果仍然出现 404

### 检查清单

- [ ] 确认 `index.html` 在项目根目录
- [ ] 确认 Vercel 项目设置中的 Output Directory 是 `.` 或留空
- [ ] 确认环境变量已正确设置
- [ ] 查看 Vercel 部署日志，检查是否有错误

### 查看部署日志

1. 在 Vercel Dashboard 中进入你的项目
2. 点击最新的部署
3. 查看 "Build Logs" 和 "Function Logs"
4. 检查是否有错误信息

### 常见问题

**问题**: 构建失败
- **解决**: 检查 `inject-env.js` 是否有语法错误
- **解决**: 确保 Node.js 版本兼容（Vercel 默认使用 Node.js 18+）

**问题**: 环境变量未注入
- **解决**: 确认在 Vercel 项目设置中添加了环境变量
- **解决**: 重新部署项目

**问题**: 静态文件 404
- **解决**: 确认所有文件都在项目根目录
- **解决**: 检查文件路径是否正确

## 测试本地构建

在本地测试构建过程：

```bash
# 设置环境变量（临时）
$env:SUPABASE_URL="your_url"
$env:SUPABASE_ANON_KEY="your_key"

# 运行构建脚本
node inject-env.js

# 检查 index.html 是否包含环境变量
# 应该能看到 window.SUPABASE_URL 和 window.SUPABASE_ANON_KEY
```

## 需要帮助？

如果问题仍然存在，请提供：
1. Vercel 部署日志
2. 浏览器控制台错误信息
3. 具体的 404 页面 URL

