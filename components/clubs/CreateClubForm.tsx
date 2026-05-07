'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COLORS = ['#22C55E', '#3B82F6', '#EF4444', '#A855F7', '#F59E0B', '#EC4899', '#06B6D4']

export function CreateClubForm() {
  const [name,    setName]    = useState('')
  const [color,   setColor]   = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [open,    setOpen]    = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res  = await fetch('/api/clubs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.refresh()
    setName(''); setColor(COLORS[0]); setLoading(false); setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[18px] transition-all"
        style={{ border: `1.5px dashed rgba(34,197,94,0.30)`, color: '#22C55E', background: 'rgba(34,197,94,0.04)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.55)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.30)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span className="font-display font-bold text-sm tracking-wide">Yeni Kulüp Kur</span>
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] overflow-hidden"
      style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.09)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
          </div>
          <span className="font-display font-bold text-white text-sm">Yeni Kulüp Kur</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-xl text-xs font-mono" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Kulüp adı..."
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-4 py-3.5 text-sm rounded-[14px] outline-none transition-all"
          style={{
            background: '#1C1C1C',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#fff',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = color + '80' }}
          onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
        />

        {/* Color picker */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Kulüp Rengi
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c} type="button" onClick={() => setColor(c)}
                className="w-9 h-9 rounded-full transition-all duration-150 flex-shrink-0"
                style={{
                  background: c,
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  outline: color === c ? `2.5px solid ${c}` : 'none',
                  outlineOffset: 3,
                  boxShadow: color === c ? `0 0 16px ${c}55` : 'none',
                  opacity: color === c ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-[14px] font-display font-black text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-40"
          style={{
            background: color,
            color: '#000',
            boxShadow: loading ? 'none' : `0 4px 24px ${color}50`,
          }}
        >
          {loading ? 'Oluşturuluyor...' : 'Kulüp Kur'}
        </button>
      </div>
    </form>
  )
}
