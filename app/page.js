'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [businesses, setBusinesses] = useState([])
  const [filter, setFilter] = useState({ state: '', category: '' })
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchBusinesses()
  }, [filter, search])

  async function fetchBusinesses() {
    let query = supabase.from('businesses').select('*').eq('status', 'active')
if (search) {
  query = query.or(
    `name.ilike.%${search}%,city.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`
  )
}

    if (filter.state) query = query.eq('state', filter.state)
    if (filter.category) query = query.eq('category', filter.category)

    const { data } = await query
    if (data) setBusinesses(data)
  }

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <main>
      <div style={{ backgroundColor: '#2d5a3d' }} className="px-6 py-16 text-center">
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
            className="flex-1 px-4 py-3 rounded-full text-gray-900 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full font-semibold text-sm transition"
            style={{ backgroundColor: '#f0f9f4', color: '#2d5a3d' }}
          >
            Search
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8 flex-wrap items-center">
          <select
            onChange={(e) => setFilter({ ...filter, state: e.target.value })}
            className="border border-gray-200 bg-white px-4 py-2 rounded-full text-sm font-medium focus:outline-none"
          >
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

          <select
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="border border-gray-200 bg-white px-4 py-2 rounded-full text-sm font-medium focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="restaurant">Restaurant</option>
            <option value="nonprofit">Nonprofit</option>
            <option value="service">Service</option>
            <option value="retail">Retail</option>
            <option value="other">Other</option>
          </select>

          {search && (
            <button
              onClick={() => { setSearch(''); setSearchInput('') }}
              className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
              style={{ color: '#2d5a3d' }}
            >
              Clear search
            </button>
          )}

          <span className="text-sm text-gray-400">{businesses.length} listings</span>
        </div>

        <div className="grid gap-4">
          {businesses.map((biz) => (
            <a
              key={biz.id}
              href={`/business/${biz.id}`}
              className="bg-white border border-gray-100 rounded-xl p-5 block hover:shadow-md hover:border-gray-200 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{biz.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{biz.category} · {biz.city}, {biz.state}</p>
                  {biz.description && <p className="text-sm text-gray-600 mt-2">{biz.description}</p>}
                </div>
                {biz.is_lao_owned && (
                  <span style={{ backgroundColor: '#f0f9f4', color: '#2d5a3d' }} className="text-xs font-semibold px-3 py-1 rounded-full ml-4 whitespace-nowrap">
                    Lao Owned
                  </span>
                )}
              </div>
            </a>
          ))}
          {businesses.length === 0 && (
            <p className="text-gray-400 text-center py-12">No businesses found.</p>
          )}
        </div>
      </div>
    </main>
  )
}
