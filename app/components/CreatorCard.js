import { typeLabel } from '../../lib/categories'
import { PLATFORMS, socialUrl, toUrl } from '../../lib/links'
import Avatar from './Avatar'

const GREEN = '#2d5a3d'
const TYPE_LABEL = { 'Content Creators': 'Content creator', 'Visual Artists': 'Visual artist', 'Performing Artists': 'Performing artist' }

export default function CreatorCard({ creator }) {
  const links = PLATFORMS.filter((p) => creator[p.key])
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <a href={'/business/' + creator.id} tabIndex={-1} aria-hidden>
          <Avatar person={creator} size={56} />
        </a>
        <div className="min-w-0">
          {typeLabel(creator) && (
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1 bg-teal-tint text-teal-ink">
              {typeLabel(creator)}
            </span>
          )}
          <a href={'/business/' + creator.id} className="hover:underline">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">{creator.name}</h3>
          </a>
          <p className="text-xs text-gray-500 mt-0.5">
            {[TYPE_LABEL[creator.category], [creator.city, creator.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      {creator.description && <p className="text-sm text-gray-600 mt-2 line-clamp-3 flex-1">{creator.description}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {links.map((p) => (
            <a
              key={p.key}
              href={p.key === 'website' ? toUrl(creator.website) : socialUrl(p.key, creator[p.key])}
              target="_blank"
              rel="noopener"
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition"
              style={{ color: GREEN }}
            >
              {p.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
