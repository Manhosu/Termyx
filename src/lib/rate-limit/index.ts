/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple instances, use Redis-based solution
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP or user ID)
 * @param options - Rate limit configuration
 * @returns Rate limit result with headers info
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000
  const key = identifier

  let record = rateLimitStore.get(key)

  if (!record || record.resetTime < now) {
    // Create new window
    record = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, record)

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: record.resetTime,
    }
  }

  // Increment count
  record.count++
  rateLimitStore.set(key, record)

  const remaining = Math.max(0, options.limit - record.count)

  return {
    success: record.count <= options.limit,
    limit: options.limit,
    remaining,
    reset: record.resetTime,
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

/**
 * Pre-configured rate limiters for different API routes
 */
export const rateLimiters = {
  /** Standard API rate limit: 60 requests per minute */
  standard: (identifier: string) => rateLimit(identifier, { limit: 60, windowSeconds: 60 }),

  /** Strict rate limit for sensitive operations: 10 requests per minute */
  strict: (identifier: string) => rateLimit(identifier, { limit: 10, windowSeconds: 60 }),

  /** Auth rate limit: 5 attempts per 15 minutes */
  auth: (identifier: string) => rateLimit(identifier, { limit: 5, windowSeconds: 900 }),

  /** Email sending: 10 per hour */
  email: (identifier: string) => rateLimit(identifier, { limit: 10, windowSeconds: 3600 }),

  /** PDF generation: 20 per hour */
  pdf: (identifier: string) => rateLimit(identifier, { limit: 20, windowSeconds: 3600 }),

  /** Webhook: 100 per minute (high volume) */
  webhook: (identifier: string) => rateLimit(identifier, { limit: 100, windowSeconds: 60 }),
}
