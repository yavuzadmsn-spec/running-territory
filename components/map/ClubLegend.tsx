import type { CellDisplay } from '@/lib/h3/utils'

interface Props { cells: CellDisplay[] }

export function ClubLegend({ cells }: Props) {
  const clubs = Array.from(
    new Map(cells.map(c => [c.clubName, c.color])).entries()
  )
  const stats = cells.reduce((acc, c) => {
    acc[c.clubName] = (acc[c.clubName] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (clubs.length === 0) return null

  return (
    <div className="absolute bottom-6 left-4 bg-gray-900/90 backdrop-blur rounded-xl p-4 space-y-2 z-10">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Kulüpler</p>
      {clubs.map(([name, color]) => (
        <div key={name} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-white text-sm">{name}</span>
          <span className="text-gray-400 text-xs ml-auto">{stats[name] ?? 0} hücre</span>
        </div>
      ))}
    </div>
  )
}
