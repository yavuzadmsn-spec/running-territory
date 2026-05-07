import { CreateClubForm } from '@/components/clubs/CreateClubForm'
import { createClient } from '@/lib/supabase/server'

export default async function ClubsPage() {
  const supabase = await createClient()
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*, club_members(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <CreateClubForm />
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Tüm Kulüpler</h2>
        {(clubs ?? []).length === 0 && (
          <p className="text-gray-400">Henüz kulüp yok. İlk kulübü sen kur!</p>
        )}
        {(clubs ?? []).map((club: any) => (
          <div key={club.id} className="flex items-center gap-3 bg-gray-900 p-4 rounded-xl">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: club.color }} />
            <span className="text-white font-medium">{club.name}</span>
            <span className="text-gray-400 text-sm ml-auto">
              {club.club_members?.[0]?.count ?? 0} üye
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
