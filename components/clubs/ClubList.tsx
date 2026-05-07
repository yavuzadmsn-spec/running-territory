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
      className="flex items-center gap-4 px-4 py-3.5 rounded-[18px] transition-all duration-200"
      style={{
        background: hover ? '#181818' : '#121212',
        border: `1px solid ${hover ? club.color + '28' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Color badge */}
      <div
        className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center"
        style={{ background: club.color + '15' }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full"
          style={{ background: club.color, boxShadow: `0 0 10px ${club.color}80` }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-display font-bold text-[15px] truncate leading-tight">
          {club.name}
        </div>
        <div className="font-mono text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {club.memberCount} üye
        </div>
      </div>

      {/* Action */}
      {joined ? (
        <div
          className="px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider flex-shrink-0"
          style={{ background: club.color + '15', color: club.color }}
        >
          Üyesin
        </div>
      ) : (
        <button
          onClick={handleJoin}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-display font-bold transition-all flex-shrink-0 disabled:opacity-40"
          style={{
            background: hover ? club.color : 'transparent',
            color: hover ? '#000' : club.color,
            border: `1px solid ${club.color}50`,
            minWidth: 64,
          }}
        >
          {loading ? '...' : 'Katıl'}
        </button>
      )}
    </div>
  )
}
