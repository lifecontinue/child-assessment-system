#!/bin/bash
# 使用 Supabase CLI 自动更新数据库

set -e

echo "=== 自动更新 Supabase 数据库 ==="
echo ""

# 检查是否安装了 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "正在安装 Supabase CLI..."
    npm install -g supabase
fi

# 检查是否已登录
echo "检查 Supabase CLI 登录状态..."
if ! supabase projects list &> /dev/null; then
    echo "需要登录 Supabase..."
    supabase login
fi

# 读取项目引用
read -p "请输入 Supabase 项目引用 (project ref): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "错误: 项目引用不能为空"
    exit 1
fi

# 检查 SQL 文件是否存在
SQL_FILE="supabase-setup.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "错误: 找不到 $SQL_FILE 文件"
    exit 1
fi

echo ""
echo "正在执行 SQL 更新..."
echo "项目引用: $PROJECT_REF"
echo ""

# 使用 Supabase CLI 执行 SQL
# 注意：Supabase CLI 需要通过 db push 或直接执行 SQL
# 这里使用 supabase db execute 命令（如果可用）

# 方法1: 使用 supabase db execute (需要 CLI 支持)
if supabase db execute --help &> /dev/null; then
    supabase db execute --project-ref "$PROJECT_REF" --file "$SQL_FILE"
else
    # 方法2: 使用 supabase db push (迁移方式)
    echo "使用迁移方式更新数据库..."
    
    # 创建临时迁移文件
    MIGRATIONS_DIR="supabase/migrations"
    mkdir -p "$MIGRATIONS_DIR"
    
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    MIGRATION_FILE="$MIGRATIONS_DIR/${TIMESTAMP}_setup.sql"
    cp "$SQL_FILE" "$MIGRATION_FILE"
    
    echo "已创建迁移文件: $MIGRATION_FILE"
    echo ""
    echo "请手动执行以下命令:"
    echo "  supabase db push --project-ref $PROJECT_REF"
    echo ""
    echo "或者直接在 Supabase Dashboard > SQL Editor 中执行 $SQL_FILE"
fi

echo ""
echo "✓ 完成！"
echo ""
echo "提示: 如果自动执行失败，请："
echo "1. 在 Supabase Dashboard > SQL Editor 中手动执行 supabase-setup.sql"
echo "2. 或使用: supabase db push --project-ref $PROJECT_REF"

