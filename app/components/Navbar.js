'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  // On the home page the navbar is transparent and sits on the hero, so the textile runs to the top
  const isHome = usePathname() === '/'
  return (
    <nav
      style={{ backgroundColor: isHome ? 'transparent' : '#2d5a3d' }}
      className={'px-6 py-4 flex items-center justify-between h-[72px] ' + (isHome ? 'absolute top-0 inset-x-0 z-20' : 'relative')}
    >
      <a href="/" className="font-display text-2xl font-semibold text-white tracking-tight">
        LaoList
      </a>
      <div className="flex items-center gap-6">
        <a href="/directory" style={{ color: 'white' }} className="hidden sm:inline text-sm font-medium hover:opacity-80 transition">
          Directory
        </a>
        <Link href="/submit" className="bg-gold text-gold-ink text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition">
          Submit a Business
        </Link>
      </div>
    </nav>
  )
}
