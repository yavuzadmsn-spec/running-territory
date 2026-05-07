'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { HexLogo, HexGridBg, FloatingInput, GlowButton, ArrowRightIcon } from '@/components/ui/design-system'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/map')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#080808] overflow-hidden">
      <HexGridBg />
      <div className="relative w-full max-w-sm px-8 py-12 z-10">
        <div className="flex flex-col items-center mb-10">
          <HexLogo size={72} />
          <h1 className="mt-5 text-4xl font-bold text-white tracking-tight">Territory</h1>
          <p className="mt-2 text-sm text-slate-400 italic">Koşarken Fethet</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <FloatingInput label="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <FloatingInput label="Şifre" type="password" value={password} onChange={e => setPassword(e.target.value)} />

          <div className="flex justify-end pt-1">
            <a href="#" className="text-xs text-slate-400 hover:text-[#22C55E] transition-colors">
              Şifremi unuttum
            </a>
          </div>

          <div className="pt-3">
            <GlowButton type="submit" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : (
                <span className="flex items-center gap-2">
                  Giriş Yap
                  <ArrowRightIcon width={16} height={16} />
                </span>
              )}
            </GlowButton>
          </div>

          <div className="pt-4 text-center">
            <span className="text-sm text-slate-500">Hesabın yok mu? </span>
            <a href="/register" className="text-sm text-[#22C55E] font-semibold hover:underline">
              Kayıt ol
            </a>
          </div>
        </form>

        <p className="mt-10 text-center text-[10px] text-slate-600 tracking-[0.2em] uppercase">
          Territory · Season 01
        </p>
      </div>
    </div>
  )
}
