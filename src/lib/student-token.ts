import crypto from 'crypto'

export interface StudentTokenPayload {
  studentId: string
  sessionId?: string | null
  deviceToken?: string | null
  createdAt: number
}

export const STUDENT_TOKEN_COOKIE_NAME = 'up_speaking_student_token'

function getSecret(): string {
  const secret =
    process.env.STUDENT_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error(
      'Konfigurasi keamanan server gagal: Kunci signing token siswa (STUDENT_TOKEN_SECRET atau SUPABASE_SERVICE_ROLE_KEY) belum diatur.'
    )
  }
  return secret
}

/**
 * Menghasilkan token terverifikasi secara kriptografis (HMAC-SHA256)
 * yang mengikat identitas siswa dan sesi ujian.
 */
export function createStudentToken(payload: {
  studentId: string
  sessionId?: string | null
  deviceToken?: string | null
}): string {
  const secret = getSecret()
  const data: StudentTokenPayload = {
    studentId: payload.studentId,
    sessionId: payload.sessionId || null,
    deviceToken: payload.deviceToken || null,
    createdAt: Date.now(),
  }

  const encodedPayload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

/**
 * Memvalidasi tanda tangan kriptografis token sesi siswa.
 * Mengembalikan payload asli jika valid, atau null jika palsu/rusak/kedaluwarsa.
 */
export function verifyStudentToken(token?: string | null): StudentTokenPayload | null {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encodedPayload, signature] = parts
  const secret = getSecret()

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url')

  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const jsonStr = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const payload: StudentTokenPayload = JSON.parse(jsonStr)

    // Token berlaku hingga 7 hari (604800000 ms)
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - payload.createdAt > MAX_AGE_MS) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
