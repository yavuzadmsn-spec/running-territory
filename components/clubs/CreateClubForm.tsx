'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COLORS = ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#14B8A6']

export function CreateClubForm() {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/clubs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.refresh()
    setName('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl space-y-4">
      <h2 className="text-lg font-bold text-white">Yeni Kulüp Kur</h2>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <input
        type="text" placeholder="Kulüp adı" value={name}
        onChange={e => setName(e.target.value)}
        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        required
      />
      <div className="flex gap-2 flex-wrap">
        {COLORS.map(c => (
          <button key={c} type="button" onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <button type="submit" disabled={loading}
        className="w-full p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold">
        {loading ? 'Oluşturuluyor...' : 'Kulüp Kur'}
      </button>
    </form>
  )
}
