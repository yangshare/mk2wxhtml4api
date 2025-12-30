import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import NodeCache from 'node-cache';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
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
 * Read and parse the style template
 */
function loadTemplate() {
  try {
    const templatePath = resolve(process.cwd(), 'temp', '样式模板.html');
    const templateContent = readFileSync(templatePath, 'utf-8');
    return templateContent;
  } catch (error) {
    const err = new Error('Failed to load style template');
    err.code = 'TEMPLATE_NOT_FOUND';
    throw err;
  }
}

/**
 * Generate cache key from markdown content
 */
function getCacheKey(markdown, options = {}) {
  const content = markdown + JSON.stringify(options);
  return Buffer.from(content).toString('base64').substring(0, 32);
}

/**
 * Apply WeChat style template to converted HTML
 */
function applyTemplate(contentHtml) {
  const template = loadTemplate();

  // Find the content section in the template
  // The template has a section tag that contains sample content
  const sectionMatch = template.match(/<section>([\s\S]*?)<\/section>/);

  if (!sectionMatch) {
    // If no section found, just return the content with basic wrapper
    return `<section>${contentHtml}</section>`;
  }

  // Extract the outer parts of the template (before and after section)
  const beforeSection = template.substring(0, sectionMatch.index);
  const afterSection = template.substring(sectionMatch.index + sectionMatch[0].length);

  // Reconstruct with new content
  return `${beforeSection}<section>${contentHtml}</section>${afterSection}`;
}

/**
 * Convert Markdown to WeChat-compatible HTML
 */
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

  // Detect potential XSS (sanitize-html removes dangerous content)
  if (sanitizedHtml.length === 0 && html.length > 0) {
    const error = new Error('XSS detected in content');
    error.code = 'XSS_DETECTED';
    throw error;
  }

  // Apply WeChat style template
  const finalHtml = applyTemplate(sanitizedHtml);

  const result = {
    html: finalHtml
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
