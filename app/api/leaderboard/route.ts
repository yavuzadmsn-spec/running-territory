import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Gender = 'male' | 'female' | 'all'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = (searchParams.get('type')   ?? 'clubs') as 'clubs' | 'individuals'
  const gender = (searchParams.get('gender') ?? 'all')   as Gender

  const supabase = await createClient()

  if (type === 'individuals') {
    return NextResponse.json({ rankings: await individualRankings(supabase, gender) })
  }
  return NextResponse.json({ rankings: await clubRankings(supabase, gender) })
}

async function clubRankings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gender: Gender,
) {
  // Base query — cells with their club info
  let query = supabase
    .from('territory_cells')
    .select('club_id, user_id, defense_score, clubs(name, color)')
    .not('club_id', 'is', null)

  // Apply gender filter via user_id → profiles.gender
  if (gender !== 'all') {
    const { data: matched } = await supabase
      .from('profiles').select('id').eq('gender', gender)
    const ids = (matched ?? []).map(p => p.id)
    if (ids.length === 0) return []
    query = query.in('user_id', ids)
  }

  const { data } = await query
  if (!data) return []

  const map = new Map<string, { name: string; color: string; cells: number; totalDefense: number }>()
  for (const row of data) {
    const id = row.club_id as string
    const club = row.clubs as any
    if (!id || !club) continue
    if (!map.has(id)) map.set(id, { name: club.name, color: club.color, cells: 0, totalDefense: 0 })
    const e = map.get(id)!
    e.cells++
    e.totalDefense += row.defense_score as number
  }

  return Array.from(map.entries())
    .map(([id, v]) => ({
      id,
      name: v.name,
      color: v.color,
      cells: v.cells,
      avgDefense: +(v.totalDefense / v.cells).toFixed(1),
    }))
    .sort((a, b) => b.cells - a.cells)
}

async function individualRankings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gender: Gender,
) {
  let query = supabase
    .from('territory_cells')
    .select('user_id')
    .not('user_id', 'is', null)

  const { data: cellRows } = await query
  if (!cellRows || cellRows.length === 0) return []

  // Count cells per user
  const counts = new Map<string, number>()
  for (const r of cellRows) {
    const uid = r.user_id as string
    counts.set(uid, (counts.get(uid) ?? 0) + 1)
  }

  const userIds = Array.from(counts.keys())

  // Fetch profiles
  let profileQuery = supabase
    .from('profiles')
    .select('id, username, avatar_color, avatar_url, gender')
    .in('id', userIds)

  if (gender !== 'all') profileQuery = profileQuery.eq('gender', gender)

  const { data: profiles } = await profileQuery
  if (!profiles) return []

  return profiles
    .map(p => ({
      id: p.id,
      name: p.username || 'Anonim Koşucu',
      color: p.avatar_color || '#22C55E',
      avatarUrl: p.avatar_url ?? null,
      gender: p.gender ?? null,
      cells: counts.get(p.id) ?? 0,
    }))
    .filter(r => r.cells > 0)
    .sort((a, b) => b.cells - a.cells)
}
