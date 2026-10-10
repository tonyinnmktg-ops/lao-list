'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { EVENT_TYPES, upcomingFilter } from '../../lib/events'
import EventCard from '../components/EventCard'

const GREEN = '#2d5a3d'

export default function EventsPage() {
  const [events, setEvents] = useState(null)
  const [type, setType] = useState('')
  const [state, setState] = useState('')

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

  const states = useMemo(
    () => [...new Set((events || []).map((e) => e.state).filter(Boolean))].sort(),
    [events]
  )

  const shown = (events || []).filter((e) => (!type || e.type === type) && (!state || e.state === state))

  // Group by month, e.g. "November 2026"
  const groups = []
  shown.forEach((e) => {
    const [y, m] = e.start_date.split('-').map(Number)
    const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  })

  const chip = (active) =>
    'text-sm font-medium px-4 py-2 rounded-full border transition whitespace-nowrap ' +
    (active ? 'bg-leaf text-white border-leaf' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">Lao community events</h1>
          <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
            Festivals, temple celebrations, pop-ups and gatherings across the US. Hosting something? Add it for free.
          </p>
        </div>
        <a
          href="/events/submit"
          className="self-start md:self-auto bg-gold text-gold-ink text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition whitespace-nowrap"
        >
          Submit an Event
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button onClick={() => setType('')} className={chip(!type)}>All events</button>
        {EVENT_TYPES.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)} className={chip(type === t.value)}>{t.value}</button>
        ))}
        {states.length > 1 && (
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            aria-label="Filter by state"
            className="text-sm border border-gray-200 bg-white px-4 py-2 rounded-full focus:outline-none md:ml-auto"
          >
            <option value="">All states</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {events === null ? (
        <p className="text-gray-400">Loading...</p>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
          <p className="text-gray-700 font-medium">No upcoming events {type || state ? 'match these filters' : 'yet'}.</p>
          <p className="text-gray-500 text-sm mt-1">Know of one? <a href="/events/submit" className="font-medium hover:underline" style={{ color: GREEN }}>Add it here</a>.</p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.label} className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">{g.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {g.items.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        ))
      )}
    </main>
  )
}
