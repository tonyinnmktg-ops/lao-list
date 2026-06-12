'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    is_lao_owned: true,
    submitter_email: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('submissions').insert([{
      ...form,
      review_status: 'pending',
      status: 'active'
    }])
    if (!error) setSubmitted(true)
    setLoading(false)
  }

  if (submitted) return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
        <p className="text-gray-500">Your submission is under review and will be added to Lao List shortly.</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a Business</h1>
        <p className="text-gray-500 text-sm mb-8">Know a Lao-owned or Lao-inspired business? Add it to the directory.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Business Name *</label>
            <input name="name" required onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" required onChange={handleChange} className={inputClass}>
              <option value="">Select a category</option>
              <option value="restaurant">Restaurant</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="service">Service</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" onChange={handleChange} rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input name="city" onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input name="state" onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Street Address</label>
              <input name="address" onChange={handleChange} className={inputClass} />
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

          <div>
            <label className={labelClass}>Website</label>
            <input name="website" onChange={handleChange} className={inputClass} />
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
            <span className="text-sm text-gray-700">This is a Lao-owned or Lao-inspired business</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#2d5a3d' }}
            className="text-white font-semibold py-3 rounded-full hover:opacity-90 transition mt-2"
          >
            {loading ? 'Submitting...' : 'Submit Business'}
          </button>
        </form>
      </div>
    </main>
  )
}
