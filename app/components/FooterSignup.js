'use client'

import { usePathname } from 'next/navigation'
import EmailSignup from './EmailSignup'

// The home page has its own signup section, so the footer skips it there
export default function FooterSignup() {
  if (usePathname() === '/') return null
  return (
    <div className="max-w-5xl mx-auto mb-12 pb-12 border-b border-white/20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
      <div>
        <h2 className="text-2xl font-bold mb-2">Stay in the loop</h2>
        <p className="text-white/70 text-sm leading-relaxed">
          New Lao businesses, community events and resources, in your inbox about once a month. No spam, and we never sell your email.
        </p>
      </div>
      <EmailSignup source="footer" />
    </div>
  )
}
