'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    router.push('/map')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
          required
        />
        <button type="submit"
          className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold">
          Giriş
        </button>
        <p className="text-gray-400 text-sm text-center">
          Hesabın yok mu? <a href="/register" className="text-blue-400">Kayıt ol</a>
        </p>
      </form>
    </div>
  )
}
