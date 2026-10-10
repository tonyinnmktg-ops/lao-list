'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate, todayISO } from '../../lib/events'

const GREEN = '#2d5a3d'

// Order and intro text for each section. `value` must match resources.category.
const SECTIONS = [
  { value: 'Scholarships & Education', id: 'education', intro: 'Scholarships for Lao and Southeast Asian American students, and places to learn Lao language, music and dance.' },
  { value: 'Legal & Immigration', id: 'legal', intro: 'Free and low-cost legal help, with a focus on Southeast Asian refugees and families facing deportation.' },
  { value: 'Health & Mental Health', id: 'health', intro: 'Culturally aware care and services available in Lao.' },
]

function toUrl(v) {
  return /^https?:\/\//i.test(v) ? v : 'https://' + v
}

export default function ResourcesPage() {
  const [resources, setResources] = useState(null)

  useEffect(() => {
    supabase
      .from('resources')
      .select('*')
      .eq('status', 'active')
      .order('sort', { ascending: true })
      .then(({ data }) => setResources(data || []))
  }, [])

  const today = todayISO()

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">Community resources</h1>
      <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
        Scholarships, legal help and health services for Lao Americans and their families.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 max-w-3xl">
        <strong className="font-semibold">In a crisis?</strong> Call or text <a href="tel:988" className="font-semibold underline">988</a>, any time.
        When you call, say "Lao" to be connected with an interpreter. In an emergency, call 911.
      </div>

      <nav className="flex flex-wrap gap-2 mt-8 mb-4" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={'#' + s.id} className="text-sm font-medium px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
            {s.value}
          </a>
        ))}
      </nav>

      {resources === null ? (
        <p className="text-gray-400 mt-8">Loading...</p>
      ) : (
        SECTIONS.map((s) => {
          const items = resources.filter((r) => r.category === s.value)
          if (!items.length) return null
          return (
            <section key={s.id} id={s.id} className="mt-12 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{s.value}</h2>
              <p className="text-gray-600 mt-2 mb-6 max-w-2xl">{s.intro}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((r) => (
                  <a
                    key={r.id}
                    href={r.url ? toUrl(r.url) : undefined}
                    target="_blank"
                    rel="noopener"
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition block"
                  >
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-tint text-teal-ink">{r.scope || 'National'}</span>
                      {r.deadline && r.deadline >= today && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gold/20 text-gold-ink">Deadline {formatDate(r.deadline, { weekday: false })}</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 leading-snug">{r.title}</h3>
                    {r.organization && r.organization !== r.title && <p className="text-sm text-gray-500 mt-0.5">{r.organization}</p>}
                    {r.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.description}</p>}
                    {r.languages && <p className="text-xs text-gray-500 mt-3"><span className="font-medium text-gray-600">Languages:</span> {r.languages}</p>}
                    <span className="inline-block text-sm font-medium mt-3" style={{ color: GREEN }}>Visit site →</span>
                  </a>
                ))}
              </div>
            </section>
          )
        })
      )}

      <div className="mt-14 bg-white border border-gray-100 rounded-2xl p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900">Know a resource we should add?</h2>
        <p className="text-sm text-gray-600 mt-1">
          Email <a href="mailto:laolistapp@gmail.com?subject=Resource%20suggestion" className="font-medium underline underline-offset-2" style={{ color: GREEN }}>laolistapp@gmail.com</a> with
          the name, link and who it helps. We list resources as a starting point and can't vouch for every service, so please check details directly with each provider.
        </p>
      </div>
    </main>
  )
}
