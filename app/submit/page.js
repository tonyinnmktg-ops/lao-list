'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, SUBCATEGORIES, OTHER, needsNote, isCreator, isOnlineOnly } from '../../lib/categories'
import { US_STATES } from '../../lib/states'

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    category_note: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    is_lao_owned: true,
    submitter_email: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const creator = isCreator(form.category) // a person: content creator or artist
  const onlineOnly = isOnlineOnly(form.category)

  // /submit?category=Content%20Creators opens the form ready for a creator
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('category')
    if (c && CATEGORIES.some((x) => x.value === c)) setForm((f) => ({ ...f, category: c }))
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    const next = { ...form, [name]: type === 'checkbox' ? checked : value }
    // Changing category clears a subcategory that doesn't belong to it
    if (name === 'category' && !(SUBCATEGORIES[value] || []).includes(form.subcategory)) next.subcategory = ''
    setForm(next)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const links = [form.website, form.instagram, form.facebook, form.tiktok, form.youtube]
    // Guardrail: a listing needs a place to visit or a link to find it online. Creators need a link.
    if (creator && !links.some((v) => v.trim())) {
      setError('Please add at least one link: TikTok, Instagram, YouTube, Facebook or a website.')
      return
    }
    if (!creator && ![form.address, ...links].some((v) => v.trim())) {
      setError('Please add a street address, or a website or social link if the business is online only.')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('submissions').insert([{
      ...form,
      // People never get a street address or phone; content creators get no location at all
      ...(creator && { address: '', zip: '', phone: '' }),
      ...(onlineOnly && { city: '', state: '' }),
      subcategory: form.category === OTHER ? null : form.subcategory,
      category_note: needsNote(form.category, form.subcategory) ? form.category_note.trim() : null,
      review_status: 'pending',
      status: 'active'
    }])
    if (error) setError('Something went wrong sending your submission. Please try again, or email laolistapp@gmail.com.')
    else setSubmitted(true)
    setLoading(false)
  }

  if (submitted) return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
        <p className="text-gray-500">Your submission is under review and will be added to LaoList shortly.</p>
        <a href="/" style={{ backgroundColor: '#2d5a3d' }} className="inline-block mt-6 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition">
          Back to Directory
        </a>
      </div>
    </main>
  )

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <a href="/" className="text-sm font-medium mb-8 inline-block" style={{ color: '#2d5a3d' }}>
        ← Back to Directory
      </a>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{creator ? 'Submit an Artist or Creator' : 'Submit a Business'}</h1>
        <p className="text-gray-500 text-sm mb-8">
          {creator
            ? 'Know a Lao artist or creator, or someone whose work centers Lao culture? Add them to LaoList.'
            : 'Know a Lao-owned or Lao-inspired business? Add it to the directory.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>{creator ? 'Name (artist, creator or channel) *' : 'Business Name *'}</label>
            <input name="name" required onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" required value={form.category} onChange={handleChange} className={inputClass}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {form.category !== OTHER && (
          <div>
            <label className={labelClass}>{creator ? 'Type of work *' : 'Subcategory *'}</label>
            <select
              name="subcategory"
              required
              value={form.subcategory}
              onChange={handleChange}
              disabled={!form.category}
              className={inputClass + ' disabled:bg-gray-50 disabled:text-gray-400'}
            >
              <option value="">{form.category ? 'Select a subcategory' : 'Choose a category first'}</option>
              {(SUBCATEGORIES[form.category] || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          )}

          {needsNote(form.category, form.subcategory) && (
            <div>
              <label className={labelClass}>{creator ? 'What kind of work? *' : 'What kind of business is it? *'}</label>
              <input
                name="category_note"
                required
                maxLength={60}
                value={form.category_note}
                onChange={handleChange}
                placeholder={creator ? 'Gaming, parenting, fitness' : 'Seamstress, tattoo studio, farm'}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">A few words is perfect. We use these to add new categories.</p>
            </div>
          )}

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" onChange={handleChange} rows={3} className={inputClass} />
          </div>

          {!onlineOnly && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input name="city" onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{creator ? 'State' : 'State *'}</label>
              <select name="state" required={!creator} value={form.state} onChange={handleChange} className={inputClass}>
                <option value="">{creator ? 'Optional' : 'Select a state'}</option>
                {US_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
          )}
          {creator && !onlineOnly && (
            <p className="text-xs text-gray-400 -mt-3">Where they're based, if they perform or show work locally. Leave blank if not.</p>
          )}

          {!creator && (<>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Street Address</label>
              <input name="address" onChange={handleChange} className={inputClass} />
              <p className="text-xs text-gray-400 mt-1">Online only? Leave this blank and add a website or social link below.</p>
            </div>
            <div>
              <label className={labelClass}>Zip Code</label>
              <input name="zip" onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <input name="phone" onChange={handleChange} className={inputClass} />
          </div>

          </>)}

          <div>
            <label className={labelClass}>Website</label>
            <input name="website" onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>TikTok</label>
              <input name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="@handle" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>YouTube</label>
              <input name="youtube" value={form.youtube} onChange={handleChange} placeholder="Channel link or @handle" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Instagram Handle</label>
              <input name="instagram" onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input name="facebook" onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Your Email *</label>
            <input name="submitter_email" type="email" required onChange={handleChange} className={inputClass} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input name="is_lao_owned" type="checkbox" defaultChecked onChange={handleChange} className="w-4 h-4 accent-green-700" />
            <span className="text-sm text-gray-700">{creator ? 'This artist or creator is Lao' : 'This is a Lao-owned or Lao-inspired business'}</span>
          </label>

          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#2d5a3d' }}
            className="text-white font-semibold py-3 rounded-full hover:opacity-90 transition mt-2"
          >
            {loading ? 'Submitting...' : creator ? 'Submit' : 'Submit Business'}
          </button>
        </form>
      </div>
    </main>
  )
}
