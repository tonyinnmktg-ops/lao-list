import {
  Utensils, Store, Hotel, Stethoscope, Sparkles, HardHat, Briefcase,
  CalendarHeart, Car, GraduationCap, HeartHandshake, Monitor, Ellipsis,
} from 'lucide-react'
import { categoryColor, typeLabel } from '../../lib/categories'

const CATEGORY_ICONS = {
  'Food & Beverage': Utensils,
  'Retail': Store,
  'Hospitality & Lodging': Hotel,
  'Healthcare': Stethoscope,
  'Beauty & Wellness': Sparkles,
  'Home & Construction': HardHat,
  'Professional Services': Briefcase,
  'Events & Entertainment': CalendarHeart,
  'Automotive': Car,
  'Education & Childcare': GraduationCap,
  'Community & Faith': HeartHandshake,
  'Technology & Media': Monitor,
  'Other': Ellipsis,
}

// Shown in place of a photo: a solid category-colored tile with the category icon.
// `size`: 'card' (listing cards) or 'banner' (top of a listing page)
export default function ListingPlaceholder({ biz, size = 'card' }) {
  const Icon = CATEGORY_ICONS[biz.category] || Store
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: categoryColor(biz.category) }}
      role="img"
      aria-label={`${biz.name}: ${typeLabel(biz) || biz.category}`}
    >
      <Icon size={size === 'banner' ? 44 : 36} strokeWidth={1.4} color="#fff" className="opacity-90" aria-hidden="true" />
    </div>
  )
}
