import { createClient } from '@/lib/supabase/server'

export interface ConquestResult {
  claimed: number
  conquered: number
  reinforced: number
  weakened: number
}

export async function processActivityCells(
  activityId: string,
  clubId: string,
  cellIds: string[],
  userId?: string,
): Promise<ConquestResult> {
  const supabase = await createClient()
  const result: ConquestResult = { claimed: 0, conquered: 0, reinforced: 0, weakened: 0 }

  // Derive user_id from activity if not provided
  let resolvedUserId = userId
  if (!resolvedUserId) {
    const { data: act } = await supabase.from('activities').select('user_id').eq('id', activityId).maybeSingle()
    resolvedUserId = act?.user_id ?? undefined
  }

  for (const cellId of cellIds) {
    const { data: cell } = await supabase
      .from('territory_cells')
      .select('*')
      .eq('cell_id', cellId)
      .single()

    if (!cell) {
      await supabase.from('territory_cells').insert({
        cell_id: cellId, club_id: clubId, user_id: resolvedUserId, defense_score: 1,
        last_conquered_at: new Date().toISOString()
      })
      await recordConquest(supabase, cellId, null, clubId, activityId)
      result.claimed++
      continue
    }

    if (cell.club_id === clubId) {
      await supabase.from('territory_cells')
        .update({ defense_score: Math.min(cell.defense_score + 1, 5), user_id: resolvedUserId })
        .eq('cell_id', cellId)
      result.reinforced++
      continue
    }

    if (cell.defense_score <= 1) {
      await supabase.from('territory_cells')
        .update({ club_id: clubId, user_id: resolvedUserId, defense_score: 1, last_conquered_at: new Date().toISOString() })
        .eq('cell_id', cellId)
      await recordConquest(supabase, cellId, cell.club_id, clubId, activityId)
      result.conquered++
    } else {
      await supabase.from('territory_cells')
        .update({ defense_score: cell.defense_score - 1 })
        .eq('cell_id', cellId)
      result.weakened++
    }
  }

  return result
}

async function recordConquest(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cellId: string,
  fromClubId: string | null,
  toClubId: string,
  activityId: string
) {
  await supabase.from('conquest_history').insert({
    cell_id: cellId, from_club_id: fromClubId, to_club_id: toClubId, activity_id: activityId
  })
}
