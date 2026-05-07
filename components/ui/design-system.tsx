'use client'
import { useState } from 'react'

export function HexLogo({ size = 40, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {glow && (
        <div className="absolute inset-0 blur-lg opacity-60"
          style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }} />
      )}
      <svg viewBox="0 0 40 40" width={size} height={size} className="relative">
        <defs>
          <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="none" stroke="url(#hexGrad)" strokeWidth="2" />
        <polygon points="20,6 32,13 32,27 20,34 8,27 8,13" fill="#22C55E" fillOpacity="0.08" />
        <g fill="#22C55E" transform="translate(20,20)">
          <circle cx="2" cy="-6" r="2" />
          <path d="M -4,4 L 0,-2 L 4,0 L 6,4 L 4,4 L 2,1 L -1,3 L -2,6 L -4,6 Z" />
        </g>
      </svg>
    </div>
  )
}

export function Hexagon({ size = 28, color = '#22C55E', filled = true }: { size?: number; color?: string; filled?: boolean }) {
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" />
      </svg>
    </div>
  )
}

export function HexGridBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.22) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.16) 0%, transparent 55%)',
      }} />
    </div>
  )
}

export function FloatingInput({ label, type = 'text', value, onChange, error }: {
  label: string; type?: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-[#1C1C1C] border rounded-xl px-4 pt-5 pb-2 text-white text-sm outline-none transition-all ${
          error ? 'border-[#EF4444]' :
          focused ? 'border-[#22C55E] ring-2 ring-[#22C55E]/20' :
          'border-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.16)]'
        }`}
      />
      <label className={`absolute left-4 pointer-events-none transition-all ${
        active
          ? `top-1.5 text-[10px] uppercase tracking-wider ${focused ? 'text-[#22C55E]' : 'text-slate-500'}`
          : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
      }`}>
        {label}
      </label>
    </div>
  )
}

export function GlowButton({ children, onClick, variant = 'green', disabled = false, type = 'button' }: {
  children: React.ReactNode; onClick?: () => void
  variant?: 'green' | 'red' | 'blue'; disabled?: boolean; type?: 'button' | 'submit'
}) {
  const variants = {
    green: 'from-[#16A34A] to-[#22C55E] shadow-[0_0_30px_rgba(34,197,94,0.45)] hover:shadow-[0_0_50px_rgba(34,197,94,0.7)]',
    red: 'from-[#DC2626] to-[#EF4444] shadow-[0_0_30px_rgba(239,68,68,0.45)] hover:shadow-[0_0_50px_rgba(239,68,68,0.7)]',
    blue: 'from-[#2563EB] to-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.45)] hover:shadow-[0_0_50px_rgba(59,130,246,0.7)]',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`relative w-full bg-gradient-to-br ${variants[variant]} text-white font-bold py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

type IconProps = React.SVGProps<SVGSVGElement>

export const MapIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const UsersIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const TrophyIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55.47.98.97 1.21C12.15 18.75 13 19.85 13 21M14 14.66V17c0 .55-.47.98-.97 1.21C11.85 18.75 11 19.85 11 21M18 2H6v7a6 6 0 0012 0V2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
export const PlayIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z" /></svg>
)
export const StopIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
)
export const LogoutIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const PersonIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const CheckIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...p}>
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const ShieldIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const FlagIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22V15" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
export const SwordIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const ChevronDownIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}>
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const ArrowRightIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
