import {
  Soup, Truck, Coffee, Martini, ChefHat, Factory, Utensils,
  ShoppingBasket, Shirt, Scroll, Gem, Gift, Palette, Tv, Store,
  BedDouble, Hotel, Plane,
  Stethoscope, Pill, Activity, HeartPulse, Leaf, Hospital,
  Scissors, Sparkles, Brush, Dumbbell, Flower2,
  HardHat, Wrench, Wind, Zap, House, Hammer, PaintRoller, Grid3x3, Trees, SprayCan, Bug,
  Calculator, Scale, Shield, KeyRound, Landmark, PiggyBank, Languages, Lightbulb, Users, Briefcase,
  CalendarHeart, Camera, Music, Building2, HeartHandshake,
  Car, CarFront, Disc,
  GraduationCap, Baby, BookOpen, Piano, Signpost,
  Church, Theater,
  Monitor, Code, Megaphone, Newspaper, Film, Mic,
  Ellipsis,
} from 'lucide-react'
import { categoryColor, typeLabel } from '../../lib/categories'

// Icon per subcategory, falling back to one per category
const SUB_ICONS = {
  'Full Service Restaurant': Utensils, 'Fast Casual Restaurant': Soup, 'Food Truck / Pop-up': Truck,
  'Cafe & Bakery': Coffee, 'Bar / Nightclub': Martini, 'Catering': ChefHat, 'Food Manufacturer': Factory,
  'Grocery / Market': ShoppingBasket, 'Clothing & Apparel': Shirt, 'Textiles': Scroll, 'Jewelry': Gem,
  'Gifts & Home Goods': Gift, 'Arts & Crafts': Palette, 'Electronics': Tv,
  'Hotel / Motel': Hotel, 'Short-Term Rental': BedDouble, 'Bed and Breakfast': BedDouble, 'Travel Agency / Tours': Plane,
  'Medical Practice': Stethoscope, 'Dental': Hospital, 'Pharmacy': Pill, 'Chiropractic / Physical Therapy': Activity,
  'Home Health & Senior Care': HeartPulse, 'Counseling & Mental Health': HeartHandshake, 'Traditional & Herbal Medicine': Leaf,
  'Hair Salon / Barber': Scissors, 'Nail Salon': Sparkles, 'Spa & Massage': Flower2, 'Makeup & Lashes': Brush, 'Fitness / Martial Arts': Dumbbell,
  'General Contractor': HardHat, 'Plumbing': Wrench, 'HVAC': Wind, 'Electrical': Zap, 'Roofing': House,
  'Remodeling / Handyman': Hammer, 'Painting': PaintRoller, 'Flooring & Tile': Grid3x3, 'Landscaping & Lawn Care': Trees,
  'Cleaning Services': SprayCan, 'Pest Control': Bug,
  'Accounting & Tax': Calculator, 'Legal & Immigration': Scale, 'Insurance': Shield, 'Real Estate': KeyRound,
  'Mortgage & Lending': Landmark, 'Financial Planning': PiggyBank, 'Translation & Interpretation': Languages,
  'Consulting': Lightbulb, 'Staffing & Employment': Users,
  'Event Planning & Coordination': CalendarHeart, 'Photography / Video': Camera, 'DJ / Live Music': Music,
  'Decor & Rentals': Sparkles, 'Event Venues': Building2, 'Baci & Ceremony Services': Flower2,
  'Auto Repair': Wrench, 'Auto Body & Paint': PaintRoller, 'Car Sales': CarFront, 'Tires / Detailing': Disc, 'Towing': Truck,
  'Tutoring': BookOpen, 'Childcare / Daycare': Baby, 'Lao Language Classes': Languages, 'Music / Dance Lessons': Piano, 'Driving School': Signpost,
  'Temple / Religious Institution': Church, 'Nonprofit & Advocacy': HeartHandshake, 'Cultural Organization': Theater, 'Community Center': Users,
  'Software / IT': Monitor, 'Web & App Development': Code, 'Marketing & Advertising': Megaphone,
  'News & Publishing': Newspaper, 'Film & Video Production': Film, 'Content Creators / Podcasts': Mic,
}
const CATEGORY_ICONS = {
  'Food & Beverage': Utensils, 'Retail': Store, 'Hospitality & Lodging': Hotel, 'Healthcare': Stethoscope,
  'Beauty & Wellness': Sparkles, 'Home & Construction': HardHat, 'Professional Services': Briefcase,
  'Events & Entertainment': CalendarHeart, 'Automotive': Car, 'Education & Childcare': GraduationCap,
  'Community & Faith': HeartHandshake, 'Technology & Media': Monitor, 'Other': Ellipsis,
}

const SKIP = new Set(['the', 'a', 'an', 'and', '&', 'of'])

function initials(name = '') {
  const words = name.replace(/\(.*?\)/g, '').split(/[\s\-/]+/).filter((w) => w && !SKIP.has(w.toLowerCase()))
  return words.slice(0, 2).map((w) => w.match(/[A-Za-z0-9]/)?.[0] || '').join('').toUpperCase() || '·'
}

// Woven diamond motif, drawn in white over the category color
function Weave({ id }) {
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M16 2 L30 16 L16 30 L2 16 Z" fill="none" stroke="#fff" strokeWidth="1.3" />
          <path d="M16 9 L23 16 L16 23 L9 16 Z" fill="none" stroke="#fff" strokeWidth="1.3" />
          <path d="M16 14 L18 16 L16 18 L14 16 Z" fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.12" />
    </svg>
  )
}

// Shown in place of a photo. `size`: 'card' (listing cards) or 'banner' (top of a listing page)
export default function ListingPlaceholder({ biz, size = 'card' }) {
  const Icon = SUB_ICONS[biz.subcategory] || CATEGORY_ICONS[biz.category] || Store
  const banner = size === 'banner'
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: categoryColor(biz.category) }}
      role="img"
      aria-label={`${biz.name}: ${typeLabel(biz) || biz.category}`}
    >
      <Weave id={`weave-${biz.id}-${size}`} />
      <div className="relative flex flex-col items-center text-white">
        <Icon size={banner ? 30 : 24} strokeWidth={1.6} className="opacity-85" aria-hidden="true" />
        <span className={(banner ? 'text-5xl' : 'text-4xl') + ' font-display font-semibold leading-none mt-2 tracking-tight'}>
          {initials(biz.name)}
        </span>
      </div>
    </div>
  )
}
