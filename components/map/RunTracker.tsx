'use client'
import { useState, useEffect, useRef } from 'react'
import { useLiveRun } from '@/hooks/useLiveRun'
import { createClient } from '@/lib/supabase/client'

function formatTime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function formatDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)}` : `${Math.round(m)}`
}

function formatDistUnit(m: number) {
  return m >= 1000 ? 'KM' : 'M'
}

interface Club { id: string; name: string; color: string }
interface PresenceMeta { userId: string; clubColor: string; avatar: string; avatarColor: string }

export function RunTracker() {
  const [clubId, setClubId] = useState<string | null>(null)
  const [clubs, setClubs] = useState<Club[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [presenceMeta, setPresenceMeta] = useState<PresenceMeta | undefined>(undefined)
  const userInfoRef = useRef<{ userId: string; avatar: string; avatarColor: string } | null>(null)
  const { running, stats, error, start, stop } = useLiveRun(clubId, presenceMeta)

  useEffect(() => {
    async function loadMyData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [clubsRes, profileRes] = await Promise.all([
        supabase.from('club_members').select('club_id, clubs(id, name, color)').eq('user_id', user.id),
        supabase.from('profiles').select('avatar_color, avatar_emoji').eq('id', user.id).single(),
      ])

      const name: string = user.user_metadata?.full_name ?? user.email ?? ''
      const initials = name.split(/[\s@]/).filter(Boolean).map((n: string) => n[0].toUpperCase()).join('').slice(0, 2) || 'U'
      const avatar = profileRes.data?.avatar_emoji ?? initials
      const avatarColor = profileRes.data?.avatar_color ?? '#22C55E'

      userInfoRef.current = { userId: user.id, avatar, avatarColor }

      if (clubsRes.data) {
        const list = clubsRes.data.map((r: any) => r.clubs).filter(Boolean)
        setClubs(list)
        if (list.length === 1) {
          setClubId(list[0].id)
          setPresenceMeta({ userId: user.id, clubColor: list[0].color, avatar, avatarColor })
        }
      }
    }
    loadMyData()
  }, [])

  const selectedClub = clubs.find(c => c.id === clubId)

  function handleSetClubId(id: string) {
    setClubId(id)
    const club = clubs.find(c => c.id === id)
    if (club && userInfoRef.current) {
      setPresenceMeta({ ...userInfoRef.current, clubColor: club.color })
    }
  }

  return (
    <div className="absolute top-4 right-4 z-10 w-[280px]" onClick={e => { if (dropdownOpen) { e.stopPropagation(); setDropdownOpen(false) } }}>
      {!running ? (
        <IdleCard
          clubs={clubs} clubId={clubId} setClubId={handleSetClubId}
          selectedClub={selectedClub} dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen} onStart={start} error={error}
        />
      ) : (
        <RunningCard stats={stats} onStop={stop} clubColor={selectedClub?.color ?? '#22C55E'} />
      )}
    </div>
  )
}

function IdleCard({ clubs, clubId, setClubId, selectedClub, dropdownOpen, setDropdownOpen, onStart, error }: {
  clubs: Club[]; clubId: string | null; setClubId: (id: string) => void
  selectedClub: Club | undefined; dropdownOpen: boolean
  setDropdownOpen: (v: boolean) => void; onStart: () => void; error: string | null
}) {
  return (
    <div className="glass-dark rounded-none p-5" style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[9px] font-mono tracking-[0.3em] text-slate-500 uppercase mb-0.5">Status</div>
          <div className="font-display font-bold text-white text-lg leading-none">Hazır</div>
        </div>
        <div className="text-[9px] font-mono text-[#22C55E] tracking-wider">GPS BEKLIYOR</div>
      </div>

      {clubs.length === 0 && (
        <p className="text-slate-500 text-xs font-mono mb-4">Önce bir kulübe katıl</p>
      )}

      {clubs.length > 1 && (
        <div className="relative mb-4">
          <button
            onClick={e => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
            className="w-full px-3 py-2.5 flex items-center gap-2.5 transition-colors text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {selectedClub && (
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: selectedClub.color, boxShadow: `0 0 8px ${selectedClub.color}` }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">Kulüp</div>
              <div className="text-xs font-display font-semibold text-white truncate">
                {selectedClub?.name ?? 'Seç...'}
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`text-slate-500 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute top-full mt-1 left-0 right-0 z-30 overflow-hidden"
              style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
            >
              {clubs.map(c => (
                <button key={c.id} onClick={() => { setClubId(c.id); setDropdownOpen(false) }}
                  className="w-full px-3 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors hover:bg-white/5"
                  style={{ color: c.id === clubId ? c.color : '#94a3b8' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="font-display font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[#EF4444] text-xs font-mono mb-3">{error}</p>}

      <button
        onClick={onStart} disabled={!clubId}
        className="relative w-full py-4 flex items-center justify-center gap-2.5 font-display font-black text-sm tracking-[0.12em] uppercase transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
        style={{
          background: clubId ? 'linear-gradient(135deg, #16A34A, #22C55E)' : '#1A2744',
          boxShadow: clubId ? '0 0 40px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        BAŞLAT
      </button>
    </div>
  )
}

function RunningCard({ stats, onStop, clubColor }: {
  stats: { cellsClaimed: number; cellsConquered: number; distanceM: number; durationS: number }
  onStop: () => void; clubColor: string
}) {
  return (
    <div
      className="glass-dark rounded-none overflow-hidden"
      style={{
        borderColor: `${clubColor}44`,
        boxShadow: `0 0 0 1px ${clubColor}22, 0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Top accent */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${clubColor}, transparent)` }} />

      <div className="p-5">
        {/* Live indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: clubColor }} />
              <span className="relative w-2 h-2 rounded-full" style={{ background: clubColor }} />
            </span>
            <span className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase" style={{ color: clubColor }}>
              CANLI KOŞ
            </span>
          </div>
          <span className="text-[8px] font-mono text-slate-600 tracking-wider">GPS AKTİF</span>
        </div>

        {/* Big distance */}
        <div className="mb-4 text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-mono font-black text-white leading-none" style={{ fontSize: '3.5rem' }}>
              {formatDist(stats.distanceM)}
            </span>
            <span className="font-mono font-bold text-slate-400 text-lg">{formatDistUnit(stats.distanceM)}</span>
          </div>
          <div className="font-mono text-slate-500 text-sm mt-1">{formatTime(stats.durationS)}</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatBox label="FETHEDİLDİ" value={`+${stats.cellsClaimed}`} color="#3B82F6" />
          <StatBox label="ELE GEÇİRİLDİ" value={`+${stats.cellsConquered}`} color="#EF4444" />
        </div>

        <button
          onClick={onStop}
          className="w-full py-3 font-display font-black text-sm tracking-[0.12em] uppercase transition-all active:scale-[0.97] text-white"
          style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}
        >
          DURDUR
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 text-center" style={{ background: `${color}0d`, border: `1px solid ${color}22` }}>
      <div className="text-[7px] font-mono tracking-[0.2em] mb-1" style={{ color: `${color}99` }}>{label}</div>
      <div className="font-mono font-black text-xl" style={{ color }}>{value}</div>
    </div>
  )
}
