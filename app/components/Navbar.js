'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/directory', label: 'Businesses', match: (p) => p === '/directory' || p.startsWith('/business') },
  { href: '/events', label: 'Events', match: (p) => p.startsWith('/events') },
  { href: '/resources', label: 'Resources', match: (p) => p.startsWith('/resources') },
]

export default function Navbar() {
  const pathname = usePathname()
  // On the home page the navbar is transparent and sits on the hero, so the textile runs to the top
  const isHome = pathname === '/'
  const [open, setOpen] = useState(false)

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname])

  return (
    <nav
      style={{ backgroundColor: isHome && !open ? 'transparent' : '#2d5a3d' }}
      className={(isHome ? 'absolute top-0 inset-x-0 z-30' : 'relative z-30')}
    >
      <div className="px-6 h-[72px] flex items-center justify-between">
        <a href="/" className="font-display text-2xl font-semibold text-white tracking-tight">
          LaoList
        </a>

        <div className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{ color: 'white' }}
              aria-current={l.match(pathname) ? 'page' : undefined}
              className={'text-sm font-medium transition hover:opacity-80 ' + (l.match(pathname) ? 'underline underline-offset-8 decoration-2 decoration-gold' : '')}
            >
              {l.label}
            </a>
          ))}
          <Link href="/add" className="bg-gold text-gold-ink text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition">
            Add to LaoList
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="md:hidden text-white p-2 -mr-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden px-6 pb-6 border-t border-white/15">
          <ul className="flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} style={{ color: 'white' }} className="block py-3 text-base font-medium border-b border-white/10">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/add" className="mt-4 block text-center bg-gold text-gold-ink text-sm font-semibold px-4 py-3 rounded-full">
            Add to LaoList
          </Link>
        </div>
      )}
    </nav>
  )
}
