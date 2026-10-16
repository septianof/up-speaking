import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { fisherYatesShuffle, seededFisherYatesShuffle } from '@/lib/algorithms/fisher-yates'
import { uuidSchema } from '@/lib/validators'

const startSchema = z.object({
  studentId: uuidSchema('ID siswa tidak valid'),
  deviceToken: z.string().min(1, 'Device token wajib disertakan'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = startSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input tidak valid' },
        { status: 400 }
      )
    }

    const { studentId, deviceToken } = parsed.data
    const supabase = createAdminClient()

    // 1. Verifikasi eksistensi siswa
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // 2. Cek sesi tes terakhir siswa yang belum di-reset
    const { data: latestSession, error: sessionError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('student_id', studentId)
      .neq('status', 'RESET')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError) {
      console.error('Error checking active session:', sessionError)
      return NextResponse.json(
        { error: 'Gagal memeriksa sesi tes' },
        { status: 500 }
      )
    }

    // A. JIKA STATUS SUDAH SELESAI (COMPLETED atau FINALIZED): Tolak pembuatan sesi baru!
    if (latestSession && (latestSession.status === 'COMPLETED' || latestSession.status === 'FINALIZED')) {
      return NextResponse.json(
        {
          error: 'Kamu sudah menyelesaikan tes ini. Mengalihkan ke lembar hasil...',
          isCompleted: true,
          status: latestSession.status,
          sessionId: latestSession.id,
        },
        { status: 409 }
      )
    }

    // B. JIKA SUDAH ADA SESI BERJALAN: Lanjutkan sesi (Single Device Takeover)
    if (latestSession && latestSession.status === 'IN_PROGRESS') {
      const activeSession = latestSession

      // Perbarui device token ke perangkat aktif terbaru
      await supabase
        .from('test_sessions')
        .update({ device_token: deviceToken })
        .eq('id', activeSession.id)

      // Ambil respon soal yang telah dibuat sebelumnya
      const { data: responses, error: responsesError } = await supabase
        .from('test_responses')
        .select(`
          display_order,
          question_id,
          selected_option_id,
          questions (
            id,
            question_text,
            target_level,
            question_options (
              id,
              option_text,
              sort_order
            )
          )
        `)
        .eq('session_id', activeSession.id)
        .order('display_order', { ascending: true })

      if (responsesError || !responses) {
        console.error('Error fetching existing responses:', responsesError)
        return NextResponse.json(
          { error: 'Gagal memuat lembar ujian yang sedang berjalan' },
          { status: 500 }
        )
      }

      interface RawOption {
        id: string
        option_text: string
        sort_order?: number
      }

      interface RawQuestion {
        id: string
        question_text: string
        target_level: string
        question_options?: RawOption[]
      }

      const formattedQuestions = responses.map((resp) => {
        const q = resp.questions as unknown as RawQuestion
        const rawOptions = (q?.question_options || []).map((opt) => ({
          id: opt.id,
          optionText: opt.option_text,
        }))
        // Acak opsi secara deterministik per sesi & butir soal agar urutannya konsisten di semua perangkat
        const shuffledOptions = seededFisherYatesShuffle(rawOptions, `${activeSession.id}_${q.id}`)

        return {
          id: q.id,
          displayOrder: resp.display_order,
          questionText: q.question_text,
          targetLevel: q.target_level,
          selectedOptionId: resp.selected_option_id,
          options: shuffledOptions,
        }
      })

      // Cari nomor butir pertama yang belum dijawab
      const firstUnansweredIndex = formattedQuestions.findIndex(
        (q) => !q.selectedOptionId
      )
      const resumeQuestionIndex =
        firstUnansweredIndex !== -1 ? firstUnansweredIndex : Math.max(0, formattedQuestions.length - 1)

      // Hitung elapsed seconds berdasarkan started_at server
      const startedAtMs = new Date(activeSession.started_at).getTime()
      const currentElapsed = Math.max(
        activeSession.elapsed_seconds,
        Math.floor((Date.now() - startedAtMs) / 1000)
      )

      return NextResponse.json({
        session: {
          id: activeSession.id,
          startedAt: activeSession.started_at,
          elapsedSeconds: currentElapsed,
          status: activeSession.status,
          currentQuestionIndex: resumeQuestionIndex,
          questions: formattedQuestions,
        },
      })
    }

    // B. JIKA BELUM ADA SESI BERJALAN: Inisialisasi sesi baru dengan Fisher-Yates Shuffle
    // Ambil seluruh butir soal aktif sesuai jenjang target siswa
    const { data: rawQuestions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        target_level,
        question_options (
          id,
          option_text
        )
      `)
      .eq('target_level', student.target_level)
      .eq('is_active', true)

    if (questionsError || !rawQuestions || rawQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Bank soal aktif belum tersedia untuk jenjang ini' },
        { status: 400 }
      )
    }

    // 1. Buat record sesi baru
    const { data: newSession, error: createSessionError } = await supabase
      .from('test_sessions')
      .insert({
        student_id: studentId,
        device_token: deviceToken,
        status: 'IN_PROGRESS',
        elapsed_seconds: 0,
      })
      .select('*')
      .single()

    if (createSessionError || !newSession) {
      console.error('Error creating new test session:', createSessionError)
      return NextResponse.json(
        { error: 'Gagal membuat sesi ujian baru' },
        { status: 500 }
      )
    }

    // 2. Acak urutan butir soal dengan Algoritma Fisher-Yates
    const shuffledQuestions = fisherYatesShuffle(rawQuestions)

    // 3. Siapkan baris test_responses dan acak opsi jawaban masing-masing soal
    interface ResponseInsert {
      session_id: string
      question_id: string
      display_order: number
      selected_option_id: string | null
    }

    interface ClientQuestion {
      id: string
      displayOrder: number
      questionText: string
      targetLevel: string
      selectedOptionId: string | null
      options: Array<{
        id: string
        optionText: string
      }>
    }

    const responseInserts: ResponseInsert[] = []
    const clientQuestions: ClientQuestion[] = []

    shuffledQuestions.forEach((q, index) => {
      const displayOrder = index + 1
      responseInserts.push({
        session_id: newSession.id,
        question_id: q.id,
        display_order: displayOrder,
        selected_option_id: null,
      })

      // Acak urutan pilihan opsi jawaban dengan seeded Fisher-Yates per sesi
      const rawOptions = (q.question_options || []).map((opt) => ({
        id: opt.id,
        optionText: opt.option_text,
      }))
      const shuffledOptions = seededFisherYatesShuffle(rawOptions, `${newSession.id}_${q.id}`)

      clientQuestions.push({
        id: q.id,
        displayOrder,
        questionText: q.question_text,
        targetLevel: q.target_level,
        selectedOptionId: null,
        options: shuffledOptions,
      })
    })

    // 4. Batch insert lembar jawaban siswa
    const { error: insertResponsesError } = await supabase
      .from('test_responses')
      .insert(responseInserts)

    if (insertResponsesError) {
      console.error('Error inserting test responses:', insertResponsesError)
      return NextResponse.json(
        { error: 'Gagal menginisialisasi lembar jawaban siswa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      session: {
        id: newSession.id,
        startedAt: newSession.started_at,
        elapsedSeconds: 0,
        status: newSession.status,
        currentQuestionIndex: 0,
        questions: clientQuestions,
      },
    })
  } catch (err) {
    console.error('Unexpected error in student start:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
