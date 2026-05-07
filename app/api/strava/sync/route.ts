import { createClient } from '@/lib/supabase/server'
import { fetchActivities, fetchActivityCoords, refreshAccessToken } from '@/lib/strava/client'
import { routeToHexCells } from '@/lib/h3/utils'
import { processActivityCells } from '@/lib/territory/conquest'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const clubId: string = body.club_id
  if (!clubId) return NextResponse.json({ error: 'club_id required' }, { status: 400 })

  const { data: tokenRow } = await supabase
    .from('strava_tokens').select('*').eq('user_id', user.id).single()
  if (!tokenRow) return NextResponse.json({ error: 'Strava not connected' }, { status: 400 })

  let accessToken = tokenRow.access_token
  if (Date.now() / 1000 > tokenRow.expires_at - 300) {
    const refreshed = await refreshAccessToken(tokenRow.refresh_token)
    accessToken = refreshed.access_token
    await supabase.from('strava_tokens').update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: refreshed.expires_at
    }).eq('user_id', user.id)
  }

  const activities = await fetchActivities(accessToken)
  let totalClaimed = 0, totalConquered = 0

  for (const act of activities.slice(0, 10)) {
    const { data: existing } = await supabase
      .from('activities').select('id').eq('strava_id', act.id).single()
    if (existing) continue

    const coords = await fetchActivityCoords(act.id, accessToken)
    if (coords.length < 2) continue

    const { data: activity } = await supabase.from('activities').insert({
      club_id: clubId, user_id: user.id, strava_id: act.id,
      name: act.name, distance_m: act.distance,
      recorded_at: act.start_date
    }).select().single()

    if (!activity) continue

    const cellIds = routeToHexCells(coords)
    const result = await processActivityCells(activity.id, clubId, cellIds)
    totalClaimed += result.claimed
    totalConquered += result.conquered
  }

  return NextResponse.json({ claimed: totalClaimed, conquered: totalConquered })
}
