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
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="mb-6">
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase mb-1" style={{ color: '#22C55E' }}>
            BURSA WARZONE
          </div>
          <div className="flex items-end justify-between">
            <h1 className="font-display font-black text-white text-3xl tracking-tight">Kulüpler</h1>
            {clubList.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px]"
                style={{ background: 'rgba(34,197,94,0.10)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.20)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#22C55E', animation: 'statusPulse 2s ease-in-out infinite' }}
                />
                {clubList.length} aktif
              </div>
            )}
          </div>
        </div>

        {/* Create form */}
        <div className="mb-5">
          <CreateClubForm />
        </div>

        {/* Club list */}
        {clubList.length > 0 && (
          <div>
            <div
              className="text-[10px] font-mono uppercase tracking-[0.25em] mb-3 px-1"
              style={{ color: 'rgba(255,255,255,0.30)' }}
            >
              Mevcut Kulüpler · {clubList.length}
            </div>
            <ClubList clubs={clubList} />
          </div>
        )}

        {clubList.length === 0 && (
          <div
            className="mt-8 text-center py-12 rounded-[20px]"
            style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-4xl mb-3">🏃</div>
            <div className="text-white font-display font-bold mb-1">Henüz kulüp yok</div>
            <div className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>İlk kulübü sen kur!</div>
          </div>
        )}
      </div>
    </div>
  )
}
