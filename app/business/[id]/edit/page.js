'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { CATEGORIES, SUBCATEGORIES } from '../../../../lib/categories'

const GREEN = '#2d5a3d'
const TEXT_FIELDS = ['name', 'category', 'subcategory', 'description', 'formatted_address', 'phone', 'website', 'instagram', 'facebook']

function initialValues(b) {
  return {
    name: b.name || '',
    category: b.category || '',
    subcategory: b.subcategory || '',
    description: b.description || '',
    formatted_address:
      b.formatted_address || (b.address ? `${b.address}, ${b.city}, ${b.state} ${b.zip || ''}`.trim() : ''),
    phone: b.phone || '',
    website: b.website || '',
    instagram: b.instagram || '',
    facebook: b.facebook || '',
    is_lao_owned: Boolean(b.is_lao_owned),
  }
}

export default function SuggestEditPage() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [original, setOriginal] = useState(null)
  const [form, setForm] = useState(null)
  const [extra, setExtra] = useState({ mark_closed: false, note: '', relationship: '', submitter_email: '', company: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('businesses').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      const init = initialValues(data)
      setBusiness(data)
      setOriginal(init)
      setForm(init)
    })
  }, [id])

  if (!form) return (
    <main className="max-w-2xl mx-auto px-6 py-12"><p className="text-gray-400">Loading...</p></main>
  )

  const changes = {}
  TEXT_FIELDS.forEach((k) => {
    if (form[k].trim() !== original[k].trim()) changes[k] = form[k].trim()
  })
  if (form.is_lao_owned !== original.is_lao_owned) changes.is_lao_owned = form.is_lao_owned
  const hasSomething = Object.keys(changes).length > 0 || extra.mark_closed || extra.note.trim()

  function set(k, v) {
    setForm((f) => {
      const next = { ...f, [k]: v }
      if (k === 'category' && !(SUBCATEGORIES[v] || []).includes(f.subcategory)) next.subcategory = ''
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (extra.company) return setStatus('sent') // honeypot: bots fill hidden fields
    if (!hasSomething) return setError('Change at least one field, mark the business closed, or add a note.')
    if (!extra.relationship) return setError('Let us know if you are the owner or a customer.')

    setStatus('sending')
    const editId = crypto.randomUUID()
    const originalSubset = {}
    Object.keys(changes).forEach((k) => { originalSubset[k] = original[k] })

    const { error: insertError } = await supabase.from('listing_edits').insert([{
      id: editId,
      business_id: business.id,
      changes,
      original: originalSubset,
      mark_closed: extra.mark_closed,
      note: extra.note.trim() || null,
      relationship: extra.relationship,
      submitter_email: extra.submitter_email.trim(),
    }])
    if (insertError) {
      setStatus('error')
      setError('Something went wrong sending your suggestion. Please try again.')
      return
    }
    // Screening and notification run on the server; the visitor doesn't need to wait on them
    fetch('/api/review-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editId }),
      keepalive: true,
    }).catch(() => {})
    setStatus('sent')
  }

  if (status === 'sent') return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanks for the update!</h1>
        <p className="text-gray-500">
          Our volunteers will review your suggestion for {business.name}. Most updates go live within 1–2 days.
        </p>
        <a href={'/business/' + business.id} style={{ backgroundColor: GREEN }} className="inline-block mt-6 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition">
          Back to listing
        </a>
      </div>
    </main>
  )

  const input = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white'
  const label = 'block text-sm font-medium text-gray-700 mb-1'
  const changed = (k) => (k in changes ? { borderColor: GREEN, backgroundColor: '#f0f9f4' } : undefined)
  const subs = SUBCATEGORIES[form.category] || []

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <a href={'/business/' + business.id} className="text-sm font-medium inline-flex items-center gap-1 mb-4" style={{ color: GREEN }}>
        <span aria-hidden>←</span> Back to {business.name}
      </a>
      <h1 className="text-2xl font-bold text-gray-900">Suggest an edit</h1>
      <p className="text-gray-500 text-sm mt-1 mb-8">
        Update anything that's wrong or missing. Changed fields are highlighted, and a volunteer reviews every suggestion before it goes live.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
        <div>
          <label className={label}>Business name</label>
          <input className={input} style={changed('name')} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Category</label>
            <select className={input} style={changed('category')} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Subcategory</label>
            <select className={input} style={changed('subcategory')} value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
              <option value="">Choose one</option>
              {subs.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea rows={3} className={input} style={changed('description')} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div>
          <label className={label}>Address</label>
          <input className={input} style={changed('formatted_address')} value={form.formatted_address} onChange={(e) => set('formatted_address', e.target.value)} placeholder="Street, City, State ZIP" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Phone</label>
            <input className={input} style={changed('phone')} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <label className={label}>Website</label>
            <input className={input} style={changed('website')} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" />
          </div>
          <div>
            <label className={label}>Instagram handle</label>
            <input className={input} style={changed('instagram')} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@yourbusiness" />
          </div>
          <div>
            <label className={label}>Facebook URL</label>
            <input className={input} style={changed('facebook')} value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.is_lao_owned} onChange={(e) => set('is_lao_owned', e.target.checked)} style={{ accentColor: GREEN }} className="w-4 h-4" />
          This business is Lao-owned
        </label>

        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={extra.mark_closed} onChange={(e) => setExtra({ ...extra, mark_closed: e.target.checked })} style={{ accentColor: GREEN }} className="w-4 h-4" />
          This business has permanently closed
        </label>

        <div>
          <label className={label}>Anything else we should know?</label>
          <textarea rows={2} className={input} value={extra.note} onChange={(e) => setExtra({ ...extra, note: e.target.value })} placeholder="e.g. new hours, moved locations, better photo available" />
        </div>

        <div className="border-t border-gray-100 pt-5 flex flex-col gap-4">
          <fieldset>
            <legend className={label}>I am *</legend>
            <div className="flex gap-6 mt-1">
              {[['owner', 'The owner or staff'], ['customer', 'A customer or community member']].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="relationship" checked={extra.relationship === v} onChange={() => setExtra({ ...extra, relationship: v })} style={{ accentColor: GREEN }} />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className={label}>Your email *</label>
            <input type="email" required className={input} value={extra.submitter_email} onChange={(e) => setExtra({ ...extra, submitter_email: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">Only used if we have a question about your update.</p>
          </div>
          {/* Honeypot: hidden from people, filled by bots */}
          <input type="text" tabIndex={-1} autoComplete="off" value={extra.company} onChange={(e) => setExtra({ ...extra, company: e.target.value })} className="hidden" aria-hidden />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === 'sending'}
          style={{ backgroundColor: GREEN }}
          className="text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending...' : 'Send suggestion'}
        </button>
      </form>
    </main>
  )
}
