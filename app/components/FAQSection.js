'use client'

import { useState } from 'react'
import { FAQ_TABS } from '../../lib/faqs'

const GREEN = '#2d5a3d'

const STEPS = [
  {
    text: 'Search by name, dish, city or category',
    icon: (
      <>
        <circle cx="21" cy="21" r="11" />
        <path d="M29 29l10 10" />
      </>
    ),
  },
  {
    text: 'Browse your metro area, from the Twin Cities to the Central Valley',
    icon: (
      <>
        <path d="M24 42s-13-12.5-13-23a13 13 0 0126 0c0 10.5-13 23-13 23z" />
        <circle cx="24" cy="19" r="5" />
      </>
    ),
  },
  {
    text: 'Discover nearby spots similar to the ones you love',
    icon: (
      <>
        <path d="M7 24h34a17 17 0 01-34 0z" />
        <path d="M18 17c0-3 3-3 3-6M25 17c0-3 3-3 3-6" />
        <path d="M14 41h20" />
      </>
    ),
  },
  {
    text: 'Add a business and help grow the directory',
    icon: (
      <>
        <circle cx="24" cy="24" r="17" />
        <path d="M24 16v16M16 24h16" />
      </>
    ),
  },
]

export default function FAQSection() {
  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState(null)
  const items = FAQ_TABS[tab].items

  // Structured data so search engines can show these Q&As in results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_TABS.flatMap((t) =>
      t.items.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a },
      }))
    ),
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-14">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          Frequently asked questions about LaoList
        </h2>
        <p className="text-gray-600 leading-relaxed">
          LaoList helps you find Lao-owned and Lao-inspired businesses across the United States, from family
          restaurants serving khao piak and larb to markets, nonprofits and temples. Browse more than 300 listings by
          category, metro area or city, and help the directory grow by adding the places you love.
        </p>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">How does LaoList work?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
        {STEPS.map((s) => (
          <div key={s.text}>
            <svg
              viewBox="0 0 48 48"
              className="w-12 h-12 mb-4"
              fill="none"
              stroke={GREEN}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {s.icon}
            </svg>
            <p className="font-semibold text-gray-900 leading-snug">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-8 border-b border-gray-200 overflow-x-auto mb-2" role="tablist">
        {FAQ_TABS.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={tab === i}
            onClick={() => { setTab(i); setOpen(null) }}
            className="pb-3 text-base whitespace-nowrap border-b-2 -mb-px transition"
            style={tab === i ? { color: '#1a1a1a', borderColor: 'var(--color-saffron)', fontWeight: 600 } : { color: '#6b7280', borderColor: 'transparent' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CSS columns: fills left column first, keeps order on mobile, and an open answer doesn't stretch its neighbour */}
      <div className="md:columns-2 md:gap-x-12">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q} className="border-b border-gray-100 break-inside-avoid">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-semibold text-gray-900">{item.q}</span>
                <svg
                  viewBox="0 0 20 20"
                  className={'w-5 h-5 shrink-0 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden
                >
                  <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && <p className="text-gray-600 leading-relaxed pb-5 -mt-1 pr-8">{item.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
