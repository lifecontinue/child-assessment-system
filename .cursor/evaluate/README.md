# 儿童发展测评系统

一个基于 Web 的儿童发展测评系统，支持用户注册、登录、记录和评估儿童发展指标。

## 功能特性

- 🔐 用户认证（邮箱/密码 + GitHub OAuth）
- 📝 日常活动记录
- 📋 完整测评系统
- 📊 评估记录查看
- 📈 趋势分析
- 💾 数据持久化（Supabase + localStorage 后备）

## 技术栈

- 前端：HTML5, CSS3, JavaScript (ES6+)
- 后端：Supabase (PostgreSQL + Auth + Storage)
- 部署：Vercel
- OAuth：GitHub

## 快速开始

### 1. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 获取项目 URL 和 anon key（在项目设置 > API）
3. 在 Supabase SQL Editor 中执行以下 SQL 创建表结构：

```sql
-- 学生信息表
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT,
    birth_date DATE,
    height NUMERIC,
    weight NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 测评记录表
CREATE TABLE assessments (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    student_id TEXT,
    results JSONB NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日常记录表
CREATE TABLE daily_records (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    activity TEXT NOT NULL,
    indicators TEXT[],
    results JSONB NOT NULL,
    student_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_daily_records_user_id ON daily_records(user_id);
```

4. 在 Supabase 项目设置中启用 GitHub OAuth：
   - 进入 Authentication > Providers
   - 启用 GitHub
   - 配置 GitHub OAuth App（需要 Client ID 和 Secret）

### 2. 配置环境变量

1. 复制 `.env.example` 为 `.env`（本地开发）或在 Vercel 中设置环境变量
2. 填入你的 Supabase URL 和 anon key

### 3. 本地开发

```bash
# 使用简单的 HTTP 服务器
npx serve .

# 或使用 Python
python -m http.server 8000
```

访问 `http://localhost:8000`

### 4. 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Vercel 项目设置中添加环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. 部署完成！

## 配置说明

### Supabase 配置

在 `config.js` 中，环境变量会通过 `window.SUPABASE_URL` 和 `window.SUPABASE_ANON_KEY` 注入。

在 Vercel 中，可以通过以下方式注入：

1. 在 Vercel 项目设置中添加环境变量
2. 在构建时通过 `vercel.json` 或构建脚本注入到 HTML

或者直接在 `config.js` 中硬编码（不推荐用于生产环境）。

## 页面流程

1. **登录/注册页面** (`authScreen`)
   - 邮箱/密码注册和登录
   - GitHub OAuth 登录

2. **日常记录页面** (`dailyRecordScreen`)
   - 快速活动选择
   - 活动描述和分析
   - 指标匹配和记录

3. **测评页面** (`assessmentScreen`)
   - 对话式测评流程
   - 进度跟踪

4. **记录查看页面** (`assessmentRecordsScreen`)
   - 查看历史测评记录

5. **趋势分析页面** (`multiAnalysisScreen`)
   - 多次测评对比分析

## 数据存储

- **Supabase 模式**：数据存储在 Supabase PostgreSQL 数据库中
- **本地模式**：如果 Supabase 未配置，自动降级到 localStorage

## 安全说明

- Supabase anon key 是公开的，但通过 Row Level Security (RLS) 保护数据
- 建议在 Supabase 中配置 RLS 策略，确保用户只能访问自己的数据

## 许可证

MIT

