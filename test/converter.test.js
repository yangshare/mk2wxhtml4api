import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { convertMarkdownToWeChat, clearCache } from '../src/services/converter.js';

describe('Markdown to WeChat Converter', () => {

  // Clear cache before tests to ensure clean state
  before(() => {
    clearCache();
  });

  describe('Basic Markdown Conversion', () => {
    it('should convert simple heading', async () => {
      const markdown = '# Hello World';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<h1'));
      assert(result.html.includes('Hello World'));
      assert(result.html.includes('section'));
    });

    it('should convert paragraphs', async () => {
      const markdown = 'This is a paragraph.\n\nThis is another paragraph.';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<p'));
      assert(result.html.includes('This is a paragraph'));
    });

    it('should convert bold and italic text', async () => {
      const markdown = 'This is **bold** and this is *italic*.';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<strong'));
      assert(result.html.includes('<em'));
    });

    it('should convert lists', async () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<ul'));
      assert(result.html.includes('<li'));
      assert(result.html.includes('Item 1'));
    });

    it('should convert code blocks', async () => {
      const markdown = '```js\nconsole.log("Hello");\n```';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<pre'));
      assert(result.html.includes('<code'));
    });

    it('should convert blockquotes', async () => {
      const markdown = '> This is a quote';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<blockquote'));
    });

    it('should convert inline code', async () => {
      const markdown = 'Use `const` for constants';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<code'));
    });

    it('should convert links', async () => {
      const markdown = '[OpenAI](https://openai.com)';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<a'));
      assert(result.html.includes('https://openai.com'));
    });
  });

  describe('WeChat Styles', () => {
    it('should apply inline styles to h1', async () => {
      const markdown = '# Title';
      const result = await convertMarkdownToWeChat(markdown);

      assert(result.html.includes('style='));
      assert(result.html.includes('display: table'));
      assert(result.html.includes('rgb(250, 81, 81)'));
    });

    it('should apply inline styles to h2', async () => {
      const markdown = '## Subtitle';
      const result = await convertMarkdownToWeChat(markdown);

      assert(result.html.includes('style='));
      assert(result.html.includes('background: rgb(250, 81, 81)'));
    });

    it('should apply inline styles to paragraphs', async () => {
      const markdown = 'A paragraph';
      const result = await convertMarkdownToWeChat(markdown);

      assert(result.html.includes('style='));
      assert(result.html.includes('color: rgb(63, 63, 63)'));
    });

    it('should apply inline styles to blockquotes', async () => {
      const markdown = '> A quote';
      const result = await convertMarkdownToWeChat(markdown);

      assert(result.html.includes('style='));
      assert(result.html.includes('border-left: 4px solid rgb(250, 81, 81)'));
    });

    it('should add CSS classes to elements', async () => {
      const markdown = '# Title\n\nParagraph';
      const result = await convertMarkdownToWeChat(markdown);

      assert(result.html.includes('class='));
      assert(result.html.includes('h1'));
      assert(result.html.includes('p'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty markdown', async () => {
      const markdown = '';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
    });

    it('should handle markdown with only whitespace', async () => {
      const markdown = '   \n\n   ';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
    });

    it('should handle special characters', async () => {
      const markdown = '# Testing: < > & " \'';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      // Should not contain unescaped special characters
      assert(!result.html.includes('<>'));
    });

    it('should handle Chinese characters', async () => {
      const markdown = '# 你好世界\n\n这是一个测试。';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('你好世界'));
      assert(result.html.includes('这是一个测试'));
    });
  });

  describe('Security', () => {
    it('should sanitize script tags', async () => {
      const markdown = 'Text before <script>alert("XSS")</script> text after';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(!result.html.includes('<script>'));
      assert(!result.html.includes('alert'));
      assert(result.html.includes('Text before'));
      assert(result.html.includes('text after'));
    });

    it('should remove dangerous HTML elements', async () => {
      // div is not in allowed tags, so sanitize-html removes it
      // but text content should remain
      const markdown = 'Text <div class="danger">Click</div> end';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      // div tag should be removed but text preserved
      assert(result.html.includes('Text'));
      assert(result.html.includes('Click'));
      assert(result.html.includes('end'));
    });

    it('should allow safe HTML tags', async () => {
      const markdown = '<br><hr>';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
    });
  });

  describe('Complex Markdown', () => {
    it('should handle nested lists', async () => {
      const markdown = '- Item 1\n  - Nested item 1\n  - Nested item 2\n- Item 2';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<li'));
    });

    it('should handle tables', async () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<table'));
      assert(result.html.includes('<th'));
      assert(result.html.includes('<td'));
    });

    it('should handle horizontal rules', async () => {
      const markdown = '---';
      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<hr'));
    });

    it('should handle mixed content', async () => {
      const markdown = `# Main Title

## Section 1

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

> A quote

\`\`\`js
const x = 1;
\`\`\`

[Link](https://example.com)`;

      const result = await convertMarkdownToWeChat(markdown);

      assert.ok(result.html);
      assert(result.html.includes('<h1'));
      assert(result.html.includes('<h2'));
      assert(result.html.includes('<p'));
      assert(result.html.includes('<ul'));
      assert(result.html.includes('<blockquote'));
      assert(result.html.includes('<pre'));
      assert(result.html.includes('<a'));
    });
  });

  describe('Caching', () => {
    it('should cache conversion results', async () => {
      const markdown = '# Test';

      const result1 = await convertMarkdownToWeChat(markdown);
      const result2 = await convertMarkdownToWeChat(markdown);

      assert.strictEqual(result1.html, result2.html);
    });

    it('should handle different markdown inputs separately', async () => {
      const result1 = await convertMarkdownToWeChat('# Test 1');
      const result2 = await convertMarkdownToWeChat('# Test 2');

      assert.notStrictEqual(result1.html, result2.html);
    });
  });
});
