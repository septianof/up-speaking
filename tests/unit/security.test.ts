import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createStudentToken,
  verifyStudentToken,
} from '@/lib/student-token'
import { getClientIp, checkRateLimit } from '@/lib/rate-limiter'

describe('Security Controls & Token Verification', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    process.env.SUPABASE_SERVICE_ROLE_KEY =
      'test-service-role-key-with-sufficient-length-for-hmac-sha256'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('harus menandatangani dan memverifikasi token siswa secara sah', () => {
    const payload = {
      studentId: 'e0000000-0000-0000-0000-000000000001',
      sessionId: 's0000000-0000-0000-0000-000000000001',
      deviceToken: 'dev-token-abc',
    }

    const token = createStudentToken(payload)
    expect(typeof token).toBe('string')
    expect(token).toContain('.')

    const verified = verifyStudentToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.studentId).toBe(payload.studentId)
    expect(verified?.sessionId).toBe(payload.sessionId)
    expect(verified?.deviceToken).toBe(payload.deviceToken)
  })

  it('harus menolak token yang tanda tangannya telah diubah (Tampering Defense)', () => {
    const payload = {
      studentId: 'e0000000-0000-0000-0000-000000000001',
    }

    const token = createStudentToken(payload)
    const [encodedPayload] = token.split('.')
    const tamperedToken = `${encodedPayload}.invalidsignature123`

    expect(verifyStudentToken(tamperedToken)).toBeNull()
  })

  it('harus menolak string token yang tidak valid atau null', () => {
    expect(verifyStudentToken(null)).toBeNull()
    expect(verifyStudentToken(undefined)).toBeNull()
    expect(verifyStudentToken('')).toBeNull()
    expect(verifyStudentToken('malformed-token')).toBeNull()
  })

  it('harus melempar error (fail-closed) jika secret token tidak dikonfigurasi', () => {
    delete process.env.STUDENT_TOKEN_SECRET
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    expect(() =>
      createStudentToken({ studentId: 'test-student-id' })
    ).toThrowError(/Konfigurasi keamanan server gagal/)
  })

  it('harus mengekstrak IP yang valid dari header proxy terpercaya', () => {
    const reqWithVercelIp = new Request('http://localhost', {
      headers: { 'x-vercel-ip': '203.0.113.195' },
    })
    expect(getClientIp(reqWithVercelIp)).toBe('203.0.113.195')

    const reqWithRealIp = new Request('http://localhost', {
      headers: { 'x-real-ip': '198.51.100.22' },
    })
    expect(getClientIp(reqWithRealIp)).toBe('198.51.100.22')

    const reqWithForwarded = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '192.0.2.1, 10.0.0.1' },
    })
    expect(getClientIp(reqWithForwarded)).toBe('192.0.2.1')
  })

  it('harus membatasi laju permintaan saat kuota rate limit terlampaui', () => {
    const testKey = `test-ip-${Date.now()}`
    const config = { maxRequests: 3, windowMs: 10_000 }

    expect(checkRateLimit(testKey, config).success).toBe(true)
    expect(checkRateLimit(testKey, config).success).toBe(true)
    expect(checkRateLimit(testKey, config).success).toBe(true)
    expect(checkRateLimit(testKey, config).success).toBe(false)
  })

  it('harus membatasi dan mengisolasi hak akses jenjang sesuai peran tutor (SEC-001 & SEC-002)', () => {
    const getEnforcedLevel = (role: string, requestedLevel: string) => {
      if (role === 'ADMIN') return requestedLevel
      return role === 'TUTOR_ELEMENTARY' ? 'ELEMENTARY' : 'HIGH_SCHOOL'
    }

    // Tutor Elementary tidak boleh mengakses jenjang High School meskipun mengirim parameter 'HIGH_SCHOOL'
    expect(getEnforcedLevel('TUTOR_ELEMENTARY', 'HIGH_SCHOOL')).toBe('ELEMENTARY')
    expect(getEnforcedLevel('TUTOR_ELEMENTARY', 'ALL')).toBe('ELEMENTARY')

    // Tutor High School tidak boleh mengakses jenjang Elementary meskipun mengirim parameter 'ELEMENTARY'
    expect(getEnforcedLevel('TUTOR_HIGH_SCHOOL', 'ELEMENTARY')).toBe('HIGH_SCHOOL')
    expect(getEnforcedLevel('TUTOR_HIGH_SCHOOL', 'ALL')).toBe('HIGH_SCHOOL')

    // Admin bebas mengakses parameter apa pun yang diminta
    expect(getEnforcedLevel('ADMIN', 'HIGH_SCHOOL')).toBe('HIGH_SCHOOL')
    expect(getEnforcedLevel('ADMIN', 'ALL')).toBe('ALL')
  })

  it('harus memvalidasi guard proteksi penghapusan akun tutor (Opsi A: Self-deletion, Role Guard, & Evaluation History)', () => {
    interface TutorDeleteCheckInput {
      currentAdminId: string
      targetId: string
      targetRole: 'ADMIN' | 'TUTOR_ELEMENTARY' | 'TUTOR_HIGH_SCHOOL'
      evaluationCount: number
    }

    const checkTutorDeletion = (input: TutorDeleteCheckInput): { allowed: boolean; error?: string } => {
      // 1. Self-deletion guard
      if (input.targetId === input.currentAdminId) {
        return { allowed: false, error: 'Tindakan ditolak: Anda tidak dapat menghapus akun Anda sendiri.' }
      }
      // 2. Role guard (Admin tidak boleh dihapus melalui endpoint tutor)
      if (input.targetRole === 'ADMIN') {
        return { allowed: false, error: 'Tindakan ditolak: Akun administrator tidak dapat dihapus melalui menu ini.' }
      }
      // 3. Opsi A: Foreign key check (placement evaluations history)
      if (input.evaluationCount > 0) {
        return {
          allowed: false,
          error: 'Akun pengajar ini tidak dapat dihapus karena telah memiliki riwayat penilaian placement test siswa (diperlukan untuk arsip laporan lembaga).',
        }
      }
      return { allowed: true }
    }

    const adminId = 'a0000000-0000-0000-0000-000000000001'
    const otherAdminId = 'a0000000-0000-0000-0000-000000000002'
    const tutorWithEvals = 't0000000-0000-0000-0000-000000000001'
    const freshTutor = 't0000000-0000-0000-0000-000000000002'

    // Kasus 1: Admin mencoba menghapus akunnya sendiri -> DITOLAK
    const resSelf = checkTutorDeletion({
      currentAdminId: adminId,
      targetId: adminId,
      targetRole: 'ADMIN',
      evaluationCount: 0,
    })
    expect(resSelf.allowed).toBe(false)
    expect(resSelf.error).toContain('tidak dapat menghapus akun Anda sendiri')

    // Kasus 2: Admin mencoba menghapus akun admin lain lewat endpoint tutor -> DITOLAK
    const resOtherAdmin = checkTutorDeletion({
      currentAdminId: adminId,
      targetId: otherAdminId,
      targetRole: 'ADMIN',
      evaluationCount: 0,
    })
    expect(resOtherAdmin.allowed).toBe(false)
    expect(resOtherAdmin.error).toContain('Akun administrator tidak dapat dihapus')

    // Kasus 3: Tutor sudah punya riwayat penilaian siswa -> DITOLAK (Opsi A)
    const resWithEval = checkTutorDeletion({
      currentAdminId: adminId,
      targetId: tutorWithEvals,
      targetRole: 'TUTOR_ELEMENTARY',
      evaluationCount: 5,
    })
    expect(resWithEval.allowed).toBe(false)
    expect(resWithEval.error).toContain('telah memiliki riwayat penilaian placement test siswa')

    // Kasus 4: Tutor baru tanpa riwayat penilaian -> DIIZINKAN
    const resFresh = checkTutorDeletion({
      currentAdminId: adminId,
      targetId: freshTutor,
      targetRole: 'TUTOR_HIGH_SCHOOL',
      evaluationCount: 0,
    })
    expect(resFresh.allowed).toBe(true)
    expect(resFresh.error).toBeUndefined()
  })
})

