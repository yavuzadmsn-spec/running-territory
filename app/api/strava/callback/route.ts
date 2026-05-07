import { createClient } from '@/lib/supabase/server'
import { exchangeCode } from '@/lib/strava/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/map?error=strava_denied', req.url))
  }

  const tokens = await exchangeCode(code)
  const supabase = await createClient()

  await supabase.from('strava_tokens').upsert({
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_at
  })

  return NextResponse.redirect(new URL('/map?strava=connected', req.url))
}
