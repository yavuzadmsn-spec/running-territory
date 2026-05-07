'use client'
import { useEffect, useRef } from 'react'
import type { CellDisplay } from '@/lib/h3/utils'
import { useActivePlayers } from '@/hooks/useActivePlayers'

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
  const { players } = useActivePlayers()

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
      })

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

  // Update territory layer
  useEffect(() => {
    const map = mapRef.current
    if (!map || typeof map.getSource !== 'function') return

    async function updateLayer() {
      const { cellsToGeoJSON } = await import('@/lib/h3/utils')

      // Detect newly added cells
      const currentIds = new Set(cells.map(c => c.cellId))
      const newCells = cells.filter(c => !prevCellIdsRef.current.has(c.cellId))
      prevCellIdsRef.current = currentIds

      const src = map.getSource('territories')
      if (src) src.setData(cellsToGeoJSON(cells))

      // Animate new cells
      if (newCells.length > 0) {
        const pulseSrc = map.getSource('territories-pulse')
        if (!pulseSrc) return

        const { cellsToGeoJSON: ctg } = await import('@/lib/h3/utils')
        const pulseData = ctg(newCells)

        // Stamp opacity=1 on each feature
        pulseData.features = pulseData.features.map((f: any) => ({
          ...f,
          properties: { ...f.properties, opacity: 1 },
        }))
        pulseSrc.setData(pulseData)

        // Animate opacity 1 → 0 over 1.8s
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

  // Live player markers
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
            width: 34px; height: 34px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${player.avatarColor}bb, ${player.avatarColor});
            border: 2px solid ${player.avatarColor};
            box-shadow: 0 0 14px ${player.avatarColor}88, 0 0 28px ${player.avatarColor}33;
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 800; color: white;
            cursor: pointer;
            font-family: var(--font-display, sans-serif);
          `
          el.textContent = player.avatar

          if (!document.getElementById('player-pulse-style')) {
            const style = document.createElement('style')
            style.id = 'player-pulse-style'
            style.textContent = `
              @keyframes markerPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
              }
            `
            document.head.appendChild(style)
          }
          el.style.animation = 'markerPulse 2.5s ease-in-out infinite'

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

  return <div ref={containerRef} className="w-full h-full" />
}
