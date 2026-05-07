import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'

// --font-heading: Space Grotesk (displays / UI labels)
const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

// --font-data: JetBrains Mono (numbers / stats / mono)
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-data',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
})

// --font-body: Inter (body text)
const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Territory — Koşarken Fethet',
  description: 'Şehrini koşarak ele geçir. Kulübünle savaş, bölgeleri fethet.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#071018] text-white">
        {children}
      </body>
    </html>
  )
}
