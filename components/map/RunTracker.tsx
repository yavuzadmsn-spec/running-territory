'use client'
import { useState, useEffect } from 'react'
import { useLiveRun } from '@/hooks/useLiveRun'
import { createClient } from '@/lib/supabase/client'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function formatDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`
}

export function RunTracker() {
  const [clubId, setClubId] = useState<string | null>(null)
  const [clubs, setClubs] = useState<Array<{ id: string; name: string; color: string }>>([])
  const { running, stats, error, start, stop } = useLiveRun(clubId)

  useEffect(() => {
    async function loadMyClubs() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('club_members')
        .select('club_id, clubs(id, name, color)')
        .eq('user_id', user.id)
      if (data) {
        const list = data.map((r: any) => r.clubs).filter(Boolean)
        setClubs(list)
        if (list.length === 1) setClubId(list[0].id)
      }
    }
    loadMyClubs()
  }, [])

  return (
    <div className="absolute top-4 right-4 z-10 bg-gray-900/95 backdrop-blur rounded-2xl p-4 w-64 space-y-3 shadow-xl">
      {!running ? (
        <>
          <h3 className="text-white font-bold text-sm">Koşuya Başla</h3>
          {clubs.length > 1 && (
            <select
              value={clubId ?? ''}
              onChange={e => setClubId(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded-lg text-sm border border-gray-700"
            >
              <option value="">Kulüp seç...</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {clubs.length === 0 && (
            <p className="text-gray-400 text-xs">Önce bir kulübe katıl.</p>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={start}
            disabled={!clubId}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Başla
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-semibold">Koşuluyor</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-white font-bold">{formatTime(stats.durationS)}</p>
              <p className="text-gray-400 text-xs">Süre</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-white font-bold">{formatDist(stats.distanceM)}</p>
              <p className="text-gray-400 text-xs">Mesafe</p>
            </div>
            <div className="bg-blue-900/60 rounded-lg p-2 text-center">
              <p className="text-blue-300 font-bold">+{stats.cellsClaimed}</p>
              <p className="text-gray-400 text-xs">Fethedildi</p>
            </div>
            <div className="bg-red-900/60 rounded-lg p-2 text-center">
              <p className="text-red-300 font-bold">+{stats.cellsConquered}</p>
              <p className="text-gray-400 text-xs">Ele geçirildi</p>
            </div>
          </div>

          <button
            onClick={stop}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Bitir
          </button>
        </>
      )}
    </div>
  )
}
