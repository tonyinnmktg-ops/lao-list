'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { PEOPLE, SUBCATEGORIES, OTHER } from '../../lib/categories'
import CreatorCard from '../components/CreatorCard'

const GREEN = '#2d5a3d'
// Tabs: one per type of person listing
const TYPES = [
  { value: 'Content Creators', label: 'Creators' },
  { value: 'Visual Artists', label: 'Visual Artists' },
  { value: 'Performing Artists', label: 'Performing Artists' },
]

export default function CreatorsPage() {
  return (
    <Suspense fallback={null}>
      <CreatorsInner />
    </Suspense>
  )
}

function CreatorsInner() {
  const router = useRouter()
  const params = useSearchParams()
  const type = TYPES.some((t) => t.value === params.get('type')) ? params.get('type') : ''
  const niche = params.get('niche') || ''
  const q = params.get('q') || ''
  const [creators, setCreators] = useState(null)
  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => setSearchInput(q), [q])

  useEffect(() => {
    supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active')
      .in('category', PEOPLE)
      .order('featured', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true })
      .then(({ data }) => setCreators(data || []))
  }, [])

  function go(next) {
    const p = new URLSearchParams()
    const merged = { type, niche, q, ...next }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    const qs = p.toString()
    router.push(qs ? '/creators?' + qs : '/creators', { scroll: false })
  }

  const all = creators || []
  const needle = q.toLowerCase()
  const matchQ = (c) => !q || [c.name, c.description, c.subcategory, c.category_note, c.tiktok, c.instagram, c.youtube, c.city, c.state]
    .some((v) => v && v.toLowerCase().includes(needle))
  const typeCounts = {}
  all.filter(matchQ).forEach((c) => { typeCounts[c.category] = (typeCounts[c.category] || 0) + 1 })
  const inType = all.filter((c) => matchQ(c) && (!type || c.category === type))
  const counts = {}
  inType.forEach((c) => { counts[c.subcategory || OTHER] = (counts[c.subcategory || OTHER] || 0) + 1 })
  // Niche chips: the selected type's list, or every niche in use when showing all types
  const niches = type ? SUBCATEGORIES[type] : [...new Set(PEOPLE.flatMap((t) => SUBCATEGORIES[t]))]
  const visible = inType.filter((c) => !niche || (c.subcategory || OTHER) === niche)
  const submitHref = '/submit?category=' + encodeURIComponent(type || 'Content Creators')

  const chip = (active) =>
    'text-sm font-medium px-4 py-2 rounded-full border transition whitespace-nowrap ' +
    (active ? 'bg-leaf text-white border-leaf' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')

  return (
    <main>
      <div style={{ backgroundColor: GREEN }} className="relative overflow-hidden px-6 py-16 text-center">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/lao-textile-pattern.jpg)',
            backgroundSize: '540px auto',
            backgroundPosition: 'center top',
            mixBlendMode: 'screen',
            opacity: 0.16,
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 48px)',
            maskImage: 'linear-gradient(to bottom, transparent 0, #000 48px)',
          }}
        />
        <div className="relative">
          <h1 className="text-[clamp(2rem,7vw,3.5rem)] font-semibold text-white leading-[1.05] tracking-tight mb-4">
            Lao artists &amp; creators
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Musicians, actors, photographers, playwrights, cooks and storytellers sharing Lao culture.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); go({ q: searchInput.trim() }) }} className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
                            placeholder="Search artists and creators..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 rounded-full text-gray-900 text-sm focus:outline-none bg-white shadow-sm"
            />
            <button type="submit" className="px-6 py-3 rounded-full font-semibold text-sm transition" style={{ backgroundColor: '#f0f9f4', color: GREEN }}>
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {niche || (type ? TYPES.find((t) => t.value === type).label : q ? `Matching “${q}”` : 'All artists & creators')}
            </h2>
            {creators && <p className="text-sm text-gray-500 mt-1">{visible.length} {visible.length === 1 ? 'listing' : 'listings'}</p>}
          </div>
          <a
            href={submitHref}
            className="bg-gold text-gold-ink text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition whitespace-nowrap"
          >
            Add to LaoList
          </a>
        </div>

        <div className="flex gap-6 border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
          {[{ value: '', label: 'All' }, ...TYPES].map((t) => (
            <button
              key={t.value || 'all'}
              role="tab"
              aria-selected={type === t.value}
              onClick={() => go({ type: t.value, niche: '' })}
              className={'pb-3 -mb-px text-sm font-medium whitespace-nowrap border-b-2 transition ' + (type === t.value ? 'border-saffron text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800')}
            >
              {t.label} <span className="text-gray-400">{t.value ? typeCounts[t.value] || 0 : Object.values(typeCounts).reduce((a, b) => a + b, 0)}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => go({ niche: '' })} className={chip(!niche)}>All</button>
          {niches.filter((n) => counts[n] || n === niche).map((n) => (
            <button key={n} onClick={() => go({ niche: n })} className={chip(niche === n)}>
              {n} <span className={niche === n ? 'text-white/70' : 'text-gray-400'}>{counts[n] || 0}</span>
            </button>
          ))}
          {q && (
            <button onClick={() => go({ q: '' })} className="text-sm font-medium px-2 py-2" style={{ color: GREEN }}>
              Clear search
            </button>
          )}
        </div>

        {creators === null ? (
          <p className="text-gray-400 text-center py-12">Loading...</p>
        ) : visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{all.length ? 'Nothing matches yet.' : 'Coming soon.'}</p>
            <a href={submitHref} className="inline-block mt-4 text-sm font-semibold px-5 py-2.5 rounded-full bg-gold text-gold-ink">
              Know one? Add them to LaoList
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((c) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        )}
      </div>
    </main>
  )
}
