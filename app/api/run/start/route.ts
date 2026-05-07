import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { club_id } = await req.json()
  if (!club_id) return NextResponse.json({ error: 'club_id required' }, { status: 400 })

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      club_id,
      user_id: user.id,
      name: `Koşu ${new Date().toLocaleDateString('tr-TR')}`,
      recorded_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ activity_id: activity.id })
}
