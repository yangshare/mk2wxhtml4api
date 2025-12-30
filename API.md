# Markdown 转微信公众号 HTML API 文档

## 概述

本 API 将 Markdown 文本转换为适用于微信公众号文章的 HTML 格式。

**基础 URL:** `http://localhost:3000`

## 接口列表

### 健康检查

检查 API 服务器是否正常运行。

**请求:**
```
GET /health
```

**响应 (200 OK):**
```json
{
  "status": "ok",
  "timestamp": 1703920800000
}
```

### 转换 Markdown 为微信公众号 HTML

将 Markdown 文本转换为微信公众号兼容的 HTML。

**请求:**
```
POST /api/convert/wechat
Content-Type: application/json
```

**请求体:**
```json
{
  "markdown": "# Hello World\n\nThis is **bold** text."
}
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| markdown | string | 是 | 要转换的 Markdown 文本（最大 5MB） |

**响应 (200 OK):**
```json
{
  "success": true,
  "data": {
    "html": "<section>...</section>",
    "meta": {
      "timestamp": 1703920800000
    }
  }
}
```

**响应 (400 Bad Request) - 输入无效:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Input validation failed",
    "details": ["markdown field is required and cannot be empty"]
  }
}
```

**响应 (413 Payload Too Large):**
```json
{
  "success": false,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request payload exceeds the 5MB limit"
  }
}
```

**响应 (429 Too Many Requests):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 30
  }
}
```

**响应 (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred"
  }
}
```

## 错误码

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| INVALID_INPUT | 400 | 请求体验证失败 |
| INVALID_JSON | 400 | 请求体 JSON 格式无效 |
| PAYLOAD_TOO_LARGE | 413 | 请求超过 5MB 大小限制 |
| RATE_LIMIT_EXCEEDED | 429 | 超出速率限制（100 次/分钟） |
| NOT_FOUND | 404 | 接口不存在 |
| XSS_DETECTED | 400 | 检测到潜在的不安全内容 |
| TEMPLATE_NOT_FOUND | 500 | 样式模板文件缺失 |
| CONVERSION_ERROR | 500 | Markdown 转换失败 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 速率限制

- **限制:** 每个 IP 地址每分钟 100 次请求
- **响应:** HTTP 429，附带 `Retry-After` 头部表示等待秒数

## 安全性

- **XSS 防护:** 所有 HTML 输出均通过 `sanitize-html` 进行净化
- **输入验证:** 请求大小限制为 5MB
- **内容过滤:** 移除危险的标签和属性

## 缓存

- 转换结果缓存 5 分钟
- 缓存键基于输入内容哈希生成
- 自动过期和刷新

## 使用示例

### cURL
```bash
curl -X POST http://localhost:3000/api/convert/wechat \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is **bold** text."
  }'
```

### JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/convert/wechat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# Hello World\n\nThis is **bold** text.'
  })
});
const data = await response.json();
console.log(data.data.html);
```

### Python
```python
import requests

response = requests.post('http://localhost:3000/api/convert/wechat', json={
    'markdown': '# Hello World\n\nThis is **bold** text.'
})
data = response.json()
print(data['data']['html'])
```

## 运行服务

### 安装依赖

```bash
pnpm install
```

### 启动服务

```bash
pnpm start
```

开发模式（自动重载）：

```bash
pnpm dev
```

服务默认运行在端口 3000（可通过 `PORT` 环境变量配置）。
