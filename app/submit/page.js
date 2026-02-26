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

    const { data, error } = await supabase.from('submissions').insert([{
      ...form,
      review_status: 'pending',
      status: 'active'
    }])

    console.log('error:', error)
    console.log('data:', data)
    if (!error) setSubmitted(true)
    setLoading(false)
  }

  if (submitted) return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Thank you!</h1>
      <p>Your submission is under review and will be added to Lao List 
shortly.</p>
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Submit a Business</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" placeholder="Business Name *" required 
onChange={handleChange} className="border p-2 rounded" />
        <select name="category" required onChange={handleChange} 
className="border p-2 rounded">
          <option value="">Select Category *</option>
          <option value="restaurant">Restaurant</option>
          <option value="nonprofit">Nonprofit</option>
          <option value="service">Service</option>
          <option value="retail">Retail</option>
          <option value="other">Other</option>
        </select>
        <textarea name="description" placeholder="Description" 
onChange={handleChange} className="border p-2 rounded" />
        <input name="address" placeholder="Street Address" 
onChange={handleChange} className="border p-2 rounded" />
        <input name="city" placeholder="City" onChange={handleChange} 
className="border p-2 rounded" />
        <input name="state" placeholder="State (e.g. MN)" 
onChange={handleChange} className="border p-2 rounded" />
        <input name="zip" placeholder="Zip Code" onChange={handleChange} 
className="border p-2 rounded" />
        <input name="phone" placeholder="Phone Number" 
onChange={handleChange} className="border p-2 rounded" />
        <input name="website" placeholder="Website URL" 
onChange={handleChange} className="border p-2 rounded" />
        <input name="instagram" placeholder="Instagram Handle" 
onChange={handleChange} className="border p-2 rounded" />
        <input name="facebook" placeholder="Facebook URL" 
onChange={handleChange} className="border p-2 rounded" />
        <input name="submitter_email" type="email" placeholder="Your Email 
*" required onChange={handleChange} className="border p-2 rounded" />
        <label className="flex items-center gap-2">
          <input name="is_lao_owned" type="checkbox" defaultChecked 
onChange={handleChange} />
          This is a Lao-owned or Lao-inspired business
        </label>
        <button type="submit" disabled={loading} className="bg-black 
text-white p-2 rounded">
          {loading ? 'Submitting...' : 'Submit Business'}
        </button>
      </form>
    </main>
  )
}
