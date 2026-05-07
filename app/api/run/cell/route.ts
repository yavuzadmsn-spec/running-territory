import { createClient } from '@/lib/supabase/server'
import { processActivityCells } from '@/lib/territory/conquest'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { activity_id, club_id, cell_id } = await req.json()
  if (!activity_id || !club_id || !cell_id) {
    return NextResponse.json({ error: 'activity_id, club_id, cell_id required' }, { status: 400 })
  }

  const result = await processActivityCells(activity_id, club_id, [cell_id])
  return NextResponse.json(result)
}
