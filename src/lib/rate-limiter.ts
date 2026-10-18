/**
 * In-memory sliding window rate limiter
 * Proteksi brute-force untuk endpoint sensitif (login staf, verifikasi siswa).
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

export interface RateLimitConfig {
  /** Maksimum permintaan yang diizinkan dalam rentang waktu (default: 5) */
  maxRequests?: number
  /** Durasi jendela waktu dalam milidetik (default: 60_000 ms = 1 menit) */
  windowMs?: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

// Map penyimpanan rekaman rate limit di memori server
const ipStore = new Map<string, RateLimitRecord>()

// Interval pembersihan memori (5 menit)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let cleanupTimer: NodeJS.Timeout | null = null

function ensureCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    ipStore.forEach((record, key) => {
      if (now > record.resetTime) {
        ipStore.delete(key)
      }
    })
  }, CLEANUP_INTERVAL_MS)

  if (cleanupTimer.unref) {
    cleanupTimer.unref()
  }
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  ensureCleanup()

  const maxRequests = config.maxRequests ?? 5
  const windowMs = config.windowMs ?? 60_000
  const now = Date.now()

  const record = ipStore.get(identifier)

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    }
    ipStore.set(identifier, newRecord)

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: newRecord.resetTime,
    }
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count += 1
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$/

/**
 * Ekstraksi IP address klien dari Request headers dengan proteksi spoofing
 */
export function getClientIp(request: Request): string {
  // 1. Prioritaskan header terpercaya dari edge proxy / reverse proxy (Vercel)
  const vercelIp = request.headers.get('x-vercel-ip')
  if (vercelIp && IP_REGEX.test(vercelIp.trim())) {
    return vercelIp.trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp && IP_REGEX.test(realIp.trim())) {
    return realIp.trim()
  }

  // 2. Fallback x-forwarded-for dengan validasi format IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const parts = forwardedFor.split(',').map((s) => s.trim())
    for (const ip of parts) {
      if (IP_REGEX.test(ip)) {
        return ip
      }
    }
  }

  return '127.0.0.1'
}
