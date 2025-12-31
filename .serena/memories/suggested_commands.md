# Suggested Commands

## Development
- **Install Dependencies**: `pnpm install`
- **Start Server**: `pnpm start` (Runs `node src/server.js`)
- **Development Mode**: `pnpm dev` (Runs `node --watch src/server.js` - requires Node.js 18.11+)
- **Run Tests**: `pnpm test` (Runs `node --test test/**/*.test.js`)

## Docker Deployment
- **Build Image**: `docker build -t mk2wxhtml4api:latest .`
- **Run Container**: `docker run -d -p 3002:3000 --name mk2wxhtml4api mk2wxhtml4api:latest`
- **Docker Compose Up**: `docker compose up -d`
- **Docker Compose Down**: `docker compose down`

## API Testing (curl)
- **Health Check**: `curl http://localhost:3000/health`
- **Convert**: 
  ```bash
  curl -X POST http://localhost:3000/api/convert/wechat \
    -H "Content-Type: application/json" \
    -d '{"markdown": "# Hello\n\nTest content"}'
  ```
