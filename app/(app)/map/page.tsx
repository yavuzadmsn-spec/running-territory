'use client'
import dynamic from 'next/dynamic'
import { ClubLegend } from '@/components/map/ClubLegend'
import { useTerritory } from '@/hooks/useTerritory'

const TerritoryMap = dynamic(
  () => import('@/components/map/TerritoryMap').then(m => ({ default: m.TerritoryMap })),
  { ssr: false }
)

export default function MapPage() {
  const { cells, loading } = useTerritory()

  return (
    <div className="relative w-full h-[calc(100vh-57px)] bg-gray-950">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <p className="text-gray-400">Harita yükleniyor...</p>
        </div>
      )}
      <TerritoryMap cells={cells} center={[29.06, 40.19]} zoom={13} />
      <ClubLegend cells={cells} />
    </div>
  )
}
