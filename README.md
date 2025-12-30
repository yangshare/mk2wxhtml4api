# mk2wxhtml4api

Markdown 转微信公众号 HTML 的 API 服务

## 功能特点

- ✅ 将 Markdown 文本转换为微信公众号适配的 HTML
- ✅ 自动应用微信公众号样式模板
- ✅ XSS 防护和 HTML 安全过滤
- ✅ 输入验证和错误处理
- ✅ 请求频率限制（100 次/分钟）
- ✅ 响应缓存机制（5 分钟）
- ✅ RESTful API 设计

## 快速开始

### 安装依赖

使用 pnpm：
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

服务默认运行在 `http://localhost:3000`

## API 使用

### 转换 Markdown 到微信公众号 HTML

```bash
curl -X POST http://localhost:3000/api/convert/wechat \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 标题\n\n这是**粗体**文字。"
  }'
```

响应示例：
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

## 项目结构

```
mk2wxhtml4api/
├── src/
│   ├── server.js           # Express 服务器
│   ├── routes/
│   │   └── convert.js      # API 路由
│   ├── services/
│   │   └── converter.js    # Markdown 转换服务
│   └── middleware/
│       └── rateLimiter.js  # 速率限制中间件
├── temp/
│   └── 样式模板.html        # 微信样式模板
├── openspec/               # OpenSpec 规范
├── API.md                  # API 详细文档
└── package.json
```

## 配置

环境变量：
- `PORT` - 服务端口（默认：3000）
- `NODE_ENV` - 运行环境（development/production）

## 错误码

| 错误码 | 说明 |
|--------|------|
| INVALID_INPUT | 输入验证失败 |
| PAYLOAD_TOO_LARGE | 请求体超过 5MB 限制 |
| RATE_LIMIT_EXCEEDED | 超出速率限制 |
| XSS_DETECTED | 检测到不安全内容 |
| INTERNAL_ERROR | 服务器内部错误 |

详细 API 文档请参阅 [API.md](./API.md)

## 开发指南

项目使用 OpenSpec 进行规范驱动开发。查看 `openspec/` 目录了解开发规范。

## 许可证

MIT
