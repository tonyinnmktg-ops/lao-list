'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { CATEGORIES, categoryHref } from '../lib/categories'
import BusinessCard from './components/BusinessCard'
import { METROS, getMetro, inMetro, cityKey } from '../lib/metros'

const GREEN = '#2d5a3d'

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  )
}

function HomeInner() {
  const router = useRouter()
  const params = useSearchParams()
  const category = params.get('category') || ''
  const state = params.get('state') || ''
  const q = params.get('q') || ''
  const subs = params.getAll('sub')
  const metroSlug = params.get('metro') || ''
  const metro = getMetro(metroSlug)
  const city = params.get('city') || ''
  const isDirectory = Boolean(category || state || q || metro || city || subs.length)

  const [searchInput, setSearchInput] = useState(q)
  const [featured, setFeatured] = useState([])
  const [counts, setCounts] = useState({})
  const [metroCounts, setMetroCounts] = useState({})
  const [states, setStates] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => setSearchInput(q), [q])

  // One-time: featured, category counts, state list
  useEffect(() => {
    fetchFeatured()
    supabase
      .from('businesses')
      .select('category, state, city')
      .eq('status', 'active')
      .then(({ data }) => {
        if (!data) return
        const c = {}
        const s = new Set()
        data.forEach((b) => {
          c[b.category] = (c[b.category] || 0) + 1
          if (b.state) s.add(b.state)
        })
        setCounts(c)
        setStates([...s].sort())
        const m = {}
        METROS.forEach((mt) => { m[mt.slug] = data.filter((b) => inMetro(mt, b)).length })
        setMetroCounts(m)
      })
  }, [])

  useEffect(() => {
    if (isDirectory) fetchBusinesses()
  }, [category, state, q, metroSlug])

  async function fetchFeatured() {
    // Businesses marked featured first; top up to 3 with highest-rated businesses that have photos
    const { data: marked } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .limit(3)
    let list = marked || []
    if (list.length < 3) {
      const { data: top } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'active')
        .not('photo_url', 'is', null)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(12)
      // Prefer variety: one per category before repeating
      const seenIds = new Set(list.map((b) => b.id))
      const seenCats = new Set(list.map((b) => b.category))
      const pool = (top || []).filter((b) => !seenIds.has(b.id))
      const firstPass = pool.filter((b) => {
        if (seenCats.has(b.category)) return false
        seenCats.add(b.category)
        return true
      })
      const rest = pool.filter((b) => !firstPass.includes(b))
      list = [...list, ...firstPass, ...rest].slice(0, 3)
    }
    setFeatured(list)
  }

  async function fetchBusinesses() {
    setLoading(true)
    let query = supabase.from('businesses').select('*').eq('status', 'active')
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,city.ilike.%${q}%,category.ilike.%${q}%,subcategory.ilike.%${q}%,description.ilike.%${q}%`
      )
    }
    if (state) query = query.eq('state', state)
    if (category) query = query.eq('category', category)
    if (metro) {
      query = query
        .in('city', [...new Set(metro.places.map((p) => p[0]))])
        .in('state', [...new Set(metro.places.map((p) => p[1]))])
    }
    const { data } = await query
      .order('photo_url', { ascending: true, nullsFirst: false })
      .order('rating', { ascending: false, nullsFirst: false })
    // Metro query matches city and state separately; keep only exact city+state pairs
    setBusinesses(metro ? (data || []).filter((b) => inMetro(metro, b)) : data || [])
    setLoading(false)
  }

  function go(next) {
    const p = new URLSearchParams()
    const merged = { category, state, metro: metroSlug, city, q, sub: subs, ...next }
    Object.entries(merged).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((x) => p.append(k, x))
      else if (v) p.set(k, v)
    })
    const qs = p.toString()
    router.push(qs ? '/?' + qs : '/')
  }

  function handleSearch(e) {
    e.preventDefault()
    go({ q: searchInput.trim(), category: '', state: '', metro: '', city: '', sub: [] })
  }

  // Faceted filtering on the loaded results: city and subcategory each narrow the other's counts
  const matchCity = (b) => !city || cityKey(b) === city
  const matchSubs = (b) => !subs.length || subs.includes(b.subcategory)

  const subCounts = {}
  businesses.filter(matchCity).forEach((b) => {
    if (b.subcategory) subCounts[b.subcategory] = (subCounts[b.subcategory] || 0) + 1
  })
  const subList = Object.entries(subCounts).sort((a, b) => b[1] - a[1])
  subs.forEach((s) => { if (!subCounts[s]) subList.push([s, 0]) })

  const cityCounts = {}
  businesses.filter(matchSubs).forEach((b) => {
    if (b.city) cityCounts[cityKey(b)] = (cityCounts[cityKey(b)] || 0) + 1
  })
  const cityList = Object.entries(cityCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (city && !cityCounts[city]) cityList.unshift([city, 0])
  // Show "City" alone when every result is in one state
  const oneState = state || (businesses.length && businesses.every((b) => b.state === businesses[0].state))
  const cityLabel = (key) => (oneState ? key.split(', ')[0] : key)

  const visible = businesses.filter((b) => matchCity(b) && matchSubs(b))

  function toggleSub(name) {
    go({ sub: subs.includes(name) ? subs.filter((s) => s !== name) : [...subs, name] })
  }
  const activeFilterCount =
    (category ? 1 : 0) + (state ? 1 : 0) + (metro ? 1 : 0) + (city ? 1 : 0) + subs.length

  const heading = [
    (subs.length && subs.length <= 2 ? subs.join(' & ') : '') || category || (q ? `Results for “${q}”` : 'Lao businesses'),
    city ? `in ${city.split(', ')[0]}` : metro ? `in ${metro.label}` : state ? `in ${state}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main>
      <div style={{ backgroundColor: GREEN }} className="relative overflow-hidden px-6 py-16 text-center">
        {/* Lao textile (sinh weave) as a white texture under the green; screen blend drops the dark threads */}
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
        <h1 className="text-4xl font-bold text-white mb-3">Discover Lao Businesses</h1>
        <p className="text-white opacity-70 text-lg max-w-xl mx-auto mb-8">
          A community directory of Lao-owned and Lao-inspired businesses across the United States.
        </p>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Search by name, city, category..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full text-gray-900 text-sm focus:outline-none bg-white shadow-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full font-semibold text-sm transition"
            style={{ backgroundColor: '#f0f9f4', color: GREEN }}
          >
            Search
          </button>
        </form>
        </div>
      </div>

      <div className={(isDirectory ? "max-w-6xl" : "max-w-5xl") + " mx-auto px-6 py-8"}>
        {!isDirectory ? (
          <div>
            {featured.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Featured Businesses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featured.map((biz) => (
                    <BusinessCard key={biz.id} biz={biz} badge="Featured" />
                  ))}
                </div>
              </section>
            )}

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {CATEGORIES.map(({ label, value, image }) => (
                  <a
                    key={value}
                    href={categoryHref(value)}
                    className="relative rounded-2xl overflow-hidden h-40 group block"
                    style={image ? undefined : { backgroundColor: GREEN }}
                  >
                    {image && (
                      <img
                        src={image}
                        alt={label}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition" />
                    <span className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                      <span className="font-bold text-lg leading-tight">{label}</span>
                      {counts[value] != null && (
                        <span className="text-xs opacity-80 mt-1">{counts[value]} listings</span>
                      )}
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Metro Area</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {METROS.map((m) => (
                  <a
                    key={m.slug}
                    href={'/?metro=' + m.slug}
                    className="px-5 py-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition block"
                  >
                    <span className="block font-medium text-gray-900">{m.label}</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {m.region}
                      {metroCounts[m.slug] ? ` · ${metroCounts[m.slug]} listings` : ''}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div>
            <a href="/" className="text-sm font-medium inline-flex items-center gap-1 mb-4" style={{ color: GREEN }}>
              <span aria-hidden>←</span> Back to Home
            </a>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
                {!loading && <p className="text-sm text-gray-500 mt-1">{visible.length} listings</p>}
              </div>
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className="md:hidden text-sm px-4 py-2 rounded-full border border-gray-200 bg-white font-medium"
                style={{ color: GREEN }}
              >
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
              </button>
            </div>

            <div className="md:grid md:grid-cols-[230px_1fr] md:gap-8 items-start">
              <aside
                className={(filtersOpen ? 'block' : 'hidden') + ' md:block mb-6 md:mb-0 bg-white border border-gray-100 rounded-xl p-5 md:sticky md:top-4'}
              >
                {q && (
                  <FilterGroup title="Search">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-700 truncate">“{q}”</span>
                      <button onClick={() => go({ q: '' })} className="text-xs font-medium shrink-0" style={{ color: GREEN }}>
                        Clear
                      </button>
                    </div>
                  </FilterGroup>
                )}

                <FilterGroup title="Category">
                  <div className="flex flex-col gap-1">
                    {[{ label: 'All categories', value: '' }, ...CATEGORIES].map((c) => (
                      <label key={c.value || 'all'} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5">
                        <input
                          type="radio"
                          name="category"
                          checked={category === c.value}
                          onChange={() => go({ category: c.value, sub: [] })}
                          style={{ accentColor: GREEN }}
                        />
                        <span className="flex-1">{c.label}</span>
                        {c.value && counts[c.value] != null && (
                          <span className="text-xs text-gray-400">{counts[c.value]}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                {subList.length > 0 && (
                  <FilterGroup
                    title="Subcategory"
                    action={subs.length > 0 && (
                      <button onClick={() => go({ sub: [] })} className="text-xs font-medium" style={{ color: GREEN }}>
                        Clear
                      </button>
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      {subList.map(([name, n]) => (
                        <label key={name} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5">
                          <input
                            type="checkbox"
                            checked={subs.includes(name)}
                            onChange={() => toggleSub(name)}
                            style={{ accentColor: GREEN }}
                          />
                          <span className="flex-1">{name}</span>
                          <span className="text-xs text-gray-400">{n}</span>
                        </label>
                      ))}
                    </div>
                  </FilterGroup>
                )}

                <FilterGroup title="Location">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500">
                      Metro area
                      <select
                        value={metroSlug}
                        onChange={(e) => go({ metro: e.target.value, state: '', city: '' })}
                        className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none mt-1"
                      >
                        <option value="">All metro areas</option>
                        {METROS.map((m) => (
                          <option key={m.slug} value={m.slug}>{m.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-gray-500">
                      State
                      <select
                        value={state}
                        onChange={(e) => go({ state: e.target.value, metro: '', city: '' })}
                        className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none mt-1"
                      >
                        <option value="">All states</option>
                        {states.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-gray-500">
                      City
                      <select
                        value={city}
                        onChange={(e) => go({ city: e.target.value })}
                        className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none mt-1"
                      >
                        <option value="">All cities</option>
                        {cityList.map(([key, n]) => (
                          <option key={key} value={key}>{cityLabel(key)} ({n})</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </FilterGroup>

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => go({ category: '', state: '', metro: '', city: '', sub: [], q: q })}
                    className="w-full text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition mt-1"
                    style={{ color: GREEN }}
                  >
                    Reset filters
                  </button>
                )}
              </aside>

              <div>
                {loading ? (
                  <p className="text-gray-400 text-center py-12">Loading...</p>
                ) : visible.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">No businesses found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visible.map((biz) => (
                      <BusinessCard key={biz.id} biz={biz} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function FilterGroup({ title, action, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}
