# 教育测评系统

专业的儿童发展与学生评估解决方案

## 📁 项目结构

```
evaluate/
├── index.html                    # 官网首页（项目介绍和导航）
├── child-assessment/             # 儿童发展测评系统
│   ├── index.html               # 系统入口
│   ├── app.js                   # 应用逻辑
│   ├── config.js                # Supabase 配置
│   ├── style.css                # 样式文件
│   └── indicators.json          # 测评指标数据
├── student-evaluation/          # 小学二年级综合评价系统
│   ├── index.html               # 系统入口
│   ├── app.js                   # 应用逻辑
│   ├── styles.css               # 样式文件
│   ├── report-templates.js      # 报告模板
│   └── evaluation-system.html   # 系统说明文档
└── legacy/                      # 历史文件（保留）
```

## 🎯 系统介绍

### 1. 儿童发展测评系统

**入口**: [child-assessment/index.html](child-assessment/index.html)

适用于3-6岁幼儿的综合性发展测评系统。

#### 主要功能：
- 📝 **日常活动记录** - 快速记录孩子的日常表现
- 🤖 **AI智能测评助手** - 对话式测评，智能引导
- 📊 **多维度发展指标评估** - 全面评估儿童发展水平
- 📈 **成长趋势可视化分析** - 追踪孩子的发展轨迹
- 💡 **个性化推荐与建议** - 基于测评结果提供建议

#### 技术栈：
- Supabase（后端数据库和认证）
- Vanilla JavaScript
- 响应式设计

---

### 2. 小学二年级综合评价系统

**入口**: [student-evaluation/index.html](student-evaluation/index.html)

基于2022版新课程标准的小学二年级学生综合素质评价系统。

#### 主要功能：

**五大评价领域：**
- 📚 **学科素养 (50%)** - 语文、数学、英语三科的详细评价
- 🌟 **品德发展 (20%)** - 行为规范、责任意识、友善合作、诚实守信
- 💪 **身心健康 (15%)** - 体质健康、运动兴趣、心理适应
- 🎨 **审美素养 (10%)** - 艺术感知、表达创作、审美体验
- 🔨 **劳动实践 (5%)** - 日常生活劳动、集体劳动

**评价工具包：**
- 📊 课堂发言热力图 - 记录学生发言次数
- 🔍 作业显微镜评价表 - 检查书写质量
- 👥 小组合作贡献值 - 记录合作表现
- 📖 家庭阅读打卡 - 记录阅读情况

**报告系统：**
- 📋 学期初诊断报告
- 📈 学期中期报告
- 🎯 学期末总结报告

#### 技术栈：
- Chart.js（数据可视化）
- Vanilla JavaScript
- 响应式设计

---

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd evaluate
   ```

2. **配置 Supabase（仅儿童测评系统需要）**
   - 编辑 `child-assessment/config.js`
   - 填入你的 Supabase URL 和 Anon Key

3. **启动本地服务器**
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 或使用 Node.js
   npx http-server
   
   # 或使用 VS Code Live Server
   ```

4. **访问系统**
   - 官网首页: `http://localhost:8000/`
   - 儿童测评系统: `http://localhost:8000/child-assessment/`
   - 学生评估系统: `http://localhost:8000/student-evaluation/`

---

## 📝 使用说明

### 儿童发展测评系统

1. 访问系统后，使用邮箱和密码登录
2. 填写学生基本信息（姓名、性别、出生日期等）
3. 在"日常活动记录"页面记录孩子的活动
4. 点击"完整测评"开始AI对话式测评
5. 查看测评结果和成长趋势分析

### 小学二年级综合评价系统

1. 访问系统后，添加学生信息
2. 选择学生，进入评价界面
3. 在各个评价领域进行评价记录
4. 使用评价工具包辅助评价
5. 生成和查看评价报告

---

## 🔧 技术细节

### 数据存储

- **儿童测评系统**: 使用 Supabase 作为后端，支持用户认证和数据持久化
- **学生评估系统**: 使用浏览器本地存储（localStorage）存储数据

### 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari
- 移动端浏览器

---

## 📄 许可证

本项目仅供学习和研究使用。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系方式

如有问题或建议，请通过 Issue 反馈。
