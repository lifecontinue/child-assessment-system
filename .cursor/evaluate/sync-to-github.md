# 同步项目到 GitHub 的步骤

## 方法一：使用命令行（推荐）

### 步骤 1: 初始化 Git 仓库（如果还没有）

在项目目录中打开终端，运行：

```bash
# 检查是否已经是 Git 仓库
git status

# 如果不是，初始化
git init
```

### 步骤 2: 添加所有文件

```bash
# 添加所有文件到暂存区
git add .

# 查看将要提交的文件
git status
```

### 步骤 3: 创建初始提交

```bash
git commit -m "Initial commit: 儿童发展测评系统"
```

### 步骤 4: 在 GitHub 创建仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `child-assessment-system` (或你喜欢的名字)
   - Description: `儿童发展测评系统 - 支持用户注册、登录、记录和评估儿童发展指标`
   - Visibility: Public 或 Private（根据你的需要）
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 "Create repository"

### 步骤 5: 连接本地仓库到 GitHub

GitHub 创建仓库后会显示命令，类似这样：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 或者使用 SSH（如果你配置了 SSH key）
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

### 步骤 6: 推送到 GitHub

```bash
# 重命名分支为 main（如果当前是 master）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

## 方法二：使用 GitHub Desktop（图形界面）

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 打开 GitHub Desktop
3. File → Add Local Repository
4. 选择项目文件夹
5. 如果提示初始化，点击 "create a repository"
6. 填写提交信息，点击 "Commit to main"
7. 点击 "Publish repository"
8. 填写仓库名称和描述
9. 点击 "Publish Repository"

## 方法三：使用 VS Code 的 Git 功能

1. 在 VS Code 中打开项目
2. 点击左侧的源代码管理图标（或按 Ctrl+Shift+G）
3. 点击 "Initialize Repository"
4. 点击 "+" 添加所有文件
5. 输入提交信息，点击 "✓ Commit"
6. 点击 "..." → "Publish Branch"
7. 在 GitHub 上创建仓库并推送

## 验证同步

推送成功后，访问你的 GitHub 仓库页面，应该能看到所有文件。

## 后续更新

当你修改代码后，使用以下命令同步：

```bash
git add .
git commit -m "描述你的更改"
git push
```

## 常见问题

### 如果遇到认证问题

如果推送时要求输入用户名和密码：
- 使用 Personal Access Token 代替密码
- 或者配置 SSH key

### 如果文件太大

某些 Excel 文件可能较大，如果不需要提交，可以在 `.gitignore` 中添加：
```
*.xlsx
*.xls
```

然后运行：
```bash
git rm --cached *.xlsx
git commit -m "Remove Excel files from tracking"
```

