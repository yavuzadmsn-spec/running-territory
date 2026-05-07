'use client'
import { useCallback, useRef, useState } from 'react'
import { latLngToCell } from 'h3-js'
import { createClient } from '@/lib/supabase/client'

const H3_RESOLUTION = 9
const GPS_INTERVAL_MS = 5000

export interface RunStats {
  cellsClaimed: number
  cellsConquered: number
  distanceM: number
  durationS: number
}

export function useLiveRun(clubId: string | null, presenceMeta?: { userId: string; clubColor: string; avatar: string; avatarColor: string }) {
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState<RunStats>({ cellsClaimed: 0, cellsConquered: 0, distanceM: 0, durationS: 0 })
  const [error, setError] = useState<string | null>(null)

  const activityIdRef = useRef<string | null>(null)
  const visitedCells = useRef<Set<string>>(new Set())
  const watchIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastPosRef = useRef<GeolocationCoordinates | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const processCell = useCallback(async (cellId: string) => {
    if (!activityIdRef.current || !clubId) return
    if (visitedCells.current.has(cellId)) return
    visitedCells.current.add(cellId)

    try {
      const res = await fetch('/api/run/cell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_id: activityIdRef.current, club_id: clubId, cell_id: cellId })
      })
      const result = await res.json()
      setStats(prev => ({
        ...prev,
        cellsClaimed: prev.cellsClaimed + (result.claimed ?? 0),
        cellsConquered: prev.cellsConquered + (result.conquered ?? 0)
      }))
    } catch { /* sessizce geç */ }
  }, [clubId])

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = pos.coords
    if (accuracy > 50) return

    const cellId = latLngToCell(latitude, longitude, H3_RESOLUTION)
    processCell(cellId)

    if (lastPosRef.current) {
      const d = haversineM(lastPosRef.current.latitude, lastPosRef.current.longitude, latitude, longitude)
      setStats(prev => ({ ...prev, distanceM: prev.distanceM + d }))
    }
    lastPosRef.current = pos.coords

    // Konumu diğer oyunculara yayınla
    if (channelRef.current && presenceMeta) {
      channelRef.current.track({
        userId: presenceMeta.userId,
        lat: latitude,
        lng: longitude,
        clubColor: presenceMeta.clubColor,
        avatar: presenceMeta.avatar,
        avatarColor: presenceMeta.avatarColor,
      }).catch(() => {})
    }
  }, [processCell, presenceMeta])

  const start = useCallback(async () => {
    if (!clubId) { setError('Önce bir kulübe katıl'); return }
    setError(null)
    try {
      const res = await fetch('/api/run/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ club_id: clubId })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      activityIdRef.current = data.activity_id
      visitedCells.current = new Set()
      lastPosRef.current = null
      startTimeRef.current = Date.now()
      setStats({ cellsClaimed: 0, cellsConquered: 0, distanceM: 0, durationS: 0 })
      setRunning(true)

      // Realtime presence kanalına bağlan
      const supabase = createClient()
      const channel = supabase.channel('active_runners')
      await channel.subscribe()
      channelRef.current = channel

      timerRef.current = setInterval(() => {
        setStats(prev => ({ ...prev, durationS: Math.floor((Date.now() - startTimeRef.current) / 1000) }))
      }, 1000)

      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        (err) => setError(`GPS hatası: ${err.message}`),
        { enableHighAccuracy: true, maximumAge: GPS_INTERVAL_MS, timeout: 10000 }
      )
    } catch {
      setError('Koşu başlatılamadı')
    }
  }, [clubId, handlePosition])

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // Presence'dan çık
    if (channelRef.current) {
      channelRef.current.untrack().catch(() => {})
      createClient().removeChannel(channelRef.current)
      channelRef.current = null
    }
    setRunning(false)
  }, [])

  return { running, stats, error, start, stop }
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
