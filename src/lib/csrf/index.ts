/**
 * CSRF Protection utilities
 * Provides token generation and validation for forms
 */

import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create a CSRF token
 * Stores token in HTTP-only cookie
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (existingToken) {
    return existingToken
  }

  const newToken = generateToken()

  // Note: In production, set secure: true for HTTPS
  cookieStore.set(CSRF_TOKEN_NAME, newToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return newToken
}

/**
 * Validate a CSRF token from a request
 * @param requestToken - Token from request body or header
 * @returns true if token is valid
 */
export async function validateCSRFToken(requestToken: string | null | undefined): Promise<boolean> {
  if (!requestToken) return false

  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (!storedToken) return false

  // Use timing-safe comparison to prevent timing attacks
  return timingSafeEqual(requestToken, storedToken)
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks by always comparing all characters
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to maintain constant time
    b = a
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0 && a.length === b.length
}

/**
 * Extract CSRF token from request
 * Checks both header and body
 */
export function extractCSRFToken(request: Request, body?: Record<string, unknown>): string | null {
  // Check header first (preferred for API calls)
  const headerToken = request.headers.get('X-CSRF-Token')
  if (headerToken) return headerToken

  // Check body (for form submissions)
  if (body && typeof body._csrf === 'string') {
    return body._csrf
  }

  return null
}

/**
 * CSRF validation middleware for API routes
 * Usage:
 * const { valid, error } = await csrfMiddleware(request, body)
 * if (!valid) return NextResponse.json({ error }, { status: 403 })
 */
export async function csrfMiddleware(
  request: Request,
  body?: Record<string, unknown>
): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method)
  if (safeMethod) {
    return { valid: true }
  }

  const token = extractCSRFToken(request, body)
  const isValid = await validateCSRFToken(token)

  if (!isValid) {
    return { valid: false, error: 'Invalid or missing CSRF token' }
  }

  return { valid: true }
}
