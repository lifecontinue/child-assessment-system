#!/bin/bash
# 使用 Vercel CLI 添加环境变量的脚本

echo "=== 使用 Vercel CLI 添加环境变量 ==="
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 登录（如果需要）
echo "检查登录状态..."
vercel whoami || vercel login

echo ""
echo "添加 SUPABASE_URL..."
vercel env add SUPABASE_URL production
echo "输入值: https://nmkjzhqonmdyghydvdyy.supabase.co"

echo ""
echo "添加 SUPABASE_ANON_KEY..."
vercel env add SUPABASE_ANON_KEY production
echo "输入值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta2p6aHFvbm1keWdoeWR2ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDE1NzYsImV4cCI6MjA3ODUxNzU3Nn0.HKcwvEzCjocdGl-jAF0imGCwhDtjh1iqR2N5tNrvubY"

echo ""
echo "✓ 环境变量添加完成！"
echo "现在需要重新部署项目才能生效。"

