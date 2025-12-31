# Project Summary
**mk2wxhtml4api** is a Node.js/Express API service that converts Markdown text into HTML compatible with WeChat Official Accounts (WeChat Public Platform).

## Key Features
- **Markdown to HTML**: Converts Markdown to HTML optimized for WeChat.
- **Styling**: Applies WeChat-specific CSS/styling templates.
- **Security**: XSS protection and HTML sanitization.
- **Rate Limiting**: 100 requests/minute.
- **Caching**: 5-minute response cache.
- **Docker**: Containerized deployment support.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Core Libraries**: 
  - `markdown-it` (Markdown parsing)
  - `cheerio` (HTML manipulation)
  - `sanitize-html` (Security)
  - `express-validator` (Validation)
- **Package Manager**: pnpm (inferred from docs) / npm

## Architecture
- RESTful API design.
- Service-based architecture (`src/services`).
- Middleware for cross-cutting concerns (rate limiting).
