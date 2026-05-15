'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Tab = 'clubs' | 'individuals'
type Gender = 'male' | 'female' | 'all'
type Scope  = 'city'  | 'country'

interface ClubRow {
  id: string; name: string; color: string; cells: number; avgDefense: number
  city: string | null
}
interface UserRow {
  id: string; name: string; color: string; cells: number
  avatarUrl: string | null
  gender: 'male' | 'female' | null
  city: string | null
}

const MEDAL = [
  { color: '#F59E0B', label: 'ALTIN',  glow: 'rgba(245,158,11,0.45)' },
  { color: '#94A3B8', label: 'GÜMÜŞ', glow: 'rgba(148,163,184,0.30)' },
  { color: '#C97C3A', label: 'BRONZ', glow: 'rgba(201,124,58,0.30)' },
] as const

export function LeaderboardClient() {
  const [tab, setTab] = useState<Tab>('clubs')
  const [gender, setGender] = useState<Gender>('all')
  const [scope,  setScope]  = useState<Scope>('city')
  const [viewerCity, setViewerCity] = useState<string>('Bursa')
  const [clubs, setClubs] = useState<ClubRow[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = tab === 'clubs'
      ? `type=clubs&scope=${scope}`
      : `type=individuals&gender=${gender}`
    fetch(`/api/leaderboard?${params}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.meta?.viewerCity) setViewerCity(d.meta.viewerCity)
        if (tab === 'clubs') setClubs(d.rankings ?? [])
        else                  setUsers(d.rankings ?? [])
      })
      .finally(() => setLoading(false))
  }, [tab, gender, scope])

  return (
    <>
      {/* Tab segment control */}
      <div
        className="relative grid grid-cols-2 p-1 rounded-2xl mb-3"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset',
        }}
      >
        {/* Active pill background */}
        <div
          className="absolute top-1 bottom-1 rounded-xl transition-all duration-300"
          style={{
            left:  tab === 'clubs' ? 4 : '50%',
            right: tab === 'clubs' ? '50%' : 4,
            background: 'linear-gradient(180deg, rgba(34,197,94,0.20), rgba(34,197,94,0.08))',
            border: '1px solid rgba(34,197,94,0.30)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 0 20px -6px rgba(34,197,94,0.55)',
          }}
        />
        {(['clubs', 'individuals'] as const).map(t => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative z-10 py-2.5 font-display font-black text-[12px] tracking-[0.1em] uppercase tap transition-colors"
              style={{ color: active ? '#22C55E' : 'rgba(255,255,255,0.45)' }}
            >
              {t === 'clubs' ? 'Kulüpler' : 'Bireysel'}
            </button>
          )
        })}
      </div>

      {/* Sub-filter row */}
      {tab === 'clubs' ? (
        <div className="flex gap-2 mb-6">
          {([
            { v: 'city',    l: viewerCity,   e: '📍' },
            { v: 'country', l: 'Türkiye',    e: '🇹🇷' },
          ] as const).map(s => {
            const active = scope === s.v
            return (
              <button
                key={s.v}
                onClick={() => setScope(s.v)}
                className="flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-[12px] tap transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: active
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'}`,
                  color: active ? '#fff' : 'rgba(255,255,255,0.42)',
                  boxShadow: active ? '0 1px 0 rgba(255,255,255,0.04) inset' : 'none',
                }}
              >
                <span className="text-[13px]">{s.e}</span>
                {s.l}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex gap-2 mb-6">
          {([
            { v: 'all',    l: 'Genel',  e: '🏆' },
            { v: 'male',   l: 'Erkek',  e: '♂' },
            { v: 'female', l: 'Kadın', e: '♀' },
          ] as const).map(g => {
            const active = gender === g.v
            return (
              <button
                key={g.v}
                onClick={() => setGender(g.v)}
                className="flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-[12px] tap transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: active
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'}`,
                  color: active ? '#fff' : 'rgba(255,255,255,0.42)',
                  boxShadow: active ? '0 1px 0 rgba(255,255,255,0.04) inset' : 'none',
                }}
              >
                <span className="text-[14px]">{g.e}</span>
                {g.l}
              </button>
            )
          })}
        </div>
      )}

      {/* Body */}
      {loading && <SkeletonList />}

      {!loading && tab === 'clubs' && (
        clubs.length === 0
          ? <EmptyState
              title="Henüz kulüp sıralaması yok"
              sub={scope === 'city' ? `${viewerCity}'da ilk kulübü sen kur` : "Türkiye genelinde ilk kulüp ol"}
            />
          : <ClubLeaderboard rankings={clubs} showCity={scope === 'country'} />
      )}

      {!loading && tab === 'individuals' && (
        users.length === 0
          ? <EmptyState
              title="Henüz bireysel sıralama yok"
              sub={
                gender === 'all'    ? 'İlk koşuyu başlat, listeye gir'
                : gender === 'male' ? 'Erkek koşucu listesinde ilk yer açık'
                                    : 'Kadın koşucu listesinde ilk yer açık'
              }
            />
          : <IndividualLeaderboard rankings={users} />
      )}
    </>
  )
}

