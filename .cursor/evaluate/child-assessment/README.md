# 儿童发展测评系统

## DeepSeek API 配置

系统支持使用 DeepSeek API 生成 AI 总结。要启用此功能，需要配置 API Key。

### 配置方法

#### 方法 1：在浏览器控制台配置（临时）

1. 打开浏览器开发者工具（F12）
2. 在控制台（Console）中输入：
```javascript
window.DEEPSEEK_API_KEY = '你的-DeepSeek-API-Key';
```
3. 刷新页面

#### 方法 2：修改 config.js（永久）

编辑 `config.js` 文件，找到 `DEEPSEEK_CONFIG` 部分：

```javascript
const DEEPSEEK_CONFIG = {
    apiKey: w.DEEPSEEK_API_KEY || fromProcess('DEEPSEEK_API_KEY') || '你的-DeepSeek-API-Key',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
};
```

将 `'你的-DeepSeek-API-Key'` 替换为你的实际 API Key。

#### 方法 3：使用环境变量（推荐用于生产环境）

在生产环境中，可以通过环境变量设置：

```bash
DEEPSEEK_API_KEY=你的-DeepSeek-API-Key
```

### 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://www.deepseek.com/)
2. 注册账号并登录
3. 进入 API 管理页面
4. 创建新的 API Key
5. 复制 API Key 并按照上述方法配置

### 功能说明

- **AI 总结生成**：当用户点击"分析"按钮时，系统会调用 DeepSeek API 生成专业的活动总结
- **自动降级**：如果 API Key 未配置或 API 调用失败，系统会自动使用简单的文本生成作为后备方案
- **加载状态**：生成总结时会显示加载提示

### 注意事项

⚠️ **安全提示**：
- 不要将 API Key 提交到公开的代码仓库
- 在生产环境中，建议使用环境变量或服务器端代理来保护 API Key
- API Key 有使用限制，请注意控制调用频率

