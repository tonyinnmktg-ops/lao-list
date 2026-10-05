'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { CATEGORIES, categoryHref } from '../lib/categories'
import BusinessCard from './components/BusinessCard'

const GREEN = '#2d5a3d'
const cities = ['Houston', 'Minneapolis', 'Los Angeles', 'Dallas', 'Atlanta', 'Seattle']

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
  const isDirectory = Boolean(category || state || q)

  const [searchInput, setSearchInput] = useState(q)
  const [featured, setFeatured] = useState([])
  const [counts, setCounts] = useState({})
  const [states, setStates] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => setSearchInput(q), [q])

  // One-time: featured, category counts, state list
  useEffect(() => {
    fetchFeatured()
    supabase
      .from('businesses')
      .select('category, state')
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
      })
  }, [])

  useEffect(() => {
    if (isDirectory) fetchBusinesses()
  }, [category, state, q])

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
        `name.ilike.%${q}%,city.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`
      )
    }
    if (state) query = query.eq('state', state)
    if (category) query = query.eq('category', category)
    const { data } = await query
      .order('photo_url', { ascending: true, nullsFirst: false })
      .order('rating', { ascending: false, nullsFirst: false })
    setBusinesses(data || [])
    setLoading(false)
  }

  function go(next) {
    const p = new URLSearchParams()
    const merged = { category, state, q, ...next }
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v))
    const qs = p.toString()
    router.push(qs ? '/?' + qs : '/')
  }

  function handleSearch(e) {
    e.preventDefault()
    go({ q: searchInput.trim(), category: '', state: '' })
  }

  const heading = [
    category || (q ? `Results for “${q}”` : 'All businesses'),
    state ? `in ${state}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main>
      <div style={{ backgroundColor: GREEN }} className="px-6 py-16 text-center">
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

      <div className="max-w-5xl mx-auto px-6 py-8">
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by City</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cities.map((city) => (
                  <a
                    key={city}
                    href={'/?q=' + encodeURIComponent(city)}
                    className="text-left px-5 py-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition block"
                  >
                    <span className="font-medium text-gray-900">{city}</span>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{heading}</h2>

            <div className="flex gap-3 mb-8 flex-wrap items-center">
              <select
                value={category}
                onChange={(e) => go({ category: e.target.value })}
                className="border border-gray-200 bg-white px-4 py-2 rounded-full text-sm font-medium focus:outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <select
                value={state}
                onChange={(e) => go({ state: e.target.value })}
                className="border border-gray-200 bg-white px-4 py-2 rounded-full text-sm font-medium focus:outline-none"
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {q && (
                <button
                  onClick={() => go({ q: '' })}
                  className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                  style={{ color: GREEN }}
                >
                  Clear search
                </button>
              )}

              {!loading && <span className="text-sm text-gray-400">{businesses.length} listings</span>}
            </div>

            {loading ? (
              <p className="text-gray-400 text-center py-12">Loading...</p>
            ) : businesses.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No businesses found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {businesses.map((biz) => (
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
