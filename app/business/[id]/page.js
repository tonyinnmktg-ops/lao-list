'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BusinessPage() {
  const params = useParams()
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
    if (params.id) fetchBusiness()
  }, [params.id])

  if (!business) return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <a href="/" className="text-sm font-medium mb-8 inline-block" style={{ color: '#2d5a3d' }}>
        ← Back to Directory
      </a>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mt-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            <p className="text-gray-500 mt-1">{business.category} · {business.city}, {business.state}</p>
          </div>
          {business.is_lao_owned && (
            <span style={{ backgroundColor: '#f0f9f4', color: '#2d5a3d' }} className="text-xs font-semibold px-3 py-1 rounded-full ml-4 whitespace-nowrap">
              Lao Owned
            </span>
          )}
        </div>

        {business.description && (
          <p className="text-gray-600 mb-8 leading-relaxed">{business.description}</p>
        )}

        <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
          {business.address && (
            <div className="flex gap-3">
              <span className="font-semibold text-gray-700 w-32 shrink-0">Address</span>
              <span className="text-gray-600">{business.address}, {business.city}, {business.state} {business.zip}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex gap-3">
              <span className="font-semibold text-gray-700 w-32 shrink-0">Phone</span>
              <a href={`tel:${business.phone}`} style={{ color: '#2d5a3d' }} className="hover:underline">{business.phone}</a>
            </div>
          )}
          {business.website && (
            <div className="flex gap-3">
              <span className="font-semibold text-gray-700 w-32 shrink-0">Website</span>
              <a href={business.website} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline">{business.website}</a>
            </div>
          )}
          {business.google_url && (
            <div className="flex gap-3">
              <span className="font-semibold text-gray-700 w-32 shrink-0">Google Maps</span>
              <a href={business.google_url} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline">View on Google Maps</a>
            </div>
          )}
          {business.instagram && (
            <div className="flex gap-3">
              <span className="font-semibold text-gray-700 w-32 shrink-0">Instagram</span>
<a href={`https://instagram.com/${business.instagram.replace('@', '')}`} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline">@{business.instagram.replace('@', '')}</a>            </div>
          )}
          {business.facebook && (
            <div className="flex gap-3">
              <span className="font-semibold text-gray-700 w-32 shrink-0">Facebook</span>
              <a href={business.facebook} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline">{business.facebook}</a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
