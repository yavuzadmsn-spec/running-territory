import { createClient } from '@/lib/supabase/server'
import { CreateClubForm } from '@/components/clubs/CreateClubForm'
import { ClubList } from '@/components/clubs/ClubList'

export default async function ClubsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: clubs }, { data: myMemberships }] = await Promise.all([
    supabase.from('clubs').select('*, club_members(count)').order('created_at', { ascending: false }),
    user
      ? supabase.from('club_members').select('club_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] as { club_id: string }[] })
  ])

  const myClubIds = new Set((myMemberships ?? []).map((m) => m.club_id))

  const clubList = (clubs ?? []).map((club: any) => ({
    id:          club.id,
    name:        club.name,
    color:       club.color,
    memberCount: club.club_members?.[0]?.count ?? 0,
    isMember:    myClubIds.has(club.id),
  }))

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
              BURSA WARZONE
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <h1 className="font-display font-black text-white text-[34px] leading-[1.05] tracking-tight">
              Kulüpler
            </h1>
            {clubList.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] tabular-nums mb-1"
                style={{
                  background: 'linear-gradient(180deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06))',
                  color: '#22C55E',
                  border: '1px solid rgba(34,197,94,0.25)',
                  boxShadow: '0 0 0 1px rgba(34,197,94,0.05) inset, 0 0 18px -6px rgba(34,197,94,0.35)',
                }}
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span
                    className="absolute inset-0 rounded-full opacity-60"
                    style={{ background: '#22C55E', animation: 'statusPulse 2s ease-in-out infinite' }}
                  />
                  <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                </span>
                <span className="font-bold">{clubList.length}</span>
                <span style={{ color: 'rgba(34,197,94,0.7)' }}>aktif</span>
              </div>
            )}
          </div>
          <div className="font-mono text-[12px] mt-2.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Kulübüne katıl, birlikte fethedin
          </div>
        </div>

        {/* Create form */}
        <div className="mb-5">
          <CreateClubForm />
        </div>

        {/* Club list */}
        {clubList.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="text-[10px] font-mono uppercase tracking-[0.28em]"
                style={{ color: 'rgba(255,255,255,0.32)' }}
              >
                Mevcut Kulüpler
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div
                className="font-mono text-[10px] tabular-nums"
                style={{ color: 'rgba(255,255,255,0.32)' }}
              >
                {clubList.length}
              </div>
            </div>
            <ClubList clubs={clubList} />
          </div>
        )}

        {clubList.length === 0 && (
          <div
            className="relative overflow-hidden mt-8 text-center px-6 py-10 rounded-[24px]"
            style={{
              background:
                'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(34,197,94,0.10), transparent 60%), linear-gradient(180deg, #141414, #0E0E0E)',
              border: '1px solid rgba(34,197,94,0.14)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.6)',
            }}
          >
            <div className="relative mx-auto mb-4" style={{ width: 72, height: 72 }}>
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(34,197,94,0.30), transparent 70%)',
                  animation: 'ringPulse 3s ease-in-out infinite',
                }}
              />
              <div
                className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(34,197,94,0.18), rgba(34,197,94,0.04))',
                  border: '1px solid rgba(34,197,94,0.30)',
                  animation: 'float 4s ease-in-out infinite',
                }}
              >
                <span className="text-[34px] leading-none">🏃</span>
              </div>
            </div>
            <div className="font-display font-black text-white text-lg mb-1.5">Henüz kulüp yok</div>
            <div className="font-mono text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Yukarıdan ilk kulübü sen kur
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
