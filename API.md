# Markdown to WeChat HTML API Documentation

## Overview

This API converts Markdown text into HTML formatted for WeChat Official Account articles.

**Base URL:** `http://localhost:3000`

## Endpoints

### Health Check

Check if the API server is running.

**Request:**
```
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": 1703920800000
}
```

### Convert Markdown to WeChat HTML

Convert Markdown text to WeChat-compatible HTML.

**Request:**
```
POST /api/convert/wechat
Content-Type: application/json
```

**Request Body:**
```json
{
  "markdown": "# Hello World\n\nThis is **bold** text.",
  "title": "Optional Title",
  "author": "Optional Author"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| markdown | string | Yes | The Markdown text to convert (max 5MB) |
| title | string | No | Optional article title |
| author | string | No | Optional author name |
| template | string | No | Reserved for future use |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "html": "<section>...</section>",
    "meta": {
      "title": "Optional Title",
      "author": "Optional Author",
      "timestamp": 1703920800000
    }
  }
}
```

**Response (400 Bad Request) - Invalid Input:**
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

**Response (413 Payload Too Large):**
```json
{
  "success": false,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request payload exceeds the 5MB limit"
  }
}
```

**Response (429 Too Many Requests):**
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

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_INPUT | 400 | Request body validation failed |
| INVALID_JSON | 400 | Invalid JSON in request body |
| PAYLOAD_TOO_LARGE | 413 | Request exceeds 5MB size limit |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded (100 req/min) |
| NOT_FOUND | 404 | Endpoint not found |
| XSS_DETECTED | 400 | Potentially unsafe content detected |
| TEMPLATE_NOT_FOUND | 500 | Style template file missing |
| CONVERSION_ERROR | 500 | Markdown conversion failed |
| INTERNAL_ERROR | 500 | Internal server error |

## Rate Limiting

- **Limit:** 100 requests per minute per IP address
- **Response:** HTTP 429 with `Retry-After` header indicating seconds to wait

## Security

- **XSS Protection:** All HTML output is sanitized using `sanitize-html`
- **Input Validation:** Request size limited to 5MB
- **Content Filtering:** Dangerous tags and attributes are removed

## Caching

- Converted content is cached for 5 minutes
- Cache key based on input content hash
- Automatically expires and refreshes

## Example Usage

### cURL
```bash
curl -X POST http://localhost:3000/api/convert/wechat \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is **bold** text.",
    "title": "My Article"
  }'
```

### JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/convert/wechat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# Hello World\n\nThis is **bold** text.',
    title: 'My Article'
  })
});
const data = await response.json();
console.log(data.data.html);
```

### Python
```python
import requests

response = requests.post('http://localhost:3000/api/convert/wechat', json={
    'markdown': '# Hello World\n\nThis is **bold** text.',
    'title': 'My Article'
})
data = response.json()
print(data['data']['html'])
```

## Running the Server

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode with auto-reload
npm run dev
```

The server will start on port 3000 by default (configurable via `PORT` environment variable).
