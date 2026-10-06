import { fallbackImage, typeLabel } from '../../lib/categories'

const GREEN = '#2d5a3d'

export default function BusinessCard({ biz, badge }) {
  return (
    <a
      href={'/business/' + biz.id}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 block hover:shadow-md transition"
    >
      <div className="h-40 overflow-hidden relative">
        <img
          src={biz.photo_url || fallbackImage(biz.category)}
          alt={biz.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-20" />
        {badge && (
          <span className="absolute top-3 left-3 bg-gold text-gold-ink text-xs font-semibold px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">
        {typeLabel(biz) && (
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 bg-teal-tint text-teal-ink"
          >
            {typeLabel(biz)}
          </span>
        )}
        <h3 className="text-base font-semibold text-gray-900">{biz.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {biz.category} · {[biz.city, biz.state].filter(Boolean).join(', ') || 'Nationwide'}
        </p>
        {biz.rating && <p className="text-sm text-gray-600 mt-1"><span className="text-gold">★</span> {biz.rating}</p>}
        {biz.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{biz.description}</p>
        )}
      </div>
    </a>
  )
}
