'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { EVENT_TYPES, upcomingFilter, todayISO } from '../../lib/events'
import { METROS, getMetro, inMetro, cityKey } from '../../lib/metros'
import EventCard from '../components/EventCard'

const GREEN = '#2d5a3d'

// Date windows for the "When" filter, in days from today
const WHEN = [
  { value: '', label: 'Any upcoming date' },
  { value: 'week', label: 'Next 7 days', days: 7 },
  { value: 'month', label: 'Next 30 days', days: 30 },
  { value: '3months', label: 'Next 3 months', days: 92 },
]
const ONLINE = 'online'

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventsInner />
    </Suspense>
  )
}

function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

function EventsInner() {
  const router = useRouter()
  const params = useSearchParams()
  const types = params.getAll('type')
  const when = params.get('when') || ''
  const metroSlug = params.get('metro') || ''
  const state = params.get('state') || ''
  const city = params.get('city') || ''
  const q = params.get('q') || ''
  const metro = getMetro(metroSlug)

  const [events, setEvents] = useState(null)
  const [searchInput, setSearchInput] = useState(q)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => setSearchInput(q), [q])

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .or(upcomingFilter())
      .order('start_date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: true })
      .then(({ data }) => setEvents(data || []))
  }, [])

  function go(next) {
    const p = new URLSearchParams()
    const merged = { type: types, when, metro: metroSlug, state, city, q, ...next }
    Object.entries(merged).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((x) => p.append(k, x))
      else if (v) p.set(k, v)
    })
    const qs = p.toString()
    router.push(qs ? '/events?' + qs : '/events', { scroll: false })
  }

  function handleSearch(e) {
    e.preventDefault()
    go({ q: searchInput.trim() })
  }

  // Each filter, so counts for one group can be computed with the others applied
  const today = todayISO()
  const needle = q.toLowerCase()
  const match = {
    q: (e) => !q || [e.title, e.description, e.organizer, e.venue_name, e.city, e.state, e.type]
      .some((v) => v && v.toLowerCase().includes(needle)),
    type: (e) => !types.length || types.includes(e.type),
    when: (e) => {
      const w = WHEN.find((x) => x.value === when)
      return !w?.days || e.start_date <= addDays(today, w.days)
    },
    place: (e) => {
      if (state === ONLINE) return e.is_online
      if (metro) return inMetro(metro, e)
      return !state || e.state === state
    },
    city: (e) => !city || cityKey(e) === city,
  }
  const all = events || []
  const passes = (e, skip) => Object.entries(match).every(([k, fn]) => k === skip || fn(e))

  const typeCounts = {}
  all.filter((e) => passes(e, 'type')).forEach((e) => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1 })
  const whenCounts = {}
  WHEN.forEach((w) => {
    whenCounts[w.value] = all.filter((e) => passes(e, 'when') && (!w.days || e.start_date <= addDays(today, w.days))).length
  })
  const stateList = [...new Set(all.map((e) => e.state).filter(Boolean))].sort()
  const hasOnline = all.some((e) => e.is_online)
  const cityCounts = {}
  all.filter((e) => passes(e, 'city') && e.city && !e.is_online).forEach((e) => {
    cityCounts[cityKey(e)] = (cityCounts[cityKey(e)] || 0) + 1
  })
  const cityList = Object.entries(cityCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (city && !cityCounts[city]) cityList.unshift([city, 0])
  const oneState = (state && state !== ONLINE) || (all.length && all.every((e) => e.state === all[0].state))
  const cityLabel = (key) => (oneState ? key.split(', ')[0] : key)

  const visible = all.filter((e) => passes(e))
  const activeFilterCount = types.length + (when ? 1 : 0) + (metro ? 1 : 0) + (state ? 1 : 0) + (city ? 1 : 0)

  // Group by month, e.g. "November 2026"
  const groups = []
  visible.forEach((e) => {
    const [y, m] = e.start_date.split('-').map(Number)
    const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  })

  const placeName = state === ONLINE ? 'online' : city ? `in ${city.split(', ')[0]}` : metro ? `in ${metro.label}` : state ? `in ${state}` : ''
  const heading = [
    types.length === 1 ? types[0] : q ? `Events matching “${q}”` : 'Upcoming events',
    placeName,
  ].filter(Boolean).join(' ')

  const select = 'w-full border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none mt-1'

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
            Lao community events
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Festivals, temple celebrations, pop-ups and gatherings across the US.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Search events, organizers, cities..."
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
        <a href="/" className="text-sm font-medium inline-flex items-center gap-1 mb-4" style={{ color: GREEN }}>
          <span aria-hidden>←</span> Back to Home
        </a>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
            {events && <p className="text-sm text-gray-500 mt-1">{visible.length} {visible.length === 1 ? 'event' : 'events'}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="md:hidden text-sm px-4 py-2 rounded-full border border-gray-200 bg-white font-medium whitespace-nowrap"
              style={{ color: GREEN }}
            >
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
            <a
              href="/events/submit"
              className="hidden sm:inline-block bg-gold text-gold-ink text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition whitespace-nowrap"
            >
              Submit an Event
            </a>
          </div>
        </div>

        <div className="md:grid md:grid-cols-[230px_1fr] md:gap-8 items-start">
          <aside
            className={(filtersOpen ? 'block' : 'hidden') + ' md:block mb-6 md:mb-0 bg-white border border-gray-100 rounded-xl p-5 md:sticky md:top-4'}
          >
            {q && (
              <FilterGroup title="Search">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-700 truncate">“{q}”</span>
                  <button onClick={() => go({ q: '' })} className="text-xs font-medium shrink-0" style={{ color: GREEN }}>Clear</button>
                </div>
              </FilterGroup>
            )}

            <FilterGroup
              title="Event type"
              action={types.length > 0 && (
                <button onClick={() => go({ type: [] })} className="text-xs font-medium" style={{ color: GREEN }}>Clear</button>
              )}
            >
              <div className="flex flex-col gap-1">
                {EVENT_TYPES.map((t) => (
                  <label key={t.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={types.includes(t.value)}
                      onChange={() => go({ type: types.includes(t.value) ? types.filter((x) => x !== t.value) : [...types, t.value] })}
                      style={{ accentColor: GREEN }}
                    />
                    <span className="flex-1">{t.value}</span>
                    <span className="text-xs text-gray-400">{typeCounts[t.value] || 0}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="When">
              <div className="flex flex-col gap-1">
                {WHEN.map((w) => (
                  <label key={w.value || 'any'} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name="when"
                      checked={when === w.value}
                      onChange={() => go({ when: w.value })}
                      style={{ accentColor: GREEN }}
                    />
                    <span className="flex-1">{w.label}</span>
                    <span className="text-xs text-gray-400">{whenCounts[w.value]}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Location">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">
                  Metro area
                  <select value={metroSlug} onChange={(e) => go({ metro: e.target.value, state: '', city: '' })} className={select}>
                    <option value="">All metro areas</option>
                    {METROS.map((m) => <option key={m.slug} value={m.slug}>{m.label}</option>)}
                  </select>
                </label>
                <label className="text-xs text-gray-500">
                  State
                  <select value={state} onChange={(e) => go({ state: e.target.value, metro: '', city: '' })} className={select}>
                    <option value="">All states</option>
                    {hasOnline && <option value={ONLINE}>Online events</option>}
                    {stateList.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                {state !== ONLINE && (
                  <label className="text-xs text-gray-500">
                    City
                    <select value={city} onChange={(e) => go({ city: e.target.value })} className={select}>
                      <option value="">All cities</option>
                      {cityList.map(([key, n]) => <option key={key} value={key}>{cityLabel(key)} ({n})</option>)}
                    </select>
                  </label>
                )}
              </div>
            </FilterGroup>

            {activeFilterCount > 0 && (
              <button
                onClick={() => go({ type: [], when: '', metro: '', state: '', city: '' })}
                className="w-full text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition mt-1"
                style={{ color: GREEN }}
              >
                Reset filters
              </button>
            )}
          </aside>

          <div>
            {events === null ? (
              <p className="text-gray-400 text-center py-12">Loading...</p>
            ) : visible.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No upcoming events {activeFilterCount || q ? 'match these filters' : 'listed yet'}.</p>
                <a href="/events/submit" className="inline-block mt-4 text-sm font-semibold px-5 py-2.5 rounded-full bg-gold text-gold-ink">
                  Know one? Add it to LaoList
                </a>
              </div>
            ) : (
              groups.map((g) => (
                <section key={g.label} className="mb-8 last:mb-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">{g.label}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {g.items.map((e) => <EventCard key={e.id} event={e} />)}
                  </div>
                </section>
              ))
            )}
            {visible.length > 0 && (
              <p className="text-sm text-gray-500 mt-8 sm:hidden">
                Hosting something? <a href="/events/submit" className="font-medium hover:underline" style={{ color: GREEN }}>Submit an event</a>
              </p>
            )}
          </div>
        </div>
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
