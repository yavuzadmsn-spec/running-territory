import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex gap-6 p-4 border-b border-gray-800 bg-gray-900">
        <Link href="/map" className="font-semibold hover:text-blue-400 transition-colors">Harita</Link>
        <Link href="/clubs" className="font-semibold hover:text-blue-400 transition-colors">Kulüpler</Link>
        <Link href="/leaderboard" className="font-semibold hover:text-blue-400 transition-colors">Sıralama</Link>
      </nav>
      <main>{children}</main>
    </div>
  )
}
