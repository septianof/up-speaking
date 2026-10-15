import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { uuidSchema, optionalUuidSchema } from '@/lib/validators'

const syncSchema = z.object({
  sessionId: uuidSchema('ID sesi tidak valid'),
  deviceToken: z.string().min(1, 'Device token wajib disertakan'),
  elapsedSeconds: z.number().int().nonnegative().optional(),
  responses: z.array(
    z.object({
      questionId: uuidSchema('ID butir soal tidak valid'),
      selectedOptionId: optionalUuidSchema('ID pilihan tidak valid'),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = syncSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input tidak valid' },
        { status: 400 }
      )
    }

    const { sessionId, deviceToken, elapsedSeconds, responses } = parsed.data
    const supabase = createAdminClient()

    // 1. Verifikasi status sesi dan kepemilikan token perangkat
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('id, device_token, status')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sesi tes tidak ditemukan' },
        { status: 404 }
      )
    }

    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Sesi tes telah selesai atau dibatalkan', status: session.status },
        { status: 409 }
      )
    }

    // Single active device check
    if (session.device_token !== deviceToken) {
      return NextResponse.json(
        {
          error:
            'Sesi telah diambil alih di perangkat lain. Pengerjaan dihentikan pada perangkat ini.',
          deviceConflict: true,
        },
        { status: 403 }
      )
    }

    // 2. Perbarui jawaban siswa ke database
    let syncedCount = 0
    for (const item of responses) {
      const { error: updateError } = await supabase
        .from('test_responses')
        .update({
          selected_option_id: item.selectedOptionId,
          synced_at: new Date().toISOString(),
        })
        .match({
          session_id: sessionId,
          question_id: item.questionId,
        })

      if (!updateError) {
        syncedCount++
      }
    }

    // 3. Perbarui akumulasi waktu durasi tes
    if (typeof elapsedSeconds === 'number') {
      await supabase
        .from('test_sessions')
        .update({ elapsed_seconds: elapsedSeconds })
        .eq('id', sessionId)
    }

    return NextResponse.json({
      success: true,
      syncedCount,
    })
  } catch (err) {
    console.error('Unexpected error in student sync:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
