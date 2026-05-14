'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const AVATAR_COLORS = [
  '#22C55E', '#3B82F6', '#EF4444', '#A855F7',
  '#F59E0B', '#EC4899', '#06B6D4', '#F97316',
]

interface Stats { runs: number; clubs: number; cells: number }

export default function ProfilePage() {
  const [email,     setEmail]     = useState('')
  const [fullName,  setFullName]  = useState('')
  const [username,  setUsername]  = useState('')
  const [bio,       setBio]       = useState('')
  const [color,     setColor]     = useState('#22C55E')
  const [gender,    setGender]    = useState<'male' | 'female' | ''>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [stats,     setStats]     = useState<Stats>({ runs: 0, clubs: 0, cells: 0 })
  const [saving,    setSaving]    = useState(false)
  const [saveMsg,   setSaveMsg]   = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg,     setPwMsg]     = useState('')
  const [pwSaving,  setPwSaving]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef   = useRef<HTMLInputElement>(null)
  const userIdRef = useRef('')

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile) {
        userIdRef.current = d.profile.id
        setUsername(d.profile.username ?? '')
        setBio(d.profile.bio ?? '')
        setColor(d.profile.avatar_color ?? '#22C55E')
        setAvatarUrl(d.profile.avatar_url ?? null)
        setGender((d.profile.gender as 'male'|'female') ?? '')
      }
      if (d.user)  { setEmail(d.user.email ?? ''); setFullName(d.user.full_name ?? '') }
      if (d.stats) setStats(d.stats)
    })
  }, [])

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userIdRef.current) return
    setUploading(true)
    const supabase = createClient()
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${userIdRef.current}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${publicUrl}?t=${Date.now()}`
      setAvatarUrl(url)
      await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_url: url }) })
    }
    setUploading(false)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaveMsg('')
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, bio, avatar_color: color, full_name: fullName, gender: gender || null }) })
    setSaving(false); setSaveMsg(res.ok ? 'ok' : 'err')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function savePw(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwMsg('Şifreler eşleşmiyor'); return }
    if (newPw.length < 6)   { setPwMsg('En az 6 karakter'); return }
    setPwSaving(true); setPwMsg('')
    const res  = await fetch('/api/profile/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newPw }) })
    const data = await res.json()
    setPwSaving(false)
    setPwMsg(res.ok ? 'ok' : (data.error ?? 'Hata'))
    if (res.ok) { setNewPw(''); setConfirmPw('') }
    setTimeout(() => setPwMsg(''), 4000)
  }

  const initials    = fullName.trim()
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email[0]?.toUpperCase() ?? 'U'
  const displayName = fullName || email.split('@')[0]

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: '#0B0B0B', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Ambient glow layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 120% at 20% 30%, ${color}1F, transparent 60%), radial-gradient(ellipse 50% 80% at 80% 90%, ${color}10, transparent 70%)`,
          }}
        />
        {/* Top noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        />

        <div className="relative max-w-lg mx-auto px-5 pt-9 pb-6 flex items-center gap-5">

          {/* Avatar — click to upload */}
          <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
            {/* Outer glow */}
            <div
              className="absolute -inset-1 rounded-full blur-md opacity-50"
              style={{ background: color }}
            />
            {/* Ring */}
            <div
              className="absolute -inset-[2px] rounded-full"
              style={{ background: `conic-gradient(${color}, ${color}44, ${color})` }}
            />
            {/* Photo */}
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white font-mono font-black text-2xl"
              style={{ background: avatarUrl ? '#000' : `linear-gradient(145deg, ${color}33, ${color}99)` }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                : <span>{initials}</span>
              }
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading
                  ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                }
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full mb-2"
              style={{ background: color + '15', border: `1px solid ${color}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color }}>
                KOŞUCU
              </span>
            </div>
            <h1 className="font-display font-black text-white text-2xl leading-tight truncate">
              {displayName}
            </h1>
            {username && (
              <div className="font-mono text-sm mt-0.5" style={{ color: color + 'aa' }}>@{username}</div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          className="max-w-lg mx-auto px-5 pb-6 flex gap-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8, paddingTop: 16 }}
        >
          {[
            { label: 'KOŞU',   value: stats.runs  },
            { label: 'KULÜP',  value: stats.clubs },
            { label: 'HÜCRE',  value: stats.cells },
          ].map((s, i) => (
            <div key={s.label} className={`flex-1 text-center ${i < 2 ? 'border-r' : ''}`}
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="font-mono font-black text-white tabular-nums leading-none" style={{ fontSize: '1.75rem' }}>
                {s.value}
              </div>
              <div className="font-mono text-[9px] mt-1 tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.30)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 py-5 pb-24 md:pb-8 space-y-4">

        {/* Profile form */}
        <form onSubmit={saveProfile} className="rounded-[20px] overflow-hidden" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.07)' }}>
          <CardHeader label="Profil Bilgileri" sub="Kimliğini özelleştir" color={color} />
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FloatField label="Ad Soyad"      value={fullName} onChange={e => setFullName(e.target.value)} color={color} />
              <FloatField label="Kullanıcı Adı" value={username} onChange={e => setUsername(e.target.value)} color={color} />
            </div>

            {/* Bio */}
            <div className="relative">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Kısa bio..."
                rows={3}
                maxLength={160}
                className="w-full text-sm outline-none resize-none rounded-[14px] transition-all"
                style={{
                  background: '#1C1C1C',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: '12px 14px',
                  fontFamily: 'inherit',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = color + '60' }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
              <span
                className="absolute bottom-2.5 right-3 font-mono text-[10px] tabular-nums"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {bio.length}/160
              </span>
            </div>

            {/* Gender */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Cinsiyet
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { v: 'male',   l: 'Erkek',  e: '♂' },
                  { v: 'female', l: 'Kadın', e: '♀' },
                  { v: '',       l: 'Belirtme', e: '∅' },
                ] as const).map((opt) => {
                  const sel = gender === opt.v
                  return (
                    <button
                      key={opt.l}
                      type="button"
                      onClick={() => setGender(opt.v)}
                      className="py-2.5 rounded-[12px] font-display font-bold text-[12px] transition-all tap"
                      style={{
                        background: sel
                          ? `linear-gradient(180deg, ${color}22, ${color}0C)`
                          : 'rgba(255,255,255,0.025)',
                        border: `1px solid ${sel ? color + '55' : 'rgba(255,255,255,0.07)'}`,
                        color: sel ? color : 'rgba(255,255,255,0.55)',
                        boxShadow: sel ? `0 0 0 1px ${color}15 inset, 0 0 16px -6px ${color}55` : 'none',
                      }}
                    >
                      <span className="mr-1">{opt.e}</span>{opt.l}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Avatar Rengi
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {AVATAR_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-all duration-150 flex-shrink-0"
                    style={{
                      background: c,
                      transform: color === c ? 'scale(1.2)' : 'scale(1)',
                      outline: color === c ? `2.5px solid ${c}` : 'none',
                      outlineOffset: 3,
                      opacity: color === c ? 1 : 0.45,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <ActionBtn saving={saving} color={color} label="Kaydet" />
              <StatusMsg msg={saveMsg} />
            </div>
          </div>
        </form>

        {/* Avatar upload card */}
        <div className="rounded-[20px] overflow-hidden" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.07)' }}>
          <CardHeader label="Görsel" sub="Profil fotoğrafı" color={color} />
          <div className="p-5 flex items-center gap-5">
            {/* Preview */}
            <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => fileRef.current?.click()}>
              <div className="absolute -inset-1 blur-xl opacity-25 rounded-full" style={{ background: color }} />
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-white font-mono font-black text-xl"
                style={{ background: avatarUrl ? '#000' : `linear-gradient(145deg, ${color}33, ${color}99)` }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span>{initials}</span>
                }
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              </div>
            </div>

            {/* Upload button */}
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-3 rounded-[14px] font-mono text-xs tracking-[0.1em] uppercase transition-all"
                style={{ border: `1px dashed ${color}35`, color: color + '88', background: color + '06' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = color + '12'; (e.currentTarget as HTMLElement).style.borderColor = color + '60' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = color + '06'; (e.currentTarget as HTMLElement).style.borderColor = color + '35' }}
              >
                {uploading ? 'Yükleniyor...' : '↑ Fotoğraf Yükle'}
              </button>
              <p className="font-mono text-[10px] mt-2 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                JPG, PNG veya WEBP · Maks 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Security card */}
        <form onSubmit={savePw} className="rounded-[20px] overflow-hidden" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.07)' }}>
          <CardHeader label="Güvenlik" sub="Şifre değiştir" color="#EF4444" />
          <div className="p-5 space-y-3">
            <FloatField label="Yeni Şifre"   type="password" value={newPw}     onChange={e => setNewPw(e.target.value)}     color="#EF4444" />
            <FloatField label="Şifre Tekrar" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} color="#EF4444" />
            <div className="flex items-center gap-4 pt-1">
              <ActionBtn saving={pwSaving} color="#EF4444" label="Değiştir" />
              <StatusMsg msg={pwMsg} />
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────── */

function CardHeader({ color, label, sub }: { color: string; label: string; sub: string }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-[3px] h-5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div>
        <div className="font-display font-bold text-white text-sm">{label}</div>
        <div className="font-mono text-[10px] mt-px" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
      </div>
    </div>
  )
}

function FloatField({ label, value, onChange, type = 'text', color }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string; color: string
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div className="relative">
      <label
        className="absolute left-3.5 pointer-events-none transition-all duration-150 z-10 font-mono uppercase"
        style={{
          top:           active ? '7px' : '50%',
          transform:     active ? 'none' : 'translateY(-50%)',
          fontSize:      active ? '8px' : '11px',
          color:         focused ? color : 'rgba(255,255,255,0.30)',
          letterSpacing: active ? '0.18em' : '0.05em',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full text-sm outline-none rounded-[14px] transition-all"
        style={{
          background:    '#1C1C1C',
          border:        `1px solid ${focused ? color + '55' : 'rgba(255,255,255,0.08)'}`,
          color:         '#fff',
          paddingTop:    22,
          paddingBottom: 8,
          paddingLeft:   14,
          paddingRight:  14,
          boxShadow:     focused ? `0 0 0 3px ${color}12` : 'none',
        }}
      />
    </div>
  )
}

function ActionBtn({ saving, color, label }: { saving: boolean; color: string; label: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="px-6 py-2.5 rounded-[12px] font-display font-black text-[11px] tracking-[0.15em] uppercase transition-all active:scale-[0.97] disabled:opacity-40"
      style={{
        background:  color,
        color:       color === '#EF4444' ? '#fff' : '#000',
        boxShadow:   saving ? 'none' : `0 4px 20px ${color}40`,
      }}
    >
      {saving ? '...' : label}
    </button>
  )
}

function StatusMsg({ msg }: { msg: string }) {
  if (!msg) return null
  const ok = msg === 'ok'
  return (
    <span className="font-mono text-xs flex items-center gap-1.5" style={{ color: ok ? '#22C55E' : '#EF4444' }}>
      <span>{ok ? '✓' : '✗'}</span>
      {ok ? 'Kaydedildi' : msg}
    </span>
  )
}
