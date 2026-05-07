'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HexLogo, MapIcon, UsersIcon, TrophyIcon, LogoutIcon } from '@/components/ui/design-system'

const NAV_ITEMS = [
  { href: '/map',         label: 'Harita',   Icon: MapIcon },
  { href: '/clubs',       label: 'Kulüpler', Icon: UsersIcon },
  { href: '/leaderboard', label: 'Sıralama', Icon: TrophyIcon },
]

export function NavBar({
  initials,
  avatarColor = '#22C55E',
  avatarEmoji,
}: {
  initials: string
  avatarColor?: string
  avatarEmoji?: string | null
}) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const avatarContent = avatarEmoji ?? initials

  return (
    <>
      {/* ── Desktop top bar ── */}
      <nav
        className="h-[56px] sticky top-0 z-50 hidden md:flex items-center px-6 gap-8"
        style={{
          background: 'rgba(8,8,8,0.95)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <HexLogo size={28} />
          <span className="font-display font-black tracking-tight text-[14px] text-white">TERRITORY</span>
        </div>

        {/* Nav links */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className="relative px-4 py-2 flex items-center gap-2 rounded-xl transition-all"
                style={{
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.40)',
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                }}
              >
                <Icon width={15} height={15} />
                <span className="font-display font-semibold text-xs tracking-[0.06em] uppercase">{label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-px left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                    style={{ background: '#22C55E', boxShadow: '0 0 8px #22C55E' }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/profile" title="Profil">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${avatarColor}cc, ${avatarColor})`,
                boxShadow: `0 0 12px ${avatarColor}40`,
              }}
            >
              {avatarContent}
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <LogoutIcon width={16} height={16} />
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          style={{
            background: 'rgba(8,8,8,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            height: 64,
            display: 'flex',
          }}
        >
          {[...NAV_ITEMS, {
            href: '/profile',
            label: 'Profil',
            Icon: () => (
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{
                  background: `linear-gradient(135deg, ${avatarColor}cc, ${avatarColor})`,
                }}
              >
                {avatarContent}
              </div>
            )
          }].map(({ href, label, Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="relative flex-1 flex flex-col items-center justify-center gap-[5px]"
              >
                {/* Active top indicator */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full"
                    style={{ background: '#22C55E', boxShadow: '0 2px 8px #22C55E80' }}
                  />
                )}
                {/* Icon wrapper */}
                <div
                  className="w-10 h-8 flex items-center justify-center rounded-xl transition-all"
                  style={{
                    background: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                  }}
                >
                  <Icon
                    width={20}
                    height={20}
                    style={{ color: isActive ? '#22C55E' : 'rgba(255,255,255,0.32)' }}
                  />
                </div>
                <span
                  className="font-mono text-[9px] tracking-[0.06em] uppercase leading-none"
                  style={{ color: isActive ? '#22C55E' : 'rgba(255,255,255,0.30)' }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
