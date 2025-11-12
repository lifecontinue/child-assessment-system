#!/bin/bash
# GitHub 同步脚本
# 使用方法：在项目目录中运行此脚本

echo "=== 同步项目到 GitHub ==="
echo ""

# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    git init
fi

# 添加所有文件
echo "添加文件到暂存区..."
git add .

# 创建提交
echo "创建提交..."
git commit -m "Initial commit: 儿童发展测评系统"

# 提示用户创建 GitHub 仓库
echo ""
echo "✓ 本地提交已完成！"
echo ""
echo "下一步："
echo "1. 访问 https://github.com 创建新仓库"
echo "2. 复制仓库 URL（例如：https://github.com/用户名/仓库名.git）"
echo "3. 运行以下命令连接并推送："
echo ""
echo "   git remote add origin <你的仓库URL>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

