import Link from 'next/link'

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
  { color: '#F59E0B', label: 'ALTIN',  glow: 'rgba(245,158,11,0.45)' },
  { color: '#94A3B8', label: 'GÜMÜŞ', glow: 'rgba(148,163,184,0.30)' },
  { color: '#C97C3A', label: 'BRONZ', glow: 'rgba(201,124,58,0.30)' },
] as const

export default async function LeaderboardPage() {
  const rankings = await getRankings()
  const maxCells = Math.max(...rankings.map(r => r.cells), 1)
  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div className="max-w-lg mx-auto px-5 pt-7 pb-28 md:pb-8">

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block w-1 h-1 rounded-full"
              style={{ background: '#22C55E', boxShadow: '0 0 8px #22C55E' }}
            />
            <div className="text-[10px] font-mono tracking-[0.35em] uppercase" style={{ color: '#22C55E' }}>
              SEASON 01 · BURSA WARZONE
            </div>
          </div>
          <h1 className="font-display font-black text-white text-[34px] leading-[1.05] tracking-tight">
            Sıralama
          </h1>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="relative flex w-2 h-2">
              <span
                className="absolute inset-0 rounded-full opacity-60"
                style={{ background: '#22C55E', animation: 'statusPulse 2s ease-in-out infinite' }}
              />
              <span className="relative w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              CANLI · Her saat güncellenir
            </span>
          </div>
        </div>

        {/* Empty state */}
        {rankings.length === 0 && <EmptyLeaderboard />}

        {/* Top 3 podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-7">
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
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.30)' }}>
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

function EmptyLeaderboard() {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-6 py-10 text-center"
      style={{
        background:
          'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(34,197,94,0.10), transparent 60%), linear-gradient(180deg, #141414, #0E0E0E)',
        border: '1px solid rgba(34,197,94,0.14)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.6)',
      }}
    >
      {/* Floating trophy with ring pulse */}
      <div className="relative mx-auto mb-5" style={{ width: 84, height: 84 }}>
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.35), transparent 70%)',
            animation: 'ringPulse 3s ease-in-out infinite',
          }}
        />
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, rgba(34,197,94,0.18), rgba(34,197,94,0.04))',
            border: '1px solid rgba(34,197,94,0.30)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 16px 40px -16px rgba(34,197,94,0.4)',
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          <span className="text-[40px] leading-none">🏆</span>
        </div>
      </div>

      <div className="font-display font-black text-white text-lg leading-tight mb-1.5">
        Henüz sıralama yok
      </div>
      <div className="font-mono text-[13px] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Bursa'yı ilk fetheden sen ol
      </div>

      <Link
        href="/map"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-display font-bold text-[13px] tap"
        style={{
          background: 'linear-gradient(180deg, #25D366, #16A34A)',
          color: '#04140A',
          boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 10px 32px -8px rgba(34,197,94,0.55)',
        }}
      >
        İlk Koşuyu Başlat
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </Link>

      <div className="mt-7 grid grid-cols-3 gap-2 text-left">
        {[
          { n: '01', t: 'Konum',  d: 'Açık tut' },
          { n: '02', t: 'Koş',    d: 'Bölge fethet' },
          { n: '03', t: 'Tırman', d: 'Sıralamada' },
        ].map((s) => (
          <div
            key={s.n}
            className="px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="font-mono text-[9px] mb-1" style={{ color: 'rgba(34,197,94,0.7)' }}>{s.n}</div>
            <div className="font-display font-bold text-white text-[11px] leading-tight">{s.t}</div>
            <div className="font-mono text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.d}</div>
          </div>
        ))}
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
    <div className={`flex flex-col ${elevated ? '-mt-5' : 'mt-4'}`}>
      {/* Medal badge */}
      <div
        className="self-center mb-2 px-2 py-0.5 font-mono font-black text-[8px] tracking-[0.25em] rounded-md"
        style={{
          background: `linear-gradient(180deg, ${medal.color}25, ${medal.color}10)`,
          color: medal.color,
          border: `1px solid ${medal.color}40`,
          boxShadow: elevated ? `0 0 16px ${medal.glow}` : 'none',
        }}
      >
        {medal.label}
      </div>

      {/* Card */}
      <div
        className="relative flex flex-col items-center text-center p-4 rounded-[20px] overflow-hidden"
        style={{
          background: elevated
            ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${medal.color}18, transparent 70%), linear-gradient(180deg, #161616, #0F0F0F)`
            : 'linear-gradient(180deg, #141414, #0F0F0F)',
          border: `1px solid ${elevated ? medal.color + '40' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: elevated
            ? `0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px ${medal.color}15, 0 24px 60px -20px ${medal.glow}`
            : '0 1px 0 rgba(255,255,255,0.04) inset',
        }}
      >
        {/* Top color bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, transparent, ${medal.color}, transparent)` }}
        />

        {/* Place badge */}
        <div
          className="absolute top-2.5 right-2.5 font-mono font-black text-[10px] tabular-nums"
          style={{ color: medal.color + 'aa' }}
        >
          #{place}
        </div>

        {/* Club avatar */}
        <div className="relative mt-1 mb-3">
          <div
            className="absolute inset-0 rounded-full blur-md opacity-50"
            style={{ background: club.color }}
          />
          <div
            className="relative w-11 h-11 rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${club.color}ee, ${club.color})`,
              boxShadow: `0 0 0 2px rgba(255,255,255,0.05), 0 6px 20px ${club.color}50`,
            }}
          />
        </div>

        <div className="font-display font-bold text-white text-xs leading-tight line-clamp-2 mb-2.5 px-1">
          {club.name}
        </div>

        <div
          className="font-mono font-black tabular-nums leading-none"
          style={{
            fontSize: elevated ? '1.9rem' : '1.4rem',
            color: elevated ? medal.color : '#FFFFFF',
            textShadow: elevated ? `0 0 24px ${medal.color}50` : 'none',
          }}
        >
          {club.cells.toLocaleString()}
        </div>
        <div className="font-mono text-[8px] mt-1 tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          HÜCRE
        </div>

        {/* DEF chip */}
        <div
          className="mt-3 px-2 py-0.5 rounded-md font-mono text-[9px] tabular-nums"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)' }}
        >
          DEF · {club.avgDefense.toFixed(1)}
        </div>
      </div>
    </div>
  )
}

function TacticalRow({ club, rank, max }: { club: Ranking; rank: number; max: number }) {
  const pct = (club.cells / max) * 100
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] tap"
      style={{
        background: 'linear-gradient(180deg, #141414, #0F0F0F)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset',
      }}
    >
      {/* Rank */}
      <div className="w-7 text-center flex-shrink-0">
        <span className="font-mono font-black text-sm tabular-nums" style={{ color: 'rgba(255,255,255,0.30)' }}>
          {String(rank).padStart(2, '0')}
        </span>
      </div>

      {/* Color dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: club.color, boxShadow: `0 0 8px ${club.color}80` }}
      />

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-display font-semibold text-[13px] text-white truncate">{club.name}</span>
          <span className="font-mono font-bold text-xs tabular-nums ml-2 flex-shrink-0" style={{ color: club.color }}>
            {club.cells.toLocaleString()}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${club.color}40, ${club.color})`,
              boxShadow: `0 0 8px ${club.color}80`,
            }}
          />
        </div>
      </div>

      {/* DEF */}
      <div className="text-right flex-shrink-0 w-10">
        <div className="font-mono text-[8px] tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>DEF</div>
        <div className="font-mono font-bold text-sm text-white tabular-nums">{club.avgDefense.toFixed(1)}</div>
      </div>
    </div>
  )
}
