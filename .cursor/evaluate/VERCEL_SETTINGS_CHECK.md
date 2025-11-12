# Vercel 项目设置检查清单

## ⚠️ 重要：检查 Vercel 项目设置

如果重新部署后仍然 404，很可能是 Vercel 项目设置不正确。

## 📋 必须检查的设置

### 1. 进入项目设置

1. Vercel Dashboard → 你的项目 `child-assessment-system`
2. 点击 **"Settings"** 标签
3. 点击左侧的 **"General"**

### 2. 检查以下设置

#### Framework Preset
- ✅ 应该选择：**"Other"** 或 **"None"**
- ❌ 不要选择：React, Vue, Next.js 等

#### Build Command
- ✅ 应该填写：`node inject-env.js`
- ✅ 或者留空（如果不需要构建）

#### Output Directory
- ✅ 应该填写：`.`（一个点）
- ✅ 或者留空
- ❌ 不要填写：`dist`, `build`, `public` 等

#### Install Command
- ✅ 应该留空
- ❌ 不要填写任何内容

#### Root Directory
- ✅ 应该填写：`.`（一个点）
- ✅ 或者留空

### 3. 如果设置不正确

1. 修改设置
2. 点击 **"Save"**
3. 重新部署项目

## 🔍 检查部署日志

### 查看构建日志

1. 进入项目 → **"Deployments"**
2. 点击最新的部署
3. 查看 **"Build Logs"**

### 应该看到的内容

成功的构建日志应该包含：
```
✓ 环境变量已注入到 index.html
构建完成
```

### 如果看到错误

常见错误：
- `Cannot find module` - 检查文件路径
- `ENOENT: no such file` - 检查文件是否存在
- `Build failed` - 检查构建命令

## 🚨 如果仍然 404

### 尝试完全简化的配置

我已经简化了 `vercel.json`，现在只包含最基本的 rewrites 规则。

### 手动测试

1. 在 Vercel Dashboard 中
2. 进入项目 → Settings → General
3. **删除** Build Command（留空）
4. **删除** Output Directory（留空）
5. 保存设置
6. 重新部署

### 检查文件是否被部署

1. 在部署日志中查看
2. 应该能看到所有文件被上传
3. 确认 `index.html` 在文件列表中

## 📝 当前 vercel.json（已简化）

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

这是最简单的配置，应该能工作。

## 🔧 备选方案：不使用 vercel.json

如果 `vercel.json` 有问题，可以：

1. 删除 `vercel.json` 文件
2. 在 Vercel 项目设置中：
   - Framework Preset: **Other**
   - 其他设置留空
3. 重新部署

Vercel 会自动检测静态文件并服务。

