'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface ClubItem {
  id: string
  name: string
  color: string
  memberCount: number
  isMember: boolean
}

export function ClubList({ clubs }: { clubs: ClubItem[] }) {
  return (
    <div className="space-y-2">
      {clubs.map((club) => <ClubCard key={club.id} club={club} />)}
    </div>
  )
}

function ClubCard({ club }: { club: ClubItem }) {
  const [hover,   setHover]   = useState(false)
  const [joined,  setJoined]  = useState(club.isMember)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleJoin() {
    if (joined || loading) return
    setLoading(true)
    const res = await fetch(`/api/clubs/${club.id}/join`, { method: 'POST' })
    if (res.ok) { setJoined(true); router.refresh() }
    setLoading(false)
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex items-center gap-3.5 px-4 py-3.5 rounded-[18px] transition-all duration-200 overflow-hidden"
      style={{
        background: hover
          ? 'linear-gradient(180deg, #181818, #121212)'
          : 'linear-gradient(180deg, #141414, #0F0F0F)',
        border: `1px solid ${hover ? club.color + '35' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hover
          ? `0 1px 0 rgba(255,255,255,0.04) inset, 0 0 24px -8px ${club.color}40`
          : '0 1px 0 rgba(255,255,255,0.03) inset',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{
          background: club.color,
          opacity: joined ? 1 : 0.4,
          boxShadow: joined ? `0 0 12px ${club.color}` : 'none',
        }}
      />

      {/* Color badge */}
      <div
        className="relative w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center ml-1"
        style={{
          background: `linear-gradient(180deg, ${club.color}1C, ${club.color}08)`,
          border: `1px solid ${club.color}22`,
        }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full"
          style={{
            background: club.color,
            boxShadow: `0 0 0 2px rgba(255,255,255,0.04), 0 0 12px ${club.color}AA`,
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-display font-bold text-[15px] truncate leading-tight">
          {club.name}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {club.memberCount} üye
          </span>
        </div>
      </div>

      {/* Action */}
      {joined ? (
        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-display font-bold uppercase tracking-wider flex-shrink-0"
          style={{
            background: `linear-gradient(180deg, ${club.color}22, ${club.color}10)`,
            color: club.color,
            border: `1px solid ${club.color}30`,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          Üyesin
        </div>
      ) : (
        <button
          onClick={handleJoin}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-[11px] font-display font-black tracking-wide uppercase transition-all flex-shrink-0 disabled:opacity-40 tap"
          style={{
            background: hover
              ? `linear-gradient(180deg, ${club.color}, ${club.color}dd)`
              : 'transparent',
            color: hover ? '#000' : club.color,
            border: `1px solid ${hover ? club.color : club.color + '55'}`,
            boxShadow: hover ? `0 1px 0 rgba(255,255,255,0.25) inset, 0 8px 24px -8px ${club.color}80` : 'none',
            minWidth: 64,
          }}
        >
          {loading ? '...' : 'Katıl'}
        </button>
      )}
    </div>
  )
}
