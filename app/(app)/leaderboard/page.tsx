interface Ranking {
  id: string
  name: string
  color: string
  cells: number
  avgDefense: number
}

async function getRankings(): Promise<Ranking[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/leaderboard`, { cache: 'no-store' })
    const data = await res.json()
    return data.rankings ?? []
  } catch {
    return []
  }
}

export default async function LeaderboardPage() {
  const rankings = await getRankings()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Liderlik Tablosu</h1>
      {rankings.length === 0 && (
        <p className="text-gray-400">Henüz fethedilen bölge yok. Koşmaya başla!</p>
      )}
      {rankings.map((club, i) => (
        <div key={club.id} className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl">
          <span className="text-2xl font-black text-gray-500 w-8">#{i + 1}</span>
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: club.color }} />
          <div className="flex-1">
            <p className="text-white font-semibold">{club.name}</p>
            <p className="text-gray-400 text-sm">Ort. savunma: {club.avgDefense}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">{club.cells}</p>
            <p className="text-gray-400 text-xs">hücre</p>
          </div>
        </div>
      ))}
    </div>
  )
}
