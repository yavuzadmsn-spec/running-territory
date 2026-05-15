import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clubs')
    .select('*, club_members(count)')
    .order('created_at', { ascending: false })
  return NextResponse.json({ clubs: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color, city } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const { data: club, error } = await supabase
    .from('clubs')
    .insert({ name: name.trim(), color: color ?? '#3B82F6', city: city ?? 'Bursa' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('club_members').insert({
    club_id: club.id, user_id: user.id, role: 'admin'
  })

  return NextResponse.json({ club }, { status: 201 })
}
