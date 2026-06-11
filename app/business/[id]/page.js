'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function BusinessPage({ params }) {
  const [business, setBusiness] = useState(null)

  useEffect(() => {
    async function fetchBusiness() {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) setBusiness(data)
    }
    fetchBusiness()
  }, [params.id])

  if (!business) return <main className="max-w-2xl mx-auto p-6"><p>Loading...</p></main>

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
      <p className="text-gray-500 mb-6">{business.category} — {business.city}, {business.state}</p>

      {business.description && (
        <p className="mb-6">{business.description}</p>
      )}

      <div className="flex flex-col gap-3">
        {business.address && (
          <div>
            <span className="font-semibold">Address: </span>
            {business.address}, {business.city}, {business.state} {business.zip}
          </div>
        )}
        {business.phone && (
          <div>
            <span className="font-semibold">Phone: </span>
            <a href={`tel:${business.phone}`} className="text-blue-500">{business.phone}</a>
          </div>
        )}
        {business.website && (
          <div>
            <span className="font-semibold">Website: </span>
            <a href={business.website} target="_blank" className="text-blue-500">{business.website}</a>
          </div>
        )}
        {business.instagram && (
          <div>
            <span className="font-semibold">Instagram: </span>
            <a href={`https://instagram.com/${business.instagram}`} target="_blank" className="text-blue-500">@{business.instagram}</a>
          </div>
        )}
        {business.facebook && (
          <div>
            <span className="font-semibold">Facebook: </span>
            <a href={business.facebook} target="_blank" className="text-blue-500">{business.facebook}</a>
          </div>
        )}
        {business.is_lao_owned && (
          <div className="mt-4 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Lao Owned
          </div>
        )}
      </div>
    </main>
  )
}
