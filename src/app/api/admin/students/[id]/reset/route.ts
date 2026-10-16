import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaffAuth } from '@/lib/supabase/auth-guard'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyStaffAuth(['ADMIN'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const studentId = params.id
    if (!studentId) {
      return NextResponse.json(
        { error: 'ID siswa wajib disertakan' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Cek apakah siswa ada
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, full_name')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // 2. Lakukan Soft Reset: Tandai sesi aktif sebelumnya menjadi 'RESET'
    // Jejak data lama tetap tersimpan untuk audit trail lembaga (PRD FR-010)
    const { data: updatedSessions, error: updateError } = await supabase
      .from('test_sessions')
      .update({ status: 'RESET' })
      .eq('student_id', studentId)
      .neq('status', 'RESET')
      .select('id')

    if (updateError) {
      console.error('Error resetting test sessions:', updateError)
      return NextResponse.json(
        { error: 'Gagal melakukan reset sesi pengerjaan' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Sesi ujian siswa ${student.full_name} berhasil di-reset. Siswa kini dapat memulai tes baru dari awal.`,
      resetSessionCount: updatedSessions?.length || 0,
    })
  } catch (err) {
    console.error('Unexpected error in student reset:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
