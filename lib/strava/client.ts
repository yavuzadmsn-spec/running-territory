const BASE = 'https://www.strava.com'

export function getStravaAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/strava/callback`,
    response_type: 'code',
    scope: 'activity:read_all',
    state: userId
  })
  return `${BASE}/oauth/authorize?${params}`
}

export async function exchangeCode(code: string) {
  const res = await fetch(`${BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    })
  })
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`)
  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_at: number
    athlete: { id: number }
  }>
}

export async function refreshAccessToken(token: string) {
  const res = await fetch(`${BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: token,
      grant_type: 'refresh_token'
    })
  })
  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_at: number
  }>
}

export async function fetchActivities(accessToken: string, page = 1) {
  const res = await fetch(
    `${BASE}/api/v3/athlete/activities?per_page=30&page=${page}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  return res.json() as Promise<Array<{
    id: number; name: string; distance: number; start_date: string
  }>>
}

export async function fetchActivityCoords(
  activityId: number, accessToken: string
): Promise<Array<{ lat: number; lng: number }>> {
  const res = await fetch(
    `${BASE}/api/v3/activities/${activityId}/streams?keys=latlng&key_by_type=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const data = await res.json()
  return (data.latlng?.data ?? []).map(([lat, lng]: [number, number]) => ({ lat, lng }))
}
