'use client'

import FingerprintJS from '@fingerprintjs/fingerprintjs'

let fpPromise: Promise<ReturnType<typeof FingerprintJS.load>> | null = null

/**
 * Get the fingerprint promise (singleton)
 */
function getFingerprintAgent() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load()
  }
  return fpPromise
}

/**
 * Get device fingerprint hash
 * This should be called client-side only
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await getFingerprintAgent()
    const result = await fp.get()
    return result.visitorId
  } catch (error) {
    console.error('Error getting fingerprint:', error)
    // Return a fallback based on available info
    return generateFallbackFingerprint()
  }
}

/**
 * Generate a fallback fingerprint when FingerprintJS fails
 * This is less reliable but better than nothing
 */
function generateFallbackFingerprint(): string {
  if (typeof window === 'undefined') return 'server-side'

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
  ]

  // Simple hash function
  const str = components.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `fallback_${Math.abs(hash).toString(16)}`
}

/**
 * Store fingerprint in sessionStorage for later use
 */
export function storeFingerprint(fingerprint: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('device_fingerprint', fingerprint)
  }
}

/**
 * Get stored fingerprint from sessionStorage
 */
export function getStoredFingerprint(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('device_fingerprint')
  }
  return null
}
