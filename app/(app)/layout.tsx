import { NavBar } from '@/components/layout/NavBar'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name: string = user?.user_metadata?.full_name ?? user?.email ?? ''
  const initials = name
    .split(/[\s@]/)
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('')
    .slice(0, 2) || 'U'

  const { data: profile } = user
    ? await supabase.from('profiles').select('avatar_color, avatar_emoji').eq('id', user.id).single()
    : { data: null }

  return (
    <div className="min-h-screen bg-[#050A14] text-white">
      <NavBar
        initials={initials}
        avatarColor={profile?.avatar_color ?? '#22C55E'}
        avatarEmoji={profile?.avatar_emoji ?? null}
      />
      <main className="pb-16 md:pb-0">{children}</main>
    </div>
  )
}
