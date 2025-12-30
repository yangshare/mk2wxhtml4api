/**
 * Simple in-memory rate limiter
 * Limits requests per IP address
 */
const rateLimitMap = new Map();

// Configuration: 100 requests per minute per IP
const MAX_REQUESTS = 100;
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Rate limiter middleware
 */
export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  // Get or create rate limit entry for this IP
  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    entry = {
      count: 0,
      resetTime: now + WINDOW_MS
    };
    rateLimitMap.set(ip, entry);
  }

  // Increment request count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: retryAfter
      }
    });
  }

  // Clean up old entries periodically
  if (now % 10000 < 100) { // Approximately every 10 seconds
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  next();
}
