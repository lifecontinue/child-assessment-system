# Vercel 环境变量配置指南

## ✅ Supabase 配置信息

你的 Supabase 配置：
- **Project URL**: `https://nmkjzhqonmdyghydvdyy.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta2p6aHFvbm1keWdoeWR2ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDE1NzYsImV4cCI6MjA3ODUxNzU3Nn0.HKcwvEzCjocdGl-jAF0imGCwhDtjh1iqR2N5tNrvubY`

## 📋 在 Vercel 中配置环境变量

### 步骤 1: 进入 Vercel 项目设置

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到并点击你的项目 `child-assessment-system`
3. 点击 **"Settings"** 标签
4. 在左侧菜单中点击 **"Environment Variables"**

### 步骤 2: 添加环境变量

点击 **"Add New"** 按钮，添加以下两个环境变量：

#### 变量 1: SUPABASE_URL
- **Key**: `SUPABASE_URL`
- **Value**: `https://nmkjzhqonmdyghydvdyy.supabase.co`
- **Environment**: 选择所有环境（Production, Preview, Development）
- 点击 **"Save"**

#### 变量 2: SUPABASE_ANON_KEY
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta2p6aHFvbm1keWdoeWR2ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDE1NzYsImV4cCI6MjA3ODUxNzU3Nn0.HKcwvEzCjocdGl-jAF0imGCwhDtjh1iqR2N5tNrvubY`
- **Environment**: 选择所有环境（Production, Preview, Development）
- 点击 **"Save"**

### 步骤 3: 重新部署

环境变量添加后，需要重新部署才能生效：

1. 在项目页面点击 **"Deployments"** 标签
2. 找到最新的部署
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 确认重新部署

或者，你可以：
- 推送一个小的更改到 GitHub（Vercel 会自动重新部署）
- 或者等待下次自动部署

## ✅ 验证配置

部署完成后：

1. 访问你的 Vercel 应用链接
2. 打开浏览器开发者工具（F12）
3. 在 Console 中检查是否有 Supabase 连接错误
4. 尝试注册/登录功能
5. 测试数据保存功能

## 🔍 检查环境变量是否生效

### 方法 1: 查看构建日志

1. 在 Vercel Dashboard 中进入你的项目
2. 点击最新的部署
3. 查看 "Build Logs"
4. 应该能看到 `inject-env.js` 的执行日志

### 方法 2: 检查 HTML 源码

1. 访问部署的应用
2. 右键 → "查看页面源代码"
3. 搜索 `window.SUPABASE_URL`
4. 应该能看到环境变量已注入

## ⚠️ 重要提示

1. **安全性**: Anon Key 是公开的，但通过 RLS (Row Level Security) 保护数据安全
2. **环境变量优先级**: 
   - Vercel 环境变量（最高优先级）
   - `config.js` 中的默认值（仅用于开发）
3. **不要提交敏感信息**: 虽然 anon key 可以公开，但建议使用环境变量管理

## 🆘 如果环境变量未生效

1. **检查环境变量名称**: 确保大小写完全匹配
2. **检查环境选择**: 确保选择了正确的环境（Production/Preview/Development）
3. **重新部署**: 环境变量添加后必须重新部署
4. **查看构建日志**: 检查是否有错误信息

## 📝 当前配置状态

✅ `config.js` 已更新，包含你的 Supabase 配置（作为默认值）
✅ 本地开发可以直接使用（无需环境变量）
✅ 生产环境需要在 Vercel 中配置环境变量

## 🚀 下一步

1. ✅ 在 Vercel 中添加环境变量
2. ✅ 重新部署应用
3. ✅ 测试应用功能
4. ✅ 确认 Supabase 连接正常

