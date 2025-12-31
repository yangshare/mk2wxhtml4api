# Project Structure

```
mk2wxhtml4api/
├── src/                    # Source code
│   ├── server.js           # Application entry point & Express setup
│   ├── routes/             # API Route definitions
│   │   └── convert.js      # Conversion API routes
│   ├── services/           # Business logic
│   │   └── converter.js    # Markdown to WeChat HTML conversion logic
│   └── middleware/         # Express middleware
│       └── rateLimiter.js  # Rate limiting implementation
├── temp/                   # Temporary files / Assets
│   └── 样式模板.html        # HTML template for WeChat styling
├── openspec/               # OpenSpec specifications
├── test/                   # Tests
├── .github/                # GitHub workflows/config
├── .dockerignore           # Docker ignore rules
├── .gitignore              # Git ignore rules
├── API.md                  # API Documentation
├── APIFOX_测试请求.md       # APIFox test cases
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker build instructions
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```
