import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yaphook — Webhook Editor',
  description: 'Create, preview, and send rich webhook messages with Yaphook.',
  generator: 'v0.app',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yaphook%20logo-kl9YHmJ75buGiFcareIXOC5JZypZjY.png',
    shortcut: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yaphook%20logo-kl9YHmJ75buGiFcareIXOC5JZypZjY.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#ff6b4a',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><script dangerouslySetInnerHTML={{ __html: `(() => { try { const p = localStorage.getItem('yapper-theme') || 'system'; const dark = p === 'dark' || (p === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.classList.toggle('dark', dark); document.documentElement.dataset.theme = p } catch {} })()` }} /></head><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
