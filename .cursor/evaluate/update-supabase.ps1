# PowerShell 脚本：使用 Supabase CLI 自动更新数据库

Write-Host "=== 自动更新 Supabase 数据库 ===" -ForegroundColor Green
Write-Host ""

# 检查是否安装了 Supabase CLI
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "正在安装 Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}

# 检查是否已登录
Write-Host "检查 Supabase CLI 登录状态..." -ForegroundColor Cyan
try {
    supabase projects list | Out-Null
} catch {
    Write-Host "需要登录 Supabase..." -ForegroundColor Yellow
    supabase login
}

# 读取项目引用
$PROJECT_REF = Read-Host "请输入 Supabase 项目引用 (project ref)"

if ([string]::IsNullOrEmpty($PROJECT_REF)) {
    Write-Host "错误: 项目引用不能为空" -ForegroundColor Red
    exit 1
}

# 检查 SQL 文件是否存在
$SQL_FILE = "supabase-setup.sql"
if (-not (Test-Path $SQL_FILE)) {
    Write-Host "错误: 找不到 $SQL_FILE 文件" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "正在执行 SQL 更新..." -ForegroundColor Cyan
Write-Host "项目引用: $PROJECT_REF" -ForegroundColor Cyan
Write-Host ""

# 尝试使用 Supabase CLI 执行 SQL
try {
    # 方法1: 使用 supabase db execute (如果支持)
    $helpOutput = supabase db execute --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        supabase db execute --project-ref $PROJECT_REF --file $SQL_FILE
    } else {
        # 方法2: 创建迁移文件
        Write-Host "使用迁移方式更新数据库..." -ForegroundColor Yellow
        
        $MIGRATIONS_DIR = "supabase\migrations"
        if (-not (Test-Path $MIGRATIONS_DIR)) {
            New-Item -ItemType Directory -Path $MIGRATIONS_DIR | Out-Null
        }
        
        $TIMESTAMP = Get-Date -Format "yyyyMMddHHmmss"
        $MIGRATION_FILE = "$MIGRATIONS_DIR\${TIMESTAMP}_setup.sql"
        Copy-Item $SQL_FILE $MIGRATION_FILE
        
        Write-Host "已创建迁移文件: $MIGRATION_FILE" -ForegroundColor Green
        Write-Host ""
        Write-Host "请手动执行以下命令:" -ForegroundColor Yellow
        Write-Host "  supabase db push --project-ref $PROJECT_REF" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "或者直接在 Supabase Dashboard > SQL Editor 中执行 $SQL_FILE" -ForegroundColor Yellow
    }
} catch {
    Write-Host "执行失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动在 Supabase Dashboard > SQL Editor 中执行 $SQL_FILE" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✓ 完成！" -ForegroundColor Green

