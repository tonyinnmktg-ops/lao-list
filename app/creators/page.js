'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { CREATORS, SUBCATEGORIES, OTHER } from '../../lib/categories'
import CreatorCard from '../components/CreatorCard'

const GREEN = '#2d5a3d'
const NICHES = SUBCATEGORIES[CREATORS]

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
      .eq('category', CREATORS)
      .order('featured', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true })
      .then(({ data }) => setCreators(data || []))
  }, [])

  function go(next) {
    const p = new URLSearchParams()
    const merged = { niche, q, ...next }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    const qs = p.toString()
    router.push(qs ? '/creators?' + qs : '/creators', { scroll: false })
  }

  const all = creators || []
  const needle = q.toLowerCase()
  const matchQ = (c) => !q || [c.name, c.description, c.subcategory, c.category_note, c.tiktok, c.instagram, c.youtube]
    .some((v) => v && v.toLowerCase().includes(needle))
  const counts = {}
  all.filter(matchQ).forEach((c) => { counts[c.subcategory || OTHER] = (counts[c.subcategory || OTHER] || 0) + 1 })
  const visible = all.filter((c) => matchQ(c) && (!niche || (c.subcategory || OTHER) === niche))

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
            Lao content creators
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Cooks, comedians, storytellers, musicians and podcasters sharing Lao culture online.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); go({ q: searchInput.trim() }) }} className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Search creators..."
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
              {niche ? `${niche} creators` : q ? `Creators matching “${q}”` : 'All creators'}
            </h2>
            {creators && <p className="text-sm text-gray-500 mt-1">{visible.length} {visible.length === 1 ? 'creator' : 'creators'}</p>}
          </div>
          <a
            href={'/submit?category=' + encodeURIComponent(CREATORS)}
            className="bg-gold text-gold-ink text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition whitespace-nowrap"
          >
            Submit a Creator
          </a>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => go({ niche: '' })} className={chip(!niche)}>All</button>
          {NICHES.filter((n) => counts[n] || n === niche).map((n) => (
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
            <p className="text-gray-500">{all.length ? 'No creators match.' : 'Creators are coming soon.'}</p>
            <a href={'/submit?category=' + encodeURIComponent(CREATORS)} className="inline-block mt-4 text-sm font-semibold px-5 py-2.5 rounded-full bg-gold text-gold-ink">
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
