import express from 'express';
import { body, validationResult } from 'express-validator';
import { convertMarkdownToWeChat } from '../services/converter.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/convert/wechat
 * Convert Markdown to WeChat-compatible HTML
 */
router.post('/wechat',
  rateLimiter,
  [
    body('markdown')
      .trim()
      .notEmpty()
      .withMessage('markdown field is required and cannot be empty')
      .isLength({ max: 5000000 })
      .withMessage('markdown content exceeds 5MB limit'),
    body('title').optional().isString(),
    body('author').optional().isString(),
    body('template').optional().isString()
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Input validation failed',
          details: errors.array().map(e => e.msg)
        }
      });
    }

    try {
      const { markdown, title, author } = req.body;

      // Convert markdown to WeChat HTML
      const result = await convertMarkdownToWeChat(markdown, { title, author });

      res.json({
        success: true,
        data: {
          html: result.html,
          meta: {
            title: title || '',
            author: author || '',
            timestamp: Date.now()
          }
        }
      });
    } catch (error) {
      console.error('Conversion error:', error);

      // Handle specific error types
      if (error.code === 'TEMPLATE_NOT_FOUND') {
        return res.status(500).json({
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Style template file not found'
          }
        });
      }

      if (error.code === 'XSS_DETECTED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'XSS_DETECTED',
            message: 'Input contains potentially unsafe content'
          }
        });
      }

      // Generic error response
      res.status(500).json({
        success: false,
        error: {
          code: 'CONVERSION_ERROR',
          message: 'Failed to convert markdown to HTML',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }
);

export { router };
