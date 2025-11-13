# 部署就绪检查清单

## ✅ 代码修复完成

### 1. 数据库关联修复
- ✅ 修复了 `student_id` 类型兼容性（支持 BIGINT）
- ✅ 实现了手动关联查询（避免 Supabase 关联查询语法问题）
- ✅ 更新了所有涉及学生关联的组件

### 2. 类型定义更新
- ✅ `Student.id` 支持 `number | string`（兼容 BIGINT 和 UUID）
- ✅ `EvaluationForm.studentId` 支持 `number | string`
- ✅ 所有学生 ID 相关的函数参数已更新

### 3. 数据查询优化
- ✅ Dashboard：手动关联学生信息
- ✅ 学科评价页面：手动关联学生信息
- ✅ 综合素质评价页面：手动关联学生信息
- ✅ 报告页面：手动关联学生信息

## 🧪 测试清单

### 基础功能测试

#### 1. 学生管理
```bash
# 测试步骤：
1. 访问 /students
2. 点击"添加学生"
3. 填写姓名、学号、班级
4. 保存
5. 验证学生出现在列表中
6. 点击"编辑"，修改信息
7. 点击"删除"，确认删除
```

**预期结果**：
- ✅ 能成功添加学生
- ✅ 学生信息正确保存
- ✅ 编辑功能正常
- ✅ 删除功能正常

#### 2. 评价功能
```bash
# 测试步骤：
1. 访问 /subject-assessment
2. 选择学生
3. 选择学科（语文/数学/英语）
4. 填写评价指标
5. 选择星级
6. 填写评价证据
7. 提交
```

**预期结果**：
- ✅ 评价记录成功保存
- ✅ 评价记录出现在列表中
- ✅ 学生姓名正确显示

#### 3. Dashboard
```bash
# 测试步骤：
1. 访问首页 /
2. 检查各个卡片是否正常显示
3. 检查数据是否正确加载
```

**预期结果**：
- ✅ 今日评价任务显示
- ✅ 雷达图正常渲染
- ✅ 关注学生列表显示
- ✅ 最近评价记录显示（含学生姓名）
- ✅ 评价进度条正常

#### 4. 发言热力图
```bash
# 测试步骤：
1. 访问 /heatmap
2. 点击学生座位
3. 观察颜色变化
4. 刷新页面，验证数据持久化
```

**预期结果**：
- ✅ 点击后计数增加
- ✅ 颜色正确变化（灰色→黄色→橙色）
- ✅ 数据保存到数据库
- ✅ 刷新后数据保留

## 🔍 数据库验证

### 检查表结构

```sql
-- 1. 检查 students 表是否有必要字段
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('id', 'name', 'student_number', 'class');

-- 2. 检查 evaluation_records 表
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'evaluation_records';

-- 3. 检查外键约束
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('evaluation_records', 'reports');
```

### 测试数据插入

```sql
-- 插入测试学生
INSERT INTO students (name, student_number, class) VALUES
('测试学生1', 'TEST001', '二年1班'),
('测试学生2', 'TEST002', '二年1班')
ON CONFLICT DO NOTHING;

-- 插入测试评价记录
INSERT INTO evaluation_records (
  student_id, week_number, domain, indicator_code, star_rating, evidence
) 
SELECT 
  id, 1, '学科素养', '语文_测试', 2, '测试评价证据'
FROM students 
WHERE name = '测试学生1'
LIMIT 1;
```

## 🚀 部署前检查

### 环境变量
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 已配置
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已配置（仅用于 API 路由）

### 数据库
- [ ] 所有表已创建
- [ ] RLS 策略已设置
- [ ] 预置数据已插入
- [ ] 外键约束正确

### 代码
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] 所有页面可正常访问
- [ ] 数据查询正常

### 功能
- [ ] 学生管理功能正常
- [ ] 评价功能正常
- [ ] Dashboard 数据正常显示
- [ ] 发言热力图正常
- [ ] 报告生成功能正常

## 📝 已知问题和解决方案

### 问题 1：关联查询语法
**问题**：Supabase 的关联查询语法在不同版本可能不同

**解决方案**：使用手动关联方式，先查询主表，再批量查询关联表，然后在前端合并

### 问题 2：student_id 类型
**问题**：students.id 是 BIGINT，但代码中可能传递字符串

**解决方案**：在插入前统一转换为数字类型

### 问题 3：RLS 策略
**问题**：如果 RLS 策略过于严格，可能无法查询数据

**解决方案**：
- 开发环境可以临时禁用 RLS
- 生产环境确保 teacher_profiles 表有正确的记录

## 🎯 下一步

1. **运行测试**：按照测试清单逐一测试功能
2. **修复问题**：如有问题，参考 TESTING.md 排查
3. **部署到 Vercel**：确保所有功能正常后部署

## 📚 相关文档

- [README.md](./README.md) - 项目总览
- [TESTING.md](./TESTING.md) - 详细测试指南
- [supabase/schema-merge.sql](./supabase/schema-merge.sql) - 数据库结构

