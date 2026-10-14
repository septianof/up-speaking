import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in staff logout:', err)
    return NextResponse.json(
      { error: 'Gagal melakukan logout' },
      { status: 500 }
    )
  }
}
