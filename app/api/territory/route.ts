import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('territory_cells')
    .select(`
      cell_id,
      defense_score,
      last_conquered_at,
      clubs (id, name, color)
    `)
    .not('club_id', 'is', null)
    .limit(5000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ cells: data })
}
