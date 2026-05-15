import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Gender = 'male' | 'female' | 'all'
type Scope  = 'city' | 'country'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = (searchParams.get('type')   ?? 'clubs') as 'clubs' | 'individuals'
  const gender = (searchParams.get('gender') ?? 'all')   as Gender
  const scope  = (searchParams.get('scope')  ?? 'city')  as Scope
  const city   = searchParams.get('city') ?? null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Resolve user's city for "city" scope (or fall back to query param, then 'Bursa')
  let viewerCity: string | null = city
  if (!viewerCity && user) {
    const { data: prof } = await supabase.from('profiles').select('city').eq('id', user.id).maybeSingle()
    viewerCity = prof?.city ?? 'Bursa'
  }
  if (!viewerCity) viewerCity = 'Bursa'

  if (type === 'individuals') {
    return NextResponse.json({
      rankings: await individualRankings(supabase, gender),
      meta: { viewerCity },
    })
  }
  return NextResponse.json({
    rankings: await clubRankings(supabase, scope, viewerCity),
    meta: { viewerCity },
  })
}

async function clubRankings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  scope: Scope,
  viewerCity: string,
) {
  // Optionally restrict by city via clubs.city
  let clubIds: string[] | null = null
  if (scope === 'city') {
    const { data: cityClubs } = await supabase.from('clubs').select('id').eq('city', viewerCity)
    clubIds = (cityClubs ?? []).map(c => c.id)
    if (clubIds.length === 0) return []
  }

  let query = supabase
    .from('territory_cells')
    .select('club_id, defense_score, clubs(name, color, city)')
    .not('club_id', 'is', null)

  if (clubIds) query = query.in('club_id', clubIds)

  const { data } = await query
  if (!data) return []

  const map = new Map<string, { name: string; color: string; city: string | null; cells: number; totalDefense: number }>()
  for (const row of data) {
    const id = row.club_id as string
    const club = row.clubs as any
    if (!id || !club) continue
    if (!map.has(id)) map.set(id, { name: club.name, color: club.color, city: club.city ?? null, cells: 0, totalDefense: 0 })
    const e = map.get(id)!
    e.cells++
    e.totalDefense += row.defense_score as number
  }

  return Array.from(map.entries())
    .map(([id, v]) => ({
      id,
      name: v.name,
      color: v.color,
      city: v.city,
      cells: v.cells,
      avgDefense: +(v.totalDefense / v.cells).toFixed(1),
    }))
    .sort((a, b) => b.cells - a.cells)
}

async function individualRankings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gender: Gender,
) {
  const { data: cellRows } = await supabase
    .from('territory_cells')
    .select('user_id')
    .not('user_id', 'is', null)

  if (!cellRows || cellRows.length === 0) return []

  const counts = new Map<string, number>()
  for (const r of cellRows) {
    const uid = r.user_id as string
    counts.set(uid, (counts.get(uid) ?? 0) + 1)
  }

  const userIds = Array.from(counts.keys())

  let profileQuery = supabase
    .from('profiles')
    .select('id, username, avatar_color, avatar_url, gender, city')
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
      city: p.city ?? null,
      cells: counts.get(p.id) ?? 0,
    }))
    .filter(r => r.cells > 0)
    .sort((a, b) => b.cells - a.cells)
}
