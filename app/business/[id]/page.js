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
    <main className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main>
      {business.photo_url && (
        <div className="w-full h-64 overflow-hidden relative">
          <img
            src={business.photo_url}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href="/" className="text-sm font-medium mb-6 inline-block" style={{ color: '#2d5a3d' }}>
          Back to Directory
        </a>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-2">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-gray-500 mt-1 text-sm">{business.category} · {business.city}, {business.state}</p>
            </div>
            {business.is_lao_owned && (
              <span style={{ backgroundColor: '#f0f9f4', color: '#2d5a3d' }} className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                Lao Owned
              </span>
            )}
          </div>

          {business.description && (
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">{business.description}</p>
          )}

          <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
            {business.address && (
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">Address</span>
                <span className="text-gray-600 text-sm">{business.address}, {business.city}, {business.state} {business.zip}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">Phone</span>
                <a href={'tel:' + business.phone} style={{ color: '#2d5a3d' }} className="hover:underline text-sm">{business.phone}</a>
              </div>
            )}
            {business.website && (
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">Website</span>
                <a href={business.website} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline text-sm break-all">{business.website}</a>
              </div>
            )}
            {business.google_url && (
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">Google Maps</span>
                <a href={business.google_url} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline text-sm">View on Google Maps</a>
              </div>
            )}
            {business.instagram && (
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">Instagram</span>
                <a href={'https://instagram.com/' + business.instagram.replace('@', '')} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline text-sm">@{business.instagram.replace('@', '')}</a>
              </div>
            )}
            {business.facebook && (
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">Facebook</span>
                <a href={business.facebook} target="_blank" style={{ color: '#2d5a3d' }} className="hover:underline text-sm break-all">{business.facebook}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
