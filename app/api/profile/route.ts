import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    Promise.resolve({ data: null })
  ])

  // Stats queries
  const [runsResult, clubsResult] = await Promise.all([
    supabase.from('activities').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('club_members').select('club_id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  // Cells owned by user's clubs
  const { data: myClubs } = await supabase
    .from('club_members').select('club_id').eq('user_id', user.id)
  const myClubIds = (myClubs ?? []).map((m) => m.club_id)
  const cellsResult = myClubIds.length > 0
    ? await supabase.from('territory_cells').select('cell_id', { count: 'exact', head: true }).in('club_id', myClubIds)
    : { count: 0 }

  return NextResponse.json({
    profile: profile ?? {
      id: user.id,
      username: user.user_metadata?.full_name ?? '',
      bio: '',
      avatar_color: '#22C55E',
      avatar_emoji: null,
    },
    user: { email: user.email, full_name: user.user_metadata?.full_name },
    stats: {
      runs: runsResult.count ?? 0,
      clubs: clubsResult.count ?? 0,
      cells: cellsResult.count ?? 0,
    },
  })
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, bio, avatar_color, avatar_emoji, avatar_url, full_name, gender, city } = await req.json()

  const [profileResult, metaResult] = await Promise.all([
    supabase.from('profiles').upsert({
      id: user.id,
      username: username ?? null,
      bio: bio ?? null,
      avatar_color: avatar_color ?? '#22C55E',
      avatar_emoji: avatar_emoji ?? null,
      ...(avatar_url !== undefined ? { avatar_url } : {}),
      ...(gender !== undefined ? { gender } : {}),
      ...(city   !== undefined ? { city   } : {}),
      updated_at: new Date().toISOString(),
    }),
    full_name !== undefined
      ? supabase.auth.updateUser({ data: { full_name } })
      : Promise.resolve({ error: null }),
  ])

  if (profileResult.error) return NextResponse.json({ error: profileResult.error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
