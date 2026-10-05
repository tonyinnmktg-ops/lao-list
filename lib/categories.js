// Single source of truth for categories. `value` must match businesses.category exactly.
export const CATEGORIES = [
  { label: 'Food & Beverage', value: 'Food & Beverage', image: '/images/lao-restaurant.jpg' },
  { label: 'Community & Faith', value: 'Community & Faith', image: '/images/lao-nonprofit.jpg' },
  { label: 'Retail', value: 'Retail', image: '/images/lao-retail.webp' },
  { label: 'Services', value: 'Services', image: '/images/lao-services.jpg' },
  { label: 'Technology & Media', value: 'Technology & Media', image: null },
]

export function categoryHref(category) {
  return '/?category=' + encodeURIComponent(category)
}

export function subcategoryHref(category, sub) {
  const p = new URLSearchParams()
  if (category) p.set('category', category)
  if (sub) p.set('sub', sub)
  return '/?' + p.toString()
}

export function stateHref(state, category) {
  const p = new URLSearchParams()
  if (category) p.set('category', category)
  if (state) p.set('state', state)
  return '/?' + p.toString()
}

// Generic photo when a business has none
export function fallbackImage(category) {
  const match = CATEGORIES.find((c) => c.value === category)
  return (match && match.image) || '/images/lao-restaurant.jpg'
}
