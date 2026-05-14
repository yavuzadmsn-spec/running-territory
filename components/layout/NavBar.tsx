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
        {/* Top fade so content scroll smoothly disappears under bar */}
        <div
          className="absolute -top-6 left-0 right-0 h-6 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.85), transparent)' }}
        />

        <div
          className="relative px-2"
          style={{
            background: 'rgba(10,10,10,0.92)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            height: 64,
            display: 'flex',
            alignItems: 'center',
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
                  boxShadow: `0 0 0 1.5px rgba(255,255,255,0.10), 0 2px 8px ${avatarColor}40`,
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
                className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 tap"
              >
                {/* Active pill background */}
                <div
                  className="absolute inset-x-3 inset-y-2 rounded-2xl transition-all duration-300"
                  style={{
                    background: isActive ? 'rgba(34,197,94,0.10)' : 'transparent',
                    boxShadow: isActive
                      ? 'inset 0 0 0 1px rgba(34,197,94,0.18), 0 0 28px -10px rgba(34,197,94,0.55)'
                      : 'none',
                    transform: isActive ? 'scale(1)' : 'scale(0.92)',
                    opacity: isActive ? 1 : 0,
                  }}
                />

                {/* Icon */}
                <div className="relative flex items-center justify-center">
                  <Icon
                    width={22}
                    height={22}
                    style={{
                      color: isActive ? '#22C55E' : 'rgba(255,255,255,0.42)',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                </div>

                <span
                  className="relative font-display text-[10px] tracking-[0.04em] leading-none transition-colors"
                  style={{
                    color: isActive ? '#22C55E' : 'rgba(255,255,255,0.42)',
                    fontWeight: isActive ? 700 : 500,
                  }}
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
