-- Supabase 数据库表结构
-- 在 Supabase SQL Editor 中执行此脚本

-- 用户配置文件表（扩展 auth.users 表）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学生信息表
CREATE TABLE IF NOT EXISTS students (
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
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    student_id TEXT,
    results JSONB NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日常记录表
CREATE TABLE IF NOT EXISTS daily_records (
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
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_records_user_id ON daily_records(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date DESC);

-- 启用 Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户配置文件
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS 策略：学生信息表
CREATE POLICY "Users can view own students" ON students
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own students" ON students
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own students" ON students
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments" ON assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily_records" ON daily_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_records" ON daily_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_records" ON daily_records
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建函数：自动创建用户配置文件
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：新用户注册时自动创建配置文件
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 开发环境辅助：自动确认邮箱（仅用于开发/测试，不建议生产环境启用）
-- 如需禁用，请注释或删除以下函数与触发器
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_user_email();

-- 维护更新时间戳（students.updated_at）
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

