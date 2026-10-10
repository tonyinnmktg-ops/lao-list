'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { US_STATES } from '../../../lib/states'
import { EVENT_TYPES, todayISO } from '../../../lib/events'

const GREEN = '#2d5a3d'

const EMPTY = {
  title: '', type: '', start_date: '', end_date: '', start_time: '', end_time: '',
  is_online: false, venue_name: '', address: '', city: '', state: '',
  url: '', organizer: '', description: '', submitter_email: '',
}

export default function SubmitEventPage() {
  const [form, setForm] = useState(EMPTY)
  const [company, setCompany] = useState('') // honeypot
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (company) return setStatus('sent')
    if (form.start_date < todayISO()) return setError('That date has already passed. Please check the start date.')
    if (form.end_date && form.end_date < form.start_date) return setError('The end date is before the start date.')
    if (!form.is_online && !form.state) return setError('Please choose a state, or mark the event as online.')
    // Guardrail: people need a place to go or a page to check
    if (![form.address, form.venue_name, form.url].some((v) => v.trim())) {
      return setError('Please add a venue or address, or a link to the event page.')
    }

    setStatus('sending')
    const row = {}
    Object.entries(form).forEach(([k, v]) => { row[k] = typeof v === 'string' ? v.trim() || null : v })
    row.submitter_email = row.submitter_email?.toLowerCase() || null
    const { error: insertError } = await supabase.from('event_submissions').insert([row])
    if (insertError) {
      setStatus('idle')
      return setError('Something went wrong sending your event. Please try again, or email laolistapp@gmail.com.')
    }
    setStatus('sent')
  }

  if (status === 'sent') return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
        <p className="text-gray-500">Your event is being reviewed and will appear on the events page shortly.</p>
        <a href="/events" style={{ backgroundColor: GREEN }} className="inline-block mt-6 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition">
          See all events
        </a>
      </div>
    </main>
  )

  const input = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white'
  const label = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <a href="/events" className="text-sm font-medium mb-8 inline-block" style={{ color: GREEN }}>← All events</a>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit an Event</h1>
        <p className="text-gray-500 text-sm mb-8">Share a Lao festival, temple celebration, pop-up or community gathering. It's free.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={label}>Event name *</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} className={input} placeholder="e.g. Pi Mai Lao 2027" />
          </div>

          <div>
            <label className={label}>Type *</label>
            <select required value={form.type} onChange={(e) => set('type', e.target.value)} className={input}>
              <option value="">Select a type</option>
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value}: {t.blurb}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Start date *</label>
              <input type="date" required min={todayISO()} value={form.start_date} onChange={(e) => set('start_date', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>End date</label>
              <input type="date" min={form.start_date || todayISO()} value={form.end_date} onChange={(e) => set('end_date', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Start time</label>
              <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>End time</label>
              <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} className={input} />
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-3">Use the local time where the event takes place. Leave the end date blank for one-day events.</p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_online} onChange={(e) => set('is_online', e.target.checked)} className="w-4 h-4 accent-green-700" />
            <span className="text-sm text-gray-700">This is an online event</span>
          </label>

          {!form.is_online && (
            <>
              <div>
                <label className={label}>Venue</label>
                <input value={form.venue_name} onChange={(e) => set('venue_name', e.target.value)} className={input} placeholder="e.g. Wat Lao Buddhavong" />
              </div>
              <div>
                <label className={label}>Street address</label>
                <input value={form.address} onChange={(e) => set('address', e.target.value)} className={input} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>City</label>
                  <input value={form.city} onChange={(e) => set('city', e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>State *</label>
                  <select value={form.state} onChange={(e) => set('state', e.target.value)} className={input}>
                    <option value="">Select a state</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className={label}>Event page or tickets link</label>
            <input value={form.url} onChange={(e) => set('url', e.target.value)} className={input} placeholder="Website, Facebook event, Eventbrite..." />
          </div>

          <div>
            <label className={label}>Organizer</label>
            <input value={form.organizer} onChange={(e) => set('organizer', e.target.value)} className={input} placeholder="Temple, organization or business hosting it" />
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={input} placeholder="What's happening, who it's for, cost" />
          </div>

          <div>
            <label className={label}>Your email *</label>
            <input type="email" required value={form.submitter_email} onChange={(e) => set('submitter_email', e.target.value)} className={input} />
            <p className="text-xs text-gray-400 mt-1">Only used if we have a question about the event. Never shown publicly.</p>
          </div>

          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={company} onChange={(e) => setCompany(e.target.value)} className="hidden" />

          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            style={{ backgroundColor: GREEN }}
            className="text-white font-semibold py-3 rounded-full hover:opacity-90 transition mt-2 disabled:opacity-60"
          >
            {status === 'sending' ? 'Submitting...' : 'Submit Event'}
          </button>
        </form>
      </div>
    </main>
  )
}
