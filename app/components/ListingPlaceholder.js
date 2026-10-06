import {
  ForkKnife, Storefront, Bed, Stethoscope, Sparkle, HardHat, Briefcase,
  CalendarHeart, Car, GraduationCap, HandHeart, Monitor, DotsThreeCircle,
} from '@phosphor-icons/react/dist/ssr'
import { categoryColor, typeLabel } from '../../lib/categories'

const CATEGORY_ICONS = {
  'Food & Beverage': ForkKnife,
  'Retail': Storefront,
  'Hospitality & Lodging': Bed,
  'Healthcare': Stethoscope,
  'Beauty & Wellness': Sparkle,
  'Home & Construction': HardHat,
  'Professional Services': Briefcase,
  'Events & Entertainment': CalendarHeart,
  'Automotive': Car,
  'Education & Childcare': GraduationCap,
  'Community & Faith': HandHeart,
  'Technology & Media': Monitor,
  'Other': DotsThreeCircle,
}

// Woven motif: nested stepped diamonds on a thread grid, drawn at half scale (60px repeat),
// drawn tone-on-tone so it reads as texture behind the icon.
const MOTIF = 'M10 60h5v5h-5zM15 55h5v5h-5zM15 65h5v5h-5zM20 50h5v5h-5zM20 70h5v5h-5zM25 45h5v5h-5zM25 60h5v5h-5zM25 75h5v5h-5zM30 40h5v5h-5zM30 55h5v5h-5zM30 65h5v5h-5zM30 80h5v5h-5zM35 35h5v5h-5zM35 50h5v5h-5zM35 70h5v5h-5zM35 85h5v5h-5zM40 30h5v5h-5zM40 45h5v5h-5zM40 60h5v5h-5zM40 75h5v5h-5zM40 90h5v5h-5zM45 25h5v5h-5zM45 40h5v5h-5zM45 55h5v5h-5zM45 65h5v5h-5zM45 80h5v5h-5zM45 95h5v5h-5zM50 20h5v5h-5zM50 35h5v5h-5zM50 50h5v5h-5zM50 70h5v5h-5zM50 85h5v5h-5zM50 100h5v5h-5zM55 15h5v5h-5zM55 30h5v5h-5zM55 45h5v5h-5zM55 60h5v5h-5zM55 75h5v5h-5zM55 90h5v5h-5zM55 105h5v5h-5zM60 10h5v5h-5zM60 25h5v5h-5zM60 40h5v5h-5zM60 55h5v5h-5zM60 60h5v5h-5zM60 65h5v5h-5zM60 80h5v5h-5zM60 95h5v5h-5zM60 110h5v5h-5zM65 15h5v5h-5zM65 30h5v5h-5zM65 45h5v5h-5zM65 60h5v5h-5zM65 75h5v5h-5zM65 90h5v5h-5zM65 105h5v5h-5zM70 20h5v5h-5zM70 35h5v5h-5zM70 50h5v5h-5zM70 70h5v5h-5zM70 85h5v5h-5zM70 100h5v5h-5zM75 25h5v5h-5zM75 40h5v5h-5zM75 55h5v5h-5zM75 65h5v5h-5zM75 80h5v5h-5zM75 95h5v5h-5zM80 30h5v5h-5zM80 45h5v5h-5zM80 60h5v5h-5zM80 75h5v5h-5zM80 90h5v5h-5zM85 35h5v5h-5zM85 50h5v5h-5zM85 70h5v5h-5zM85 85h5v5h-5zM90 40h5v5h-5zM90 55h5v5h-5zM90 65h5v5h-5zM90 80h5v5h-5zM95 45h5v5h-5zM95 60h5v5h-5zM95 75h5v5h-5zM100 50h5v5h-5zM100 70h5v5h-5zM105 55h5v5h-5zM105 65h5v5h-5zM110 60h5v5h-5zM110 0h5v5h-5zM115 115h5v5h-5zM115 5h5v5h-5zM0 110h5v5h-5zM0 0h5v5h-5zM0 10h5v5h-5zM5 115h5v5h-5zM5 5h5v5h-5zM10 0h5v5h-5z'

function Weave({ id }) {
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse" x="50%" y="50%" patternTransform="translate(-31.25 -31.25) scale(0.5)">
          <path d={MOTIF} fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.11" />
    </svg>
  )
}

// Shown in place of a photo: category color, woven motif, and a solid category icon in a disc.
// `size`: 'card' (listing cards) or 'banner' (top of a listing page)
export default function ListingPlaceholder({ biz, size = 'card' }) {
  const Icon = CATEGORY_ICONS[biz.category] || Storefront
  const color = categoryColor(biz.category)
  const banner = size === 'banner'
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: color }}
      role="img"
      aria-label={`${biz.name}: ${typeLabel(biz) || biz.category}`}
    >
      <Weave id={`weave-${biz.id}-${size}`} />
      <div
        className={'relative rounded-full flex items-center justify-center ' + (banner ? 'w-24 h-24' : 'w-[72px] h-[72px]')}
        style={{ backgroundColor: color, boxShadow: '0 0 0 1px rgba(255,255,255,0.18)' }}
      >
        <Icon size={banner ? 44 : 34} weight="fill" color="#fff" aria-hidden="true" />
      </div>
    </div>
  )
}
