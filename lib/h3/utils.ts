import * as h3 from 'h3-js'

export const H3_RESOLUTION = 9

export interface LatLng { lat: number; lng: number }

export function routeToHexCells(coordinates: LatLng[]): string[] {
  const cells = new Set<string>()

  coordinates.forEach(({ lat, lng }) => {
    cells.add(h3.latLngToCell(lat, lng, H3_RESOLUTION))
  })

  for (let i = 0; i < coordinates.length - 1; i++) {
    const from = h3.latLngToCell(coordinates[i].lat, coordinates[i].lng, H3_RESOLUTION)
    const to = h3.latLngToCell(coordinates[i + 1].lat, coordinates[i + 1].lng, H3_RESOLUTION)
    if (from !== to) {
      h3.gridPathCells(from, to).forEach(c => cells.add(c))
    }
  }

  return Array.from(cells)
}

export interface CellDisplay {
  cellId: string
  color: string
  clubName: string
  defenseScore: number
}

export function cellsToGeoJSON(cells: CellDisplay[]) {
  return {
    type: 'FeatureCollection' as const,
    features: cells.map(({ cellId, color, clubName, defenseScore }) => {
      const boundary = h3.cellToBoundary(cellId)
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            ...boundary.map(([lat, lng]) => [lng, lat]),
            [boundary[0][1], boundary[0][0]]
          ]]
        },
        properties: { cellId, color, clubName, defenseScore }
      }
    })
  }
}
