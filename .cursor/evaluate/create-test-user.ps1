# PowerShell 脚本：创建 Supabase 测试账号
# 使用 Supabase Management API 或通过 Dashboard 指导

Write-Host "=== 创建 Supabase 测试账号 ===" -ForegroundColor Green
Write-Host ""

$testEmail = "haidagy@gmail.com"
$testPassword = "1112crimsonGY"

Write-Host "测试账号信息:" -ForegroundColor Cyan
Write-Host "  邮箱: $testEmail" -ForegroundColor Yellow
Write-Host "  密码: $testPassword" -ForegroundColor Yellow
Write-Host ""

Write-Host "方式 1: 使用 Node.js 脚本（推荐）" -ForegroundColor Cyan
Write-Host "  运行: npm run create-test-user" -ForegroundColor Yellow
Write-Host "  或: node create-test-user.js" -ForegroundColor Yellow
Write-Host ""

Write-Host "方式 2: 通过 Supabase Dashboard" -ForegroundColor Cyan
Write-Host "  1. 打开 https://supabase.com/dashboard" -ForegroundColor Yellow
Write-Host "  2. 选择你的项目" -ForegroundColor Yellow
Write-Host "  3. 进入 Authentication > Users" -ForegroundColor Yellow
Write-Host "  4. 点击 'Add user' > 'Create new user'" -ForegroundColor Yellow
Write-Host "  5. 输入邮箱: $testEmail" -ForegroundColor Yellow
Write-Host "  6. 输入密码: $testPassword" -ForegroundColor Yellow
Write-Host "  7. 取消勾选 'Auto Confirm User'（如果需要邮箱验证）" -ForegroundColor Yellow
Write-Host "  8. 点击 'Create user'" -ForegroundColor Yellow
Write-Host ""

Write-Host "方式 3: 使用 Supabase CLI" -ForegroundColor Cyan
Write-Host "  supabase auth users create $testEmail --password $testPassword" -ForegroundColor Yellow
Write-Host ""

$openDashboard = Read-Host "是否打开 Supabase Dashboard? (y/n)"
if ($openDashboard -eq "y" -or $openDashboard -eq "Y") {
    Start-Process "https://supabase.com/dashboard"
}

Write-Host ""
Write-Host "提示: 如果使用 Node.js 脚本，请先安装依赖:" -ForegroundColor Yellow
Write-Host "  npm install @supabase/supabase-js" -ForegroundColor Cyan
Write-Host ""