/* ─── Sub-components ──────────────────────────────────────── */

function ClubLeaderboard({ rankings, showCity }: { rankings: ClubRow[]; showCity: boolean }) {
  const maxCells = Math.max(...rankings.map(r => r.cells), 1)
  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)
  return (
    <>
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mb-7">
          {[top3[1], top3[0], top3[2]].map((club, idx) => {
            if (!club) return <div key={idx} />
            const place = rankings.indexOf(club)
            return (
              <PodiumCard
                key={club.id}
                color={club.color}
                name={club.name}
                stat={club.cells.toLocaleString()}
                statLabel="HÜCRE"
                meta={showCity && club.city ? club.city : `DEF · ${club.avgDefense.toFixed(1)}`}
                place={place + 1}
                medal={MEDAL[place]}
                elevated={place === 0}
              />
            )
          })}
        </div>
      )}
      {rest.length > 0 && <SectionDivider label="Diğer Kulüpler" />}
      <div className="space-y-2">
        {rest.map((club, i) => (
          <TacticalRow
            key={club.id}
            color={club.color}
            name={club.name}
            subtext={showCity ? club.city ?? null : null}
            cells={club.cells}
            max={maxCells}
            rank={i + 4}
            meta={club.avgDefense.toFixed(1)}
            metaLabel="DEF"
          />
        ))}
      </div>
    </>
  )
}

function IndividualLeaderboard({ rankings }: { rankings: UserRow[] }) {
  const maxCells = Math.max(...rankings.map(r => r.cells), 1)
  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)
  return (
    <>
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mb-7">
          {[top3[1], top3[0], top3[2]].map((u, idx) => {
            if (!u) return <div key={idx} />
            const place = rankings.indexOf(u)
            return (
              <PodiumCard
                key={u.id}
                color={u.color}
                name={u.name}
                stat={u.cells.toLocaleString()}
                statLabel="HÜCRE"
                meta={u.gender === 'male' ? '♂' : u.gender === 'female' ? '♀' : null}
                place={place + 1}
                medal={MEDAL[place]}
                elevated={place === 0}
                avatarUrl={u.avatarUrl}
              />
            )
          })}
        </div>
      )}
      {rest.length > 0 && <SectionDivider label="Diğer Koşucular" />}
      <div className="space-y-2">
        {rest.map((u, i) => (
          <TacticalRow
            key={u.id}
            color={u.color}
            name={u.name}
            subtext={u.city ?? null}
            cells={u.cells}
            max={maxCells}
            rank={i + 4}
            avatarUrl={u.avatarUrl}
            meta={u.gender === 'male' ? '♂' : u.gender === 'female' ? '♀' : ''}
            metaLabel=""
          />
        ))}
      </div>
    </>
  )
}

