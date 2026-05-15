'use client'
import { useEffect, useRef, useState } from 'react'
import type { CellDisplay } from '@/lib/h3/utils'
import { useActivePlayers } from '@/hooks/useActivePlayers'
import { runRoute } from '@/lib/runRoute'

interface Props {
  cells: CellDisplay[]
  center?: [number, number]
  zoom?: number
}

export function TerritoryMap({ cells, center = [29.06, 40.19], zoom = 13 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const prevCellIdsRef = useRef<Set<string>>(new Set())
  const userMarkerRef = useRef<any>(null)
  const userPosRef    = useRef<[number, number] | null>(null)
  const followRef     = useRef<boolean>(true)
  const [follow, setFollow] = useState(true)
  const { players } = useActivePlayers()

  /* ─── init map ─── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let map: any

    async function initMap() {
      const maplibregl = (await import('maplibre-gl')).default
      await import('maplibre-gl/dist/maplibre-gl.css')

      map = new maplibregl.Map({
        container: containerRef.current!,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center, zoom,
        // disable rotation; runners want forward-up feel via simple panning
        pitchWithRotate: false,
        dragRotate: false,
      })

      // Disable follow if user pans manually
      map.on('dragstart', () => { followRef.current = false; setFollow(false) })

      map.on('load', () => {
        // Main territory source
        map.addSource('territories', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'territories-fill',
          type: 'fill',
          source: 'territories',
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.4 }
        })
        map.addLayer({
          id: 'territories-border',
          type: 'line',
          source: 'territories',
          paint: { 'line-color': ['get', 'color'], 'line-width': 1, 'line-opacity': 0.6 }
        })

        // Pulse source for newly claimed cells
        map.addSource('territories-pulse', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'territories-pulse-fill',
          type: 'fill',
          source: 'territories-pulse',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['interpolate', ['linear'], ['get', 'opacity'], 0, 0, 1, 0.85],
          }
        })
        map.addLayer({
          id: 'territories-pulse-border',
          type: 'line',
          source: 'territories-pulse',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2.5,
            'line-opacity': ['interpolate', ['linear'], ['get', 'opacity'], 0, 0, 1, 1],
          }
        })

        // Run route line
        map.addSource('run-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'run-route-line',
          type: 'line',
          source: 'run-route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#22C55E',
            'line-width': 4,
            'line-opacity': 0.95,
            'line-blur': 0.5,
          }
        })

        // Tooltip
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
        map.on('mouseenter', 'territories-fill', (e: any) => {
          map.getCanvas().style.cursor = 'pointer'
          const props = e.features?.[0]?.properties
          if (!props) return
          popup.setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:var(--font-display,sans-serif);font-size:12px;font-weight:700;color:#fff;background:rgba(7,16,24,0.95);padding:8px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:0">${props.clubName}<br/><span style="color:#64748b;font-weight:400;font-size:10px">${props.defenseScore} DEF</span></div>`)
            .addTo(map)
        })
        map.on('mouseleave', 'territories-fill', () => {
          map.getCanvas().style.cursor = ''
          popup.remove()
        })
      })

      mapRef.current = map
    }

    initMap()
    return () => { map?.remove(); mapRef.current = null }
  }, [])

  /* ─── update territory layer ─── */
  useEffect(() => {
    const map = mapRef.current
    if (!map || typeof map.getSource !== 'function') return

    async function updateLayer() {
      const { cellsToGeoJSON } = await import('@/lib/h3/utils')

      const currentIds = new Set(cells.map(c => c.cellId))
      const newCells   = cells.filter(c => !prevCellIdsRef.current.has(c.cellId))
      prevCellIdsRef.current = currentIds

      const src = map.getSource('territories')
      if (src) src.setData(cellsToGeoJSON(cells))

      if (newCells.length > 0) {
        const pulseSrc = map.getSource('territories-pulse')
        if (!pulseSrc) return

        const pulseData = cellsToGeoJSON(newCells)
        pulseData.features = pulseData.features.map((f: any) => ({
          ...f, properties: { ...f.properties, opacity: 1 },
        }))
        pulseSrc.setData(pulseData)

        const start = performance.now()
        const duration = 1800
        function animatePulse(now: number) {
          const t = Math.min((now - start) / duration, 1)
          const opacity = 1 - t
          const animated = {
            ...pulseData,
            features: pulseData.features.map((f: any) => ({
              ...f, properties: { ...f.properties, opacity },
            })),
          }
          const s = map.getSource('territories-pulse')
          if (s) s.setData(animated)
          if (t < 1) requestAnimationFrame(animatePulse)
          else if (s) s.setData({ type: 'FeatureCollection', features: [] })
        }
        requestAnimationFrame(animatePulse)
      }
    }

    if (map._loaded) updateLayer()
    else map.once?.('load', updateLayer)
  }, [cells])

  /* ─── subscribe to live run route ─── */
  useEffect(() => {
    let cancelled = false
    const unsub = runRoute.subscribe(state => {
      if (cancelled) return
      const map = mapRef.current
      if (!map) return
      const src = map.getSource?.('run-route')
      if (!src) return

      const data = state.coords.length >= 2
        ? {
            type: 'FeatureCollection' as const,
            features: [{
              type: 'Feature' as const,
              properties: {},
              geometry: { type: 'LineString' as const, coordinates: state.coords },
            }],
          }
        : { type: 'FeatureCollection' as const, features: [] }
      src.setData(data)

      // Auto-follow when running and last point known
      if (state.active && followRef.current && state.coords.length > 0) {
        const last = state.coords[state.coords.length - 1]
        map.easeTo({ center: last, duration: 700 })
      }
    })
    return () => { cancelled = true; unsub() }
  }, [])

  /* ─── geolocation watch: render self marker, auto follow ─── */
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    let cancelled = false
    let maplibregl: any

    ;(async () => {
      maplibregl = (await import('maplibre-gl')).default
    })()

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return
        const { latitude, longitude } = pos.coords
        userPosRef.current = [longitude, latitude]
        const map = mapRef.current
        if (!map) return

        if (!userMarkerRef.current && maplibregl) {
          const el = document.createElement('div')
          el.style.cssText = `
            position: relative;
            width: 22px; height: 22px;
            display: flex; align-items: center; justify-content: center;
          `
          el.innerHTML = `
            <span style="position:absolute;inset:-12px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,0.45),transparent 70%);animation:userPulse 2s ease-in-out infinite;"></span>
            <span style="position:relative;width:14px;height:14px;border-radius:50%;background:#22C55E;border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.4),0 0 14px rgba(34,197,94,0.8);"></span>
          `
          if (!document.getElementById('user-pulse-style')) {
            const s = document.createElement('style')
            s.id = 'user-pulse-style'
            s.textContent = `
              @keyframes userPulse {
                0%   { transform: scale(0.6); opacity: 0.9; }
                100% { transform: scale(1.8); opacity: 0; }
              }
            `
            document.head.appendChild(s)
          }
          userMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map)

          // First fix — recenter
          map.easeTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 15), duration: 800 })
        } else if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([longitude, latitude])
        }

        if (followRef.current) {
          map.easeTo({ center: [longitude, latitude], duration: 500 })
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )

    return () => {
      cancelled = true
      navigator.geolocation.clearWatch(id)
      userMarkerRef.current?.remove()
      userMarkerRef.current = null
    }
  }, [])

  /* ─── live player markers (other users) ─── */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    async function updateMarkers() {
      const maplibregl = (await import('maplibre-gl')).default
      const existing = new Set(markersRef.current.keys())

      players.forEach((player) => {
        existing.delete(player.userId)

        if (markersRef.current.has(player.userId)) {
          markersRef.current.get(player.userId).setLngLat([player.lng, player.lat])
        } else {
          const el = document.createElement('div')
          el.style.cssText = `
            width: 32px; height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${player.avatarColor}bb, ${player.avatarColor});
            border: 2px solid ${player.avatarColor};
            box-shadow: 0 0 14px ${player.avatarColor}88, 0 0 28px ${player.avatarColor}33;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 800; color: white;
            cursor: pointer;
            font-family: var(--font-display, sans-serif);
            animation: markerPulse 2.5s ease-in-out infinite;
          `
          el.textContent = player.avatar
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([player.lng, player.lat])
            .addTo(map)
          markersRef.current.set(player.userId, marker)
        }
      })

      existing.forEach((userId) => {
        markersRef.current.get(userId)?.remove()
        markersRef.current.delete(userId)
      })
    }

    if (map._loaded) updateMarkers()
    else map.once?.('load', updateMarkers)
  }, [players])

  /* ─── control handlers ─── */
  const recenter = () => {
    const map = mapRef.current
    const pos = userPosRef.current
    if (!map || !pos) return
    followRef.current = true
    setFollow(true)
    map.easeTo({ center: pos, zoom: Math.max(map.getZoom(), 16), duration: 600 })
  }
  const zoomIn  = () => mapRef.current?.zoomIn()
  const zoomOut = () => mapRef.current?.zoomOut()

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />

      {/* Right-side controls */}
      <div
        className="absolute right-3 z-10 flex flex-col gap-2"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)' }}
      >
        <CtrlButton onClick={recenter} active={follow} label="Konum">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </CtrlButton>
        <CtrlButton onClick={zoomIn} label="Yakınlaş">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </CtrlButton>
        <CtrlButton onClick={zoomOut} label="Uzaklaş">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </CtrlButton>
      </div>
    </>
  )
}

function CtrlButton({ children, onClick, active, label }: {
  children: React.ReactNode; onClick: () => void; active?: boolean; label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-11 h-11 rounded-2xl flex items-center justify-center tap"
      style={{
        background: active
          ? 'linear-gradient(180deg, rgba(34,197,94,0.18), rgba(34,197,94,0.08))'
          : 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1px solid ${active ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.09)'}`,
        color: active ? '#22C55E' : '#fff',
        boxShadow: active
          ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(34,197,94,0.20), 0 6px 20px -6px rgba(34,197,94,0.5)'
          : '0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 24px -8px rgba(0,0,0,0.6)',
      }}
    >
      {children}
    </button>
  )
}
