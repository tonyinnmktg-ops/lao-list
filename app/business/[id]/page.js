'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { categoryHref, stateHref, subcategoryHref, typeLabel } from '../../../lib/categories'
import BusinessCard from '../../components/BusinessCard'
import ListingPlaceholder from '../../components/ListingPlaceholder'

const GREEN = '#2d5a3d'

export default function BusinessPage() {
  const params = useParams()
  const [business, setBusiness] = useState(null)
  const [nearby, setNearby] = useState([])
  const [nearbyScope, setNearbyScope] = useState('state') // 'state' | 'national'
  const [otherInState, setOtherInState] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', params.id)
        .single()
      if (!data) return
      setBusiness(data)
      loadDiscovery(data)
    }
    if (params.id) load()
  }, [params.id])

  async function loadDiscovery(biz) {
    const base = () =>
      supabase
        .from('businesses')
        .select('*')
        .eq('status', 'active')
        .neq('id', biz.id)
        .order('photo_url', { ascending: true, nullsFirst: false })
        .order('rating', { ascending: false, nullsFirst: false })

    // 1. Same category, same state. Fall back to same category anywhere if the state is thin.
    // Pull a wider pool, then put same-subcategory matches first
    const rank = (list) =>
      [...list]
        .sort((a, b) => (b.subcategory === biz.subcategory) - (a.subcategory === biz.subcategory))
        .slice(0, 6)
    let same = []
    if (biz.state) {
      const { data } = await base().eq('category', biz.category).eq('state', biz.state).limit(30)
      same = data || []
    }
    if (same.length < 3) {
      const { data } = await base().eq('category', biz.category).limit(30)
      setNearbyScope('national')
      setNearby(rank(data || []))
    } else {
      setNearbyScope('state')
      setNearby(rank(same))
    }

    // 2. Other categories in the same state
    if (biz.state) {
      const { data } = await base().eq('state', biz.state).neq('category', biz.category).limit(3)
      setOtherInState(data || [])
    }
  }

  if (!business) return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  const address = business.address
    ? `${business.address}, ${business.city}, ${business.state} ${business.zip || ''}`.trim()
    : business.formatted_address

  const mapsUrl =
    business.google_url ||
    (business.place_id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}&query_place_id=${business.place_id}`
      : null)

  return (
    <main>
      {business.photo_url ? (
        <div className="w-full h-64 overflow-hidden relative">
          <img
            src={business.photo_url.replace('w408', 'w1200')}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
      ) : (
        <div className="w-full h-44">
          <ListingPlaceholder biz={business} size="banner" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-sm font-medium">
          {business.category && (
            <a href={categoryHref(business.category)} className="inline-flex items-center gap-1" style={{ color: GREEN }}>
              <span aria-hidden>←</span> Back to all {business.category}
            </a>
          )}
          <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
        </div>

        {business.status === 'closed' && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This business has been reported as permanently closed.
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {business.category} · {[business.city, business.state].filter(Boolean).join(', ') || 'Nationwide'}
                {business.rating && <> · <span className="text-gold">★</span> {business.rating}</>}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {business.category && (
                  <a href={categoryHref(business.category)} className="text-xs font-medium px-3 py-1 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50">
                    {business.category}
                  </a>
                )}
                {business.subcategory && (
                  <a
                    href={subcategoryHref(business.category, business.subcategory)}
                    className="text-xs font-medium px-3 py-1 rounded-full hover:opacity-80 bg-teal-tint text-teal-ink"
                  >
                    {typeLabel(business)}
                  </a>
                )}
              </div>
            </div>
            {business.is_lao_owned && (
              <span className="bg-lao-red text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                Lao Owned
              </span>
            )}
          </div>

          {business.description && (
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">{business.description}</p>
          )}

          <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
            {address && (
              <Row label="Address">
                <span className="text-gray-600 text-sm">{address}</span>
              </Row>
            )}
            {business.phone && (
              <Row label="Phone">
                <a href={'tel:' + business.phone} style={{ color: GREEN }} className="hover:underline text-sm">{business.phone}</a>
              </Row>
            )}
            {business.website && (
              <Row label="Website">
                <a href={business.website} target="_blank" rel="noopener" style={{ color: GREEN }} className="hover:underline text-sm break-all">{business.website}</a>
              </Row>
            )}
            {mapsUrl && (
              <Row label="Google Maps">
                <a href={mapsUrl} target="_blank" rel="noopener" style={{ color: GREEN }} className="hover:underline text-sm">View on Google Maps</a>
              </Row>
            )}
            {business.instagram && (
              <Row label="Instagram">
                <a href={'https://instagram.com/' + business.instagram.replace('@', '')} target="_blank" rel="noopener" style={{ color: GREEN }} className="hover:underline text-sm">@{business.instagram.replace('@', '')}</a>
              </Row>
            )}
            {business.facebook && (
              <Row label="Facebook">
                <a href={business.facebook} target="_blank" rel="noopener" style={{ color: GREEN }} className="hover:underline text-sm break-all">{business.facebook}</a>
              </Row>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-right">
          Something wrong or missing?{' '}
          <a href={'/business/' + business.id + '/edit'} className="font-medium hover:underline" style={{ color: GREEN }}>
            Suggest an edit
          </a>
        </p>
      </div>

      {(nearby.length > 0 || otherInState.length > 0) && (
        <div className="max-w-5xl mx-auto px-4 pb-16">
          {nearby.length > 0 && (
            <DiscoverSection
              title={
                nearbyScope === 'state'
                  ? `Discover more ${business.category} in ${business.state}`
                  : `Discover more ${business.category}`
              }
              href={nearbyScope === 'state' ? stateHref(business.state, business.category) : categoryHref(business.category)}
              items={nearby}
            />
          )}
          {otherInState.length > 0 && (
            <DiscoverSection
              title={`More Lao businesses in ${business.state}`}
              href={stateHref(business.state)}
              items={otherInState}
            />
          )}
        </div>
      )}
    </main>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3">
      <span className="font-semibold text-gray-700 text-sm sm:w-28 shrink-0">{label}</span>
      {children}
    </div>
  )
}

function DiscoverSection({ title, href, items }) {
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <a href={href} className="text-sm font-medium whitespace-nowrap" style={{ color: GREEN }}>
          See all →
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((b) => (
          <BusinessCard key={b.id} biz={b} />
        ))}
      </div>
    </section>
  )
}
