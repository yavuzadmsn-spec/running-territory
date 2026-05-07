import type { CellDisplay } from '@/lib/h3/utils'

interface Props { cells: CellDisplay[] }

export function ClubLegend({ cells }: Props) {
  const clubs = Array.from(new Map(cells.map(c => [c.clubName, c.color])).entries())
  const stats = cells.reduce((acc, c) => {
    acc[c.clubName] = (acc[c.clubName] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (clubs.length === 0) return null

  const sorted = clubs.sort((a, b) => (stats[b[0]] ?? 0) - (stats[a[0]] ?? 0))

  return (
    <div
      className="absolute bottom-6 left-4 z-10 min-w-[160px]"
      style={{
        background: 'rgba(7,16,24,0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div className="px-3 py-2 border-b border-white/[0.05]">
        <span className="text-[8px] font-mono tracking-[0.3em] text-slate-500 uppercase">Bölgeler</span>
      </div>
      <div className="px-3 py-2 space-y-2">
        {sorted.map(([name, color]) => (
          <div key={name} className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="text-white text-xs font-display font-medium flex-1 truncate">{name}</span>
            <span className="font-mono text-[10px] tabular-nums" style={{ color: `${color}cc` }}>
              {stats[name] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
