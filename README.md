# mk2wxhtml4api

Markdown 转微信公众号 HTML 的 API 服务

> 大致效果：
> 
> <img width="746" height="892" alt="image" src="https://github.com/user-attachments/assets/67a203b9-6700-4874-9191-e7d5a1277102" />


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

## Docker 部署

### 前置条件

确保已安装 Docker：
- Docker Desktop (Windows/Mac)
- Docker Engine (Linux)

### 使用 Docker 部署

**1. 构建镜像**
```bash
docker build -t mk2wxhtml4api:latest .
```

**2. 运行容器**
```bash
docker run -d -p 3002:3000 --name mk2wxhtml4api mk2wxhtml4api:latest
```

服务将在 `http://localhost:3002` 上运行（主机端口 3002 映射到容器端口 3000）

**3. 验证服务**
```bash
curl http://localhost:3002/health
```

**4. 测试转换**
```bash
curl -X POST http://localhost:3002/api/convert/wechat \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello\n\nThis is a test."}'
```

### 使用 Docker Compose（推荐）

**启动服务**
```bash
docker compose up -d
```

**停止服务**
```bash
docker compose down
```

### 环境变量配置

可通过 `-e` 参数传递环境变量：
```bash
docker run -d -p 3002:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  mk2wxhtml4api:latest
```

或在 `docker-compose.yml` 中配置环境变量。

### 查看容器日志

```bash
# 查看运行中容器的日志
docker logs mk2wxhtml4api

# 实时跟踪日志
docker logs -f mk2wxhtml4api
```

### 常见问题

**Q: 如何修改端口？**
A: 修改端口映射 `-p 主机端口:3000`，例如 `-p 8080:3000`

**Q: 容器启动失败怎么办？**
A: 检查容器日志 `docker logs <container_name>` 查看错误信息

**Q: 如何进入容器调试？**
A: 使用 `docker exec -it <container_name> sh` 进入容器

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
