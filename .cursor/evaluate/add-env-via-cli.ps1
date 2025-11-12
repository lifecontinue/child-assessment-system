# PowerShell 脚本：使用 Vercel CLI 添加环境变量

Write-Host "=== 使用 Vercel CLI 添加环境变量 ===" -ForegroundColor Green
Write-Host ""

# 检查是否安装了 Vercel CLI
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "正在安装 Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# 登录（如果需要）
Write-Host "检查登录状态..." -ForegroundColor Cyan
vercel whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "需要登录..." -ForegroundColor Yellow
    vercel login
}

Write-Host ""
Write-Host "添加 SUPABASE_URL..." -ForegroundColor Cyan
Write-Host "当提示输入值时，粘贴: https://nmkjzhqonmdyghydvdyy.supabase.co" -ForegroundColor Yellow
vercel env add SUPABASE_URL production

Write-Host ""
Write-Host "添加 SUPABASE_ANON_KEY..." -ForegroundColor Cyan
Write-Host "当提示输入值时，粘贴完整的 anon key" -ForegroundColor Yellow
vercel env add SUPABASE_ANON_KEY production

Write-Host ""
Write-Host "✓ 环境变量添加完成！" -ForegroundColor Green
Write-Host "现在需要重新部署项目才能生效。" -ForegroundColor Yellow

