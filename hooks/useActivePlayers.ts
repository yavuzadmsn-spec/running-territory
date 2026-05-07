'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ActivePlayer {
  userId: string
  lat: number
  lng: number
  clubColor: string
  avatar: string  // emoji or initials
  avatarColor: string
}

export function useActivePlayers() {
  const [players, setPlayers] = useState<Map<string, ActivePlayer>>(new Map())
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('active_runners', {
      config: { presence: { key: 'runners' } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<ActivePlayer>()
        const map = new Map<string, ActivePlayer>()
        Object.values(state).flat().forEach((p) => {
          if (p.userId && p.lat && p.lng) {
            map.set(p.userId, p as ActivePlayer)
          }
        })
        setPlayers(new Map(map))
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function broadcastPosition(player: ActivePlayer) {
    if (!channelRef.current) return
    await channelRef.current.track(player)
  }

  async function clearPosition() {
    if (!channelRef.current) return
    await channelRef.current.untrack()
  }

  return { players, broadcastPosition, clearPosition }
}
