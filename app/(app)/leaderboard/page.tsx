interface Ranking {
  id: string; name: string; color: string; cells: number; avgDefense: number
}

async function getRankings(): Promise<Ranking[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/leaderboard`, { cache: 'no-store' })
    const data = await res.json()
    return data.rankings ?? []
  } catch { return [] }
}

const MEDAL = [
  { color: '#F59E0B', label: 'ALTIN',  glow: 'rgba(245,158,11,0.35)' },
  { color: '#94A3B8', label: 'GÜMÜŞ', glow: 'rgba(148,163,184,0.25)' },
  { color: '#C97C3A', label: 'BRONZ', glow: 'rgba(201,124,58,0.25)' },
] as const

export default async function LeaderboardPage() {
  const rankings = await getRankings()
  const maxCells = Math.max(...rankings.map(r => r.cells), 1)
  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="mb-8">
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase mb-1" style={{ color: '#22C55E' }}>
            SEASON 01 · BURSA WARZONE
          </div>
          <h1 className="font-display font-black text-white text-3xl tracking-tight">Sıralama</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#22C55E', animation: 'statusPulse 2s ease-in-out infinite' }}
            />
            <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              CANLI · Her saat güncellenir
            </span>
          </div>
        </div>

        {rankings.length === 0 && (
          <div
            className="py-16 text-center rounded-[20px]"
            style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-white font-display font-bold mb-1">Henüz sıralama yok</div>
            <div className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>İlk koşuyu başlat</div>
          </div>
        )}

        {/* Top 3 podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {[top3[1], top3[0], top3[2]].map((club, colIdx) => {
              if (!club) return <div key={colIdx} />
              const place = rankings.indexOf(club)
              return (
                <PodiumCard
                  key={club.id}
                  club={club}
                  place={place + 1}
                  medal={MEDAL[place]}
                  elevated={place === 0}
                />
              )
            })}
          </div>
        )}

        {/* Divider */}
        {rest.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Diğer Kulüpler
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
        )}

        {/* Rest list */}
        <div className="space-y-2">
          {rest.map((club, i) => (
            <TacticalRow key={club.id} club={club} rank={i + 4} max={maxCells} />
          ))}
        </div>

      </div>
    </div>
  )
}

function PodiumCard({ club, place, medal, elevated }: {
  club: Ranking; place: number
  medal: { color: string; label: string; glow: string }
  elevated: boolean
}) {
  return (
    <div className={`flex flex-col ${elevated ? '-mt-4' : 'mt-4'}`}>
      {/* Medal badge */}
      <div
        className="self-center mb-2 px-2 py-0.5 font-mono font-black text-[8px] tracking-[0.2em] rounded-sm"
        style={{ background: medal.color + '18', color: medal.color, border: `1px solid ${medal.color}30` }}
      >
        {medal.label}
      </div>

      {/* Card */}
      <div
        className="flex flex-col items-center text-center p-4 rounded-[18px] relative overflow-hidden"
        style={{
          background: '#121212',
          border: `1px solid ${elevated ? medal.color + '40' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: elevated ? `0 0 32px ${medal.glow}` : 'none',
        }}
      >
        {/* Top color bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: medal.color }}
        />

        {/* Club avatar */}
        <div
          className="w-10 h-10 rounded-full mb-3 mt-1 flex-shrink-0"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${club.color}cc, ${club.color})`,
            boxShadow: `0 4px 16px ${club.color}50`,
          }}
        />

        <div className="font-display font-bold text-white text-xs leading-tight line-clamp-2 mb-2">
          {club.name}
        </div>

        <div className="font-mono font-black tabular-nums leading-none"
          style={{ fontSize: elevated ? '1.8rem' : '1.3rem', color: elevated ? medal.color : 'rgba(255,255,255,0.85)' }}
        >
          {club.cells.toLocaleString()}
        </div>
        <div className="font-mono text-[9px] mt-0.5 tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          HÜCRE
        </div>

        <div className="mt-2 font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          DEF {club.avgDefense.toFixed(1)}
        </div>
      </div>
    </div>
  )
}

function TacticalRow({ club, rank, max }: { club: Ranking; rank: number; max: number }) {
  const pct = (club.cells / max) * 100
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] transition-colors"
      style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Rank */}
      <div className="w-7 text-center flex-shrink-0">
        <span className="font-mono font-black text-sm tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {String(rank).padStart(2, '0')}
        </span>
      </div>

      {/* Color dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: club.color, boxShadow: `0 0 6px ${club.color}80` }}
      />

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-display font-semibold text-sm text-white truncate">{club.name}</span>
          <span className="font-mono font-bold text-xs tabular-nums ml-2 flex-shrink-0" style={{ color: club.color }}>
            {club.cells.toLocaleString()}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${club.color}55, ${club.color})` }}
          />
        </div>
      </div>

      {/* DEF */}
      <div className="text-right flex-shrink-0 w-10">
        <div className="font-mono text-[8px] tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>DEF</div>
        <div className="font-mono font-bold text-sm text-white">{club.avgDefense.toFixed(1)}</div>
      </div>
    </div>
  )
}
