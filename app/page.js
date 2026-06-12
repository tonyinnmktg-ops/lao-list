'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [businesses, setBusinesses] = useState([])
  const [filter, setFilter] = useState({ state: '', category: '' })

  useEffect(() => {
    fetchBusinesses()
  }, [filter])

  async function fetchBusinesses() {
    let query = supabase.from('businesses').select('*').eq('status', 
'active')

    if (filter.state) query = query.eq('state', filter.state)
    if (filter.category) query = query.eq('category', filter.category)

    const { data, error } = await query
    if (data) setBusinesses(data)
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lao List</h1>

      <div className="flex gap-4 mb-6">
<select onChange={(e) => setFilter({ ...filter, state: e.target.value })} className="border p-2 rounded">
  <option value="">All States</option>
  <option value="California">California</option>
  <option value="Texas">Texas</option>
  <option value="Minnesota">Minnesota</option>
  <option value="Washington">Washington</option>
  <option value="Georgia">Georgia</option>
  <option value="Illinois">Illinois</option>
  <option value="North Carolina">North Carolina</option>
  <option value="Massachusetts">Massachusetts</option>
  <option value="Wisconsin">Wisconsin</option>
  <option value="Kansas">Kansas</option>
</select>
        <select onChange={(e) => setFilter({ ...filter, category: 
e.target.value })} className="border p-2 rounded">
          <option value="">All Categories</option>
          <option value="restaurant">Restaurant</option>
          <option value="nonprofit">Nonprofit</option>
          <option value="service">Service</option>
        </select>
      </div>

      <div className="grid gap-4">
        {businesses.map((biz) => (
  <a key={biz.id} href={`/business/${biz.id}`} className="border rounded p-4 block hover:border-gray-400 transition">
    <h2 className="text-xl font-semibold">{biz.name}</h2>
    <p className="text-gray-500">{biz.category} — {biz.city}, {biz.state}</p>
    <p className="mt-2">{biz.description}</p>
  </a>
))}
        {businesses.length === 0 && <p className="text-gray-400">No 
businesses found.</p>}
      </div>
    </main>
  )
}
