'use client'
import { useEffect, useRef } from 'react'
import type { CellDisplay } from '@/lib/h3/utils'

interface Props {
  cells: CellDisplay[]
  center?: [number, number]
  zoom?: number
}

export function TerritoryMap({ cells, center = [29.06, 40.19], zoom = 13 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: any

    async function initMap() {
      const mapboxgl = (await import('mapbox-gl')).default
      await import('mapbox-gl/dist/mapbox-gl.css')

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center,
        zoom
      })

      map.on('load', () => {
        map.addSource('territories', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: 'territories-fill',
          type: 'fill',
          source: 'territories',
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.45 }
        })
        map.addLayer({
          id: 'territories-border',
          type: 'line',
          source: 'territories',
          paint: { 'line-color': ['get', 'color'], 'line-width': 0.8, 'line-opacity': 0.7 }
        })

        const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })

        map.on('mouseenter', 'territories-fill', (e: any) => {
          map.getCanvas().style.cursor = 'pointer'
          const props = e.features?.[0]?.properties
          if (!props) return
          const shields = '🛡'.repeat(props.defenseScore)
          popup.setLngLat(e.lngLat)
            .setHTML(`<div style="font-size:13px"><strong>${props.clubName}</strong><br/>${shields}</div>`)
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

  useEffect(() => {
    const map = mapRef.current
    if (!map || typeof map.getSource !== 'function') return

    async function updateLayer() {
      const { cellsToGeoJSON } = await import('@/lib/h3/utils')
      const source = map.getSource('territories')
      if (source) source.setData(cellsToGeoJSON(cells))
    }

    if (map._loaded) {
      updateLayer()
    } else {
      map.once?.('load', updateLayer)
    }
  }, [cells])

  return <div ref={containerRef} className="w-full h-full" />
}
