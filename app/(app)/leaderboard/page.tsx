import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient'

export const dynamic = 'force-dynamic'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div className="max-w-lg mx-auto px-5 pt-7 pb-28 md:pb-8">

        {/* Header */}
        <div className="mb-5">
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

        <LeaderboardClient />
      </div>
    </div>
  )
}
