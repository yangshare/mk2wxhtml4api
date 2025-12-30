import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import NodeCache from 'node-cache';
import * as cheerio from 'cheerio';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Initialize markdown-it
const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  linkify: true, // Autoconvert URL-like text to links
  typographer: true // Enable some language-neutral replacement and quotes beautification
});

/**
 * Sanitize HTML to prevent XSS attacks
 */
function sanitize(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'section', 'center', 'span'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'style', 'id'],
      'img': ['src', 'alt', 'title', 'style'],
      'a': ['href', 'title', 'target'],
      'section': ['class']
    },
    allowedStyles: {
      '*': {
        // Allow specific CSS properties
        'color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/i],
        'background': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/i],
        'background-color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/i],
        'font-size': [/^[0-9]+(px|em|rem|%|pt)?$/],
        'font-weight': [/^(normal|bold|[1-9]00)$/],
        'text-align': [/^(left|right|center|justify)$/],
        'text-decoration': [/^(none|underline|line-through)$/],
        'margin': [/^[0-9]+(px|em|rem|%|pt|auto)?(\s+[0-9]+(px|em|rem|%|pt|auto)?)?$/],
        'padding': [/^[0-9]+(px|em|rem|%|pt)?(\s+[0-9]+(px|em|rem|%|pt)?)?$/],
        'border': [/^.*$/],
        'display': [/^(block|inline|inline-block|table|flex|none)$/],
        'line-height': [/^[0-9]+(\.[0-9]+)?(px|em|rem|%|)?$/],
        'letter-spacing': [/^[0-9]+(px|em|rem)?$/]
      }
    }
  });
}

/**
 * WeChat inline styles for different HTML elements
 */
const WECHAT_STYLES = {
  h1: 'display: table; padding: 0px 1em; border-bottom: 2px solid rgb(250, 81, 81); margin-right: auto; margin-bottom: 1em; margin-left: auto; color: rgb(63, 63, 63); font-size: 19.2px; text-align: center; margin-top: 0px !important;',
  h2: 'display: table; padding: 0px 0.2em; margin: 4em auto 2em; color: rgb(255, 255, 255); background: rgb(250, 81, 81); font-size: 19.2px; text-align: center;',
  h3: 'padding-left: 8px; border-left: 3px solid rgb(250, 81, 81); margin: 2em 8px 0.75em 0px; color: rgb(63, 63, 63); font-size: 17.6px; line-height: 1.2;',
  h4: 'margin: 2em 8px 0.5em; color: rgb(250, 81, 81);',
  p: 'margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63);',
  blockquote: 'padding: 1em; border-left: 4px solid rgb(250, 81, 81); border-radius: 6px; color: rgb(63, 63, 63); background: rgb(247, 247, 247); margin-bottom: 1em;',
  'code.inline': 'font-size: 14.4px; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px;',
  pre: 'color: rgb(201, 209, 217); background-color: rgb(13, 17, 23); font-size: 14.4px; overflow-x: auto; line-height: 1.5; margin: 10px 8px; padding: 0px !important;',
  ul: 'list-style-type: circle;',
  ol: 'padding-left: 1em; color: rgb(63, 63, 63);',
  li: 'margin: 0.5em 0;',
  strong: 'color: rgb(250, 81, 81); font-weight: bold; font-size: inherit;',
  em: 'font-size: inherit;',
  a: 'color: rgb(87, 107, 149); text-decoration-line: none;',
  table: 'border-collapse: collapse; width: 100%; margin: 1.5em 0;',
  th: 'border-color: rgb(223, 223, 223); padding: 0.25em 0.5em; word-break: keep-all; background: rgba(0, 0, 0, 0.05); font-weight: bold;',
  td: 'border-color: rgb(223, 223, 223); padding: 0.25em 0.5em; word-break: keep-all;',
  hr: 'border: none; border-top: 1px solid rgb(223, 223, 223); margin: 2em 0;'
};

/**
 * Apply WeChat inline styles to HTML elements
 */
function applyWeChatStyles(html) {
  const $ = cheerio.load(html);

  // Apply styles to headings
  $('h1').attr('style', WECHAT_STYLES.h1).addClass('h1');
  $('h2').attr('style', WECHAT_STYLES.h2).addClass('h2');
  $('h3').attr('style', WECHAT_STYLES.h3).addClass('h3');
  $('h4').attr('style', WECHAT_STYLES.h4).addClass('h4');

  // Apply styles to paragraphs
  $('p').each(function() {
    const $p = $(this);
    // Skip if it's a wrapper p with zero font-size
    if (!$p.attr('style')?.includes('font-size: 0px')) {
      $p.attr('style', WECHAT_STYLES.p).addClass('p');
    }
  });

  // Apply styles to blockquotes
  $('blockquote').attr('style', WECHAT_STYLES.blockquote).addClass('blockquote');
  $('blockquote p').attr('style', 'font-size: 1em; letter-spacing: 0.1em; margin-top: 0px; margin-bottom: 0px;');

  // Apply styles to code
  $('code').each(function() {
    const $code = $(this);
    if ($code.parent().is('pre')) {
      // Code inside pre block - handled by pre style
    } else {
      // Inline code
      $code.attr('style', WECHAT_STYLES['code.inline']).addClass('codespan');
    }
  });

  // Apply styles to pre blocks
  $('pre').attr('style', WECHAT_STYLES.pre).addClass('hljs code__pre');

  // Apply styles to lists
  $('ul').attr('style', WECHAT_STYLES.ul).addClass('ul list-paddingleft-2');
  $('ol').attr('style', WECHAT_STYLES.ol).addClass('ol list-paddingleft-2');
  $('li').attr('style', WECHAT_STYLES.li);

  // Apply styles to text formatting
  $('strong').attr('style', WECHAT_STYLES.strong).addClass('strong');
  $('em').attr('style', WECHAT_STYLES.em).addClass('em');

  // Apply styles to links
  $('a').attr('style', WECHAT_STYLES.a);

  // Apply styles to tables
  $('table').attr('style', WECHAT_STYLES.table).addClass('preview-table');
  $('th').attr('style', WECHAT_STYLES.th).addClass('th');
  $('td').attr('style', WECHAT_STYLES.td).addClass('td');

  // Apply styles to horizontal rules
  $('hr').attr('style', WECHAT_STYLES.hr);

  // Wrap everything in section tag for WeChat
  const content = $('body').html() || html;
  return `<section>${content}</section>`;
}

/**
 * Convert Markdown to WeChat-compatible HTML
 */
/**
 * Generate cache key from markdown content
 */
function getCacheKey(markdown, options = {}) {
  const content = markdown + JSON.stringify(options);
  return Buffer.from(content).toString('base64').substring(0, 32);
}

export async function convertMarkdownToWeChat(markdown, options = {}) {
  // Check cache first
  const cacheKey = getCacheKey(markdown, options);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Convert markdown to HTML
  const html = md.render(markdown);

  // Sanitize HTML for security
  const sanitizedHtml = sanitize(html);

  // Note: sanitize-html removes dangerous content like script tags
  // Empty sanitized HTML is acceptable when input only contains dangerous elements

  // Apply WeChat inline styles to HTML elements
  const styledHtml = applyWeChatStyles(sanitizedHtml);
  
  // Remove newlines to make HTML compact
  const compactHtml = styledHtml.replace(/\n/g, '');

  const result = {
    html: compactHtml
  };

  // Cache the result
  cache.set(cacheKey, result);

  return result;
}

/**
 * Clear the conversion cache
 */
export function clearCache() {
  cache.flushAll();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}
