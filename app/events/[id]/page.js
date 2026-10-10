'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { formatDate, formatTime, eventPlace, todayISO } from '../../../lib/events'

const GREEN = '#2d5a3d'

function toUrl(v) {
  return /^https?:\/\//i.test(v) ? v : 'https://' + v.replace(/^\/+/, '')
}

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('events').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setEvent(data)
      else setMissing(true)
    })
  }, [id])

  if (missing) return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-gray-600">We couldn't find that event. <a href="/events" style={{ color: GREEN }} className="font-medium">See all events</a></p>
    </main>
  )
  if (!event) return (
    <main className="max-w-3xl mx-auto px-4 py-12"><p className="text-gray-400">Loading...</p></main>
  )

  const multiDay = event.end_date && event.end_date !== event.start_date
  const dateLine = multiDay
    ? `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
    : formatDate(event.start_date)
  const timeLine = event.start_time
    ? multiDay
      ? `Starts ${formatTime(event.start_time)}${event.end_time ? `, ends ${formatTime(event.end_time)}` : ''}`
      : formatTime(event.start_time) + (event.end_time ? ` – ${formatTime(event.end_time)}` : '')
    : null
  const address = event.is_online ? null : [event.address, event.city, event.state].filter(Boolean).join(', ')
  const mapsUrl = address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([event.venue_name, address].filter(Boolean).join(', ')) : null
  const isPast = (event.end_date || event.start_date) < todayISO()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <a href="/events" className="text-sm font-medium inline-flex items-center gap-1 mb-4" style={{ color: GREEN }}>
        <span aria-hidden>←</span> All events
      </a>

      {isPast && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">This event has already happened.</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-teal-tint text-teal-ink mb-3">{event.type}</span>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{event.title}</h1>
        {event.organizer && <p className="text-gray-500 mt-1 text-sm">Hosted by {event.organizer}</p>}

        {event.description && <p className="text-gray-600 mt-5 leading-relaxed text-sm">{event.description}</p>}

        <div className="flex flex-col gap-4 border-t border-gray-100 pt-6 mt-6">
          <Row label="When">
            <span className="text-gray-600 text-sm">{dateLine}{timeLine && <><br />{timeLine}</>}</span>
          </Row>
          <Row label="Where">
            <span className="text-gray-600 text-sm">
              {event.venue_name && <>{event.venue_name}<br /></>}
              {event.is_online ? 'Online' : address || eventPlace(event) || 'Location to be announced'}
              {mapsUrl && <><br /><a href={mapsUrl} target="_blank" rel="noopener" className="hover:underline" style={{ color: GREEN }}>View on Google Maps</a></>}
            </span>
          </Row>
          {event.url && (
            <Row label="Details">
              <a href={toUrl(event.url)} target="_blank" rel="noopener" style={{ color: GREEN }} className="hover:underline text-sm break-all">
                Event page / tickets
              </a>
            </Row>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Details can change, so please confirm with the organizer before you go. Something wrong?{' '}
        <a href="mailto:laolistapp@gmail.com" className="font-medium hover:underline" style={{ color: GREEN }}>Let us know</a>.
      </p>
    </main>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3">
      <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">{label}</span>
      {children}
    </div>
  )
}
