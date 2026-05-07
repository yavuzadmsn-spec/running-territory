import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('territory_cells')
    .select('club_id, defense_score, clubs(name, color)')
    .not('club_id', 'is', null)

  if (!data) return NextResponse.json({ rankings: [] })

  const map = new Map<string, { name: string; color: string; cells: number; totalDefense: number }>()

  for (const row of data) {
    const id = row.club_id as string
    const club = row.clubs as any
    if (!id || !club) continue
    if (!map.has(id)) map.set(id, { name: club.name, color: club.color, cells: 0, totalDefense: 0 })
    const entry = map.get(id)!
    entry.cells++
    entry.totalDefense += row.defense_score
  }

  const rankings = Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v, avgDefense: +(v.totalDefense / v.cells).toFixed(1) }))
    .sort((a, b) => b.cells - a.cells)

  return NextResponse.json({ rankings })
}
