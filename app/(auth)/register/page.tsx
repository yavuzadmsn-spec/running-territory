'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { HexLogo, HexGridBg, FloatingInput, GlowButton } from '@/components/ui/design-system'

const STRENGTH_LABELS = ['Çok zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok güçlü']
const STRENGTH_COLORS = ['#EF4444', '#F59E0B', '#EAB308', '#84CC16', '#22C55E']

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const strength = useMemo(() => {
    let s = 0
    if (password.length >= 6) s++
    if (password.length >= 10) s++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++
    if (/\d/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return Math.min(s, 4)
  }, [password])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/map')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#080808] overflow-hidden">
      <HexGridBg />
      <div className="relative w-full max-w-sm px-8 py-10 z-10">
        <div className="flex flex-col items-center mb-8">
          <HexLogo size={56} />
          <h1 className="mt-4 text-3xl font-bold text-white tracking-tight">Aramıza Katıl</h1>
          <p className="mt-1.5 text-sm text-slate-400">Kendi bölgeni fethet</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <FloatingInput label="Ad Soyad" value={name} onChange={e => setName(e.target.value)} />
          <FloatingInput label="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <FloatingInput label="Şifre (min 6)" type="password" value={password} onChange={e => setPassword(e.target.value)} />

          {password.length > 0 && (
            <div className="pt-1">
              <div className="flex gap-1.5 mb-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: i < strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.08)',
                      boxShadow: i < strength ? `0 0 8px ${STRENGTH_COLORS[strength]}80` : 'none',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Şifre gücü</span>
                <span className="font-semibold" style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            </div>
          )}

          <div className="pt-4">
            <GlowButton type="submit" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
            </GlowButton>
          </div>

          <div className="pt-4 text-center">
            <span className="text-sm text-slate-500">Zaten üye misin? </span>
            <a href="/login" className="text-sm text-[#22C55E] font-semibold hover:underline">
              Giriş yap
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
