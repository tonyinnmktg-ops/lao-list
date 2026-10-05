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

// Subcategories in use, by category (matches businesses.subcategory)
export const SUBCATEGORIES = {
  'Food & Beverage': ['Full Service', 'Fast Casual', 'Grocery & Market', 'Catering', 'Cafe & Bakery', 'Food Production', 'Food Truck', 'Bar & Nightclub'],
  'Community & Faith': ['Nonprofit & Advocacy', 'Cultural Organization', 'Religious Institution'],
  'Retail': ['Grocery & Market', 'Clothing & Apparel', 'Beauty & Personal Care'],
  'Services': ['Legal & Immigration', 'Healthcare'],
  'Technology & Media': ['SaaS & Software', 'News & Publishing'],
}
