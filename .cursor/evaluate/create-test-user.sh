#!/bin/bash
# Bash 脚本：创建 Supabase 测试账号

echo "=== 创建 Supabase 测试账号 ==="
echo ""

TEST_EMAIL="haidagy@gmail.com"
TEST_PASSWORD="1112crimsonGY"

echo "测试账号信息:"
echo "  邮箱: $TEST_EMAIL"
echo "  密码: $TEST_PASSWORD"
echo ""

echo "方式 1: 使用 Node.js 脚本（推荐）"
echo "  运行: npm run create-test-user"
echo "  或: node create-test-user.js"
echo ""

echo "方式 2: 通过 Supabase Dashboard"
echo "  1. 打开 https://supabase.com/dashboard"
echo "  2. 选择你的项目"
echo "  3. 进入 Authentication > Users"
echo "  4. 点击 'Add user' > 'Create new user'"
echo "  5. 输入邮箱: $TEST_EMAIL"
echo "  6. 输入密码: $TEST_PASSWORD"
echo "  7. 取消勾选 'Auto Confirm User'（如果需要邮箱验证）"
echo "  8. 点击 'Create user'"
echo ""

echo "方式 3: 使用 Supabase CLI"
echo "  supabase auth users create $TEST_EMAIL --password $TEST_PASSWORD"
echo ""

read -p "是否打开 Supabase Dashboard? (y/n): " open_dashboard
if [ "$open_dashboard" = "y" ] || [ "$open_dashboard" = "Y" ]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://supabase.com/dashboard"
    elif command -v open &> /dev/null; then
        open "https://supabase.com/dashboard"
    else
        echo "请手动访问: https://supabase.com/dashboard"
    fi
fi

echo ""
echo "提示: 如果使用 Node.js 脚本，请先安装依赖:"
echo "  npm install @supabase/supabase-js"
echo ""

