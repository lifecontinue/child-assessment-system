# 测试账号信息

## ✅ 账号创建成功

测试账号已成功创建在 Supabase 中。

### 账号信息

- **邮箱**: `haidagy@gmail.com`
- **密码**: `1112crimsonGY`
- **用户 ID**: `78bf9ea8-e491-46cb-8e51-086ea24eb422`

### 使用说明

1. **登录应用**
   - 打开应用
   - 在登录页面输入邮箱和密码
   - 点击登录

2. **邮箱验证（如需要）**
   - 如果提示需要验证邮箱，可以：
     - 在 Supabase Dashboard > Authentication > Users 中手动验证
     - 或检查邮箱收件箱（如果配置了邮件发送）

3. **测试功能**
   - ✅ 用户登录/注册
   - ✅ 学生信息管理
   - ✅ 测评记录
   - ✅ 日常记录
   - ✅ 数据持久化

### 快速登录

在应用登录页面使用：
- **邮箱**: `haidagy@gmail.com`
- **密码**: `1112crimsonGY`

### 注意事项

⚠️ **邮箱验证**: 账号可能需要邮箱验证。如果无法登录：
1. 检查 Supabase Dashboard > Authentication > Users
2. 找到该用户，点击编辑
3. 确认邮箱已验证，或手动验证

### 重新创建账号

如果需要重新创建，运行：
```bash
npm run create-test-user
```

或使用脚本：
```bash
node create-test-user.js
```

### 相关文件

- `create-test-user.js` - Node.js 创建脚本
- `create-test-user.ps1` - PowerShell 脚本
- `create-test-user.sh` - Bash 脚本

