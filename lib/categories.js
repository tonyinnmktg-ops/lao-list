// Single source of truth for the taxonomy. `value` must match businesses.category exactly.
// Naming rule: "&" when the words describe one field or a business usually does both;
// "/" when a business is one or the other, or the words are alternative names.
// Categories without a photo show a colored tile; `color` also tints listing placeholders.
export const CATEGORIES = [
  { label: 'Food & Beverage', value: 'Food & Beverage', image: '/images/lao-restaurant.jpg', color: '#2d5a3d' },
  { label: 'Retail', value: 'Retail', image: '/images/lao-retail.webp', color: '#a3412f' },
  { label: 'Hospitality & Lodging', value: 'Hospitality & Lodging', image: '/images/lao-hospitality.jpg', color: '#2f8f8a' },
  { label: 'Healthcare', value: 'Healthcare', image: '/images/lao-healthcare.jpg', color: '#1f4e5f' },
  { label: 'Beauty & Wellness', value: 'Beauty & Wellness', image: '/images/lao-beauty.jpg', color: '#86385e' },
  { label: 'Home & Construction', value: 'Home & Construction', image: '/images/lao-home-construction.jpg', color: '#b0601f' },
  { label: 'Professional Services', value: 'Professional Services', image: '/images/lao-services.jpg', color: '#34466b' },
  { label: 'Events & Entertainment', value: 'Events & Entertainment', image: '/images/lao-events.jpg', color: '#b8862b' },
  { label: 'Automotive', value: 'Automotive', image: '/images/lao-automotive.jpg', color: '#3d4a52' },
  { label: 'Education & Childcare', value: 'Education & Childcare', image: '/images/lao-education.jpg', color: '#4f6b3a' },
  { label: 'Community & Faith', value: 'Community & Faith', image: '/images/lao-community.jpg', color: '#5a4a86' },
  { label: 'Technology & Media', value: 'Technology & Media', image: '/images/lao-tech-media.jpg', color: '#22344d' },
  { label: 'Other', value: 'Other', image: '/images/lao-other.jpg', color: '#6b6b66' },
]

export const OTHER = 'Other'

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

// Subcategories by category. Every list ends with "Other", which asks for a note.
export const SUBCATEGORIES = {
  'Food & Beverage': ['Full Service Restaurant', 'Fast Casual Restaurant', 'Food Truck / Pop-up', 'Cafe & Bakery', 'Bar / Nightclub', 'Catering', 'Food Manufacturer', OTHER],
  'Retail': ['Grocery / Market', 'Clothing & Apparel', 'Textiles', 'Jewelry', 'Gifts & Home Goods', 'Arts & Crafts', 'Electronics', OTHER],
  'Hospitality & Lodging': ['Hotel / Motel', 'Short-Term Rental', 'Bed and Breakfast', 'Travel Agency / Tours', OTHER],
  'Healthcare': ['Medical Practice', 'Dental', 'Pharmacy', 'Chiropractic / Physical Therapy', 'Home Health & Senior Care', 'Counseling & Mental Health', 'Traditional & Herbal Medicine', OTHER],
  'Beauty & Wellness': ['Hair Salon / Barber', 'Nail Salon', 'Spa & Massage', 'Makeup & Lashes', 'Fitness / Martial Arts', OTHER],
  'Home & Construction': ['General Contractor', 'Plumbing', 'HVAC', 'Electrical', 'Roofing', 'Remodeling / Handyman', 'Painting', 'Flooring & Tile', 'Landscaping & Lawn Care', 'Cleaning Services', 'Pest Control', OTHER],
  'Professional Services': ['Accounting & Tax', 'Legal & Immigration', 'Insurance', 'Real Estate', 'Mortgage & Lending', 'Financial Planning', 'Translation & Interpretation', 'Consulting', 'Staffing & Employment', OTHER],
  'Events & Entertainment': ['Event Planning & Coordination', 'Photography / Video', 'DJ / Live Music', 'Decor & Rentals', 'Event Venues', 'Baci & Ceremony Services', OTHER],
  'Automotive': ['Auto Repair', 'Auto Body & Paint', 'Car Sales', 'Tires / Detailing', 'Towing', OTHER],
  'Education & Childcare': ['Tutoring', 'Childcare / Daycare', 'Lao Language Classes', 'Music / Dance Lessons', 'Driving School', OTHER],
  'Community & Faith': ['Temple / Religious Institution', 'Nonprofit & Advocacy', 'Cultural Organization', 'Community Center', OTHER],
  'Technology & Media': ['Software / IT', 'Web & App Development', 'Marketing & Advertising', 'News & Publishing', 'Film & Video Production', 'Content Creators / Podcasts', OTHER],
  'Other': [],
}

// A note is required when the business is "Other" at either level
export function needsNote(category, subcategory) {
  return category === OTHER || subcategory === OTHER
}

// What to show as the business type tag: the note stands in for "Other"
export function typeLabel(biz) {
  if (needsNote(biz.category, biz.subcategory) && biz.category_note) return biz.category_note
  return biz.subcategory
}

export function categoryColor(category) {
  const match = CATEGORIES.find((c) => c.value === category)
  return (match && match.color) || '#2d5a3d'
}
