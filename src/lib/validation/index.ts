/**
 * Input validation utilities for API routes
 * Provides sanitization and validation for common input types
 */

/**
 * Sanitize string input - removes HTML tags and trims whitespace
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .trim()
}

/**
 * Sanitize email - lowercase and trim
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.toLowerCase().trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate phone number (Brazilian format)
 */
export function isValidPhone(phone: string): boolean {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '')
  // Brazilian phone: 10-11 digits (with area code)
  return digits.length >= 10 && digits.length <= 11
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

/**
 * Validate CPF (Brazilian individual tax ID)
 */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false

  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(digits)) return false

  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

/**
 * Validate CNPJ (Brazilian company tax ID)
 */
export function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false

  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(digits)) return false

  // Validate check digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  if (digit1 !== parseInt(digits[12])) return false

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  if (digit2 !== parseInt(digits[13])) return false

  return true
}

/**
 * Format CPF for display
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Format CNPJ for display
 */
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return cnpj
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

/**
 * Validate password strength
 */
export interface PasswordStrength {
  isValid: boolean
  score: number // 0-4
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export function validatePassword(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length
  const isValid = checks.length && checks.uppercase && checks.lowercase && checks.number

  return { isValid, score, checks }
}

/**
 * Validate and sanitize document title
 */
export function validateDocumentTitle(title: unknown): { valid: boolean; value: string; error?: string } {
  const sanitized = sanitizeString(title)

  if (!sanitized) {
    return { valid: false, value: '', error: 'Titulo e obrigatorio' }
  }

  if (sanitized.length < 3) {
    return { valid: false, value: sanitized, error: 'Titulo deve ter pelo menos 3 caracteres' }
  }

  if (sanitized.length > 200) {
    return { valid: false, value: sanitized, error: 'Titulo deve ter no maximo 200 caracteres' }
  }

  return { valid: true, value: sanitized }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: unknown,
  limit: unknown,
  maxLimit = 100
): { page: number; limit: number; offset: number } {
  let pageNum = parseInt(String(page), 10)
  let limitNum = parseInt(String(limit), 10)

  if (isNaN(pageNum) || pageNum < 1) pageNum = 1
  if (isNaN(limitNum) || limitNum < 1) limitNum = 10
  if (limitNum > maxLimit) limitNum = maxLimit

  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  }
}
