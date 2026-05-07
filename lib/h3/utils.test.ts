import { describe, it, expect } from 'vitest'
import { routeToHexCells, cellsToGeoJSON } from './utils'

describe('routeToHexCells', () => {
  it('tek nokta için 1 hücre döndürür', () => {
    const cells = routeToHexCells([{ lat: 40.19, lng: 29.06 }])
    expect(cells).toHaveLength(1)
    expect(cells[0]).toMatch(/^[0-9a-f]+$/)
  })

  it('iki yakın nokta arası hücreleri doldurur', () => {
    const cells = routeToHexCells([
      { lat: 40.19000, lng: 29.06000 },
      { lat: 40.19100, lng: 29.06100 }
    ])
    expect(cells.length).toBeGreaterThanOrEqual(1)
    expect(new Set(cells).size).toBe(cells.length)
  })
})

describe('cellsToGeoJSON', () => {
  it('geçerli GeoJSON FeatureCollection döndürür', () => {
    const cells = routeToHexCells([{ lat: 40.19, lng: 29.06 }])
    const geojson = cellsToGeoJSON(cells.map(c => ({ cellId: c, color: '#ff0000', clubName: 'Test', defenseScore: 1 })))
    expect(geojson.type).toBe('FeatureCollection')
    expect(geojson.features).toHaveLength(1)
    expect(geojson.features[0].geometry.type).toBe('Polygon')
  })
})
