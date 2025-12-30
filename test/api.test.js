import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createServer } from 'http';

const PORT = 3001; // Use different port for testing

describe('WeChat Conversion API', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Import and start the server
    const { default: express } = await import('express');
    const app = express();

    // Setup middleware
    app.use(express.json());
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });

    // Import routes
    const { router } = await import('../src/routes/convert.js');
    app.use('/api/convert', router);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // Start server
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        baseUrl = `http://localhost:${PORT}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('POST /api/convert/wechat', () => {
    it('should return 400 for missing markdown field', async () => {
      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.strictEqual(response.status, 400);

      const data = await response.json();
      assert.strictEqual(data.success, false);
      assert.ok(data.error);
    });

    it('should return 400 for empty markdown', async () => {
      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: '' })
      });

      assert.strictEqual(response.status, 400);

      const data = await response.json();
      assert.strictEqual(data.success, false);
    });

    it('should successfully convert valid markdown', async () => {
      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: '# Hello World\n\nThis is a test.',
          title: 'Test Article',
          author: 'Test Author'
        })
      });

      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.html);
      assert.ok(data.data.meta);
      assert.strictEqual(data.data.meta.title, 'Test Article');
      assert.strictEqual(data.data.meta.author, 'Test Author');
      assert.ok(typeof data.data.meta.timestamp === 'number');
    });

    it('should return HTML with WeChat styles', async () => {
      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: '# Test Heading\n\nTest paragraph'
        })
      });

      const data = await response.json();
      assert.ok(data.data.html.includes('style='));
      assert.ok(data.data.html.includes('section'));
    });

    it('should handle Chinese characters', async () => {
      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: '# 你好世界\n\n这是一个测试'
        })
      });

      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert.ok(data.data.html.includes('你好世界'));
    });

    it('should sanitize malicious content', async () => {
      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: 'Text before <script>alert("XSS")</script> text after'
        })
      });

      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert.ok(data.data.html);
      assert.ok(!data.data.html.includes('<script>'));
      assert.ok(data.data.html.includes('Text before'));
      assert.ok(data.data.html.includes('text after'));
    });

    it('should handle complex markdown', async () => {
      const markdown = `# Main Title

## Section 1

This is **bold** and *italic*.

- Item 1
- Item 2

> A quote

\`\`\`js
const x = 1;
\`\`\`

[Link](https://example.com)`;

      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown })
      });

      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert.ok(data.data.html.includes('<h1'));
      assert.ok(data.data.html.includes('<h2'));
      assert.ok(data.data.html.includes('<strong'));
      assert.ok(data.data.html.includes('<em'));
      assert.ok(data.data.html.includes('<ul'));
      assert.ok(data.data.html.includes('<blockquote'));
      assert.ok(data.data.html.includes('<pre'));
      assert.ok(data.data.html.includes('<a'));
    });

    it('should work without optional parameters', async () => {
      const response = await fetch(`${baseUrl}/api/convert/wechat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: '# Test'
        })
      });

      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.html);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${baseUrl}/health`);

      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert.strictEqual(data.status, 'ok');
      assert.ok(typeof data.timestamp === 'number');
    });
  });
});