function PodiumCard({
  color, name, stat, statLabel, meta, place, medal, elevated, avatarUrl,
}: {
  color: string; name: string; stat: string; statLabel: string
  meta?: string | null; place: number
  medal: { color: string; label: string; glow: string }
  elevated: boolean; avatarUrl?: string | null
}) {
  return (
    <div className={`flex flex-col ${elevated ? '-mt-5' : 'mt-4'}`}>
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
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, transparent, ${medal.color}, transparent)` }}
        />
        <div
          className="absolute top-2.5 right-2.5 font-mono font-black text-[10px] tabular-nums"
          style={{ color: medal.color + 'aa' }}
        >
          #{place}
        </div>

        <div className="relative mt-1 mb-3">
          <div className="absolute inset-0 rounded-full blur-md opacity-50" style={{ background: color }} />
          {avatarUrl ? (
            <div
              className="relative w-11 h-11 rounded-full overflow-hidden"
              style={{ boxShadow: `0 0 0 2px rgba(255,255,255,0.05), 0 6px 20px ${color}50` }}
            >
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="relative w-11 h-11 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${color}ee, ${color})`,
                boxShadow: `0 0 0 2px rgba(255,255,255,0.05), 0 6px 20px ${color}50`,
              }}
            />
          )}
        </div>

        <div className="font-display font-bold text-white text-xs leading-tight line-clamp-2 mb-2.5 px-1">
          {name}
        </div>

        <div
          className="font-mono font-black tabular-nums leading-none"
          style={{
            fontSize: elevated ? '1.9rem' : '1.4rem',
            color: elevated ? medal.color : '#FFFFFF',
            textShadow: elevated ? `0 0 24px ${medal.color}50` : 'none',
          }}
        >
          {stat}
        </div>
        <div className="font-mono text-[8px] mt-1 tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {statLabel}
        </div>

        {meta && (
          <div
            className="mt-3 px-2 py-0.5 rounded-md font-mono text-[9px] tabular-nums"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)' }}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  )
}

function TacticalRow({
  color, name, subtext, cells, max, rank, meta, metaLabel, avatarUrl,
}: {
  color: string; name: string; subtext?: string | null
  cells: number; max: number; rank: number
  meta?: string; metaLabel?: string; avatarUrl?: string | null
}) {
  const pct = (cells / max) * 100
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] tap"
      style={{
        background: 'linear-gradient(180deg, #141414, #0F0F0F)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset',
      }}
    >
      <div className="w-7 text-center flex-shrink-0">
        <span className="font-mono font-black text-sm tabular-nums" style={{ color: 'rgba(255,255,255,0.30)' }}>
          {String(rank).padStart(2, '0')}
        </span>
      </div>

      {avatarUrl ? (
        <div
          className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
          style={{ boxShadow: `0 0 0 1.5px ${color}, 0 0 10px ${color}50` }}
        >
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5 gap-2">
          <div className="min-w-0 flex items-baseline gap-2">
            <span className="font-display font-semibold text-[13px] text-white truncate">{name}</span>
            {subtext && (
              <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                · {subtext}
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-xs tabular-nums flex-shrink-0" style={{ color }}>
            {cells.toLocaleString()}
          </span>
        </div>
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}40, ${color})`,
              boxShadow: `0 0 8px ${color}80`,
            }}
          />
        </div>
      </div>

      {meta && (
        <div className="text-right flex-shrink-0 w-10">
          {metaLabel && (
            <div className="font-mono text-[8px] tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>{metaLabel}</div>
          )}
          <div className="font-mono font-bold text-sm text-white tabular-nums">{meta}</div>
        </div>
      )}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.30)' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
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

      <div className="font-display font-black text-white text-lg leading-tight mb-1.5">{title}</div>
      <div className="font-mono text-[13px] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>{sub}</div>

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
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="grid grid-cols-3 gap-2.5 mb-7">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={i === 1 ? '-mt-5' : 'mt-4'}
            style={{
              height: 170,
              background: 'linear-gradient(180deg, #141414, #0F0F0F)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}
          />
        ))}
      </div>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            height: 56,
            background: 'linear-gradient(180deg, #141414, #0F0F0F)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
          }}
        />
      ))}
    </div>
  )
}
