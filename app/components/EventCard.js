import { dateBadge, formatWhen, eventPlace } from '../../lib/events'

export default function EventCard({ event }) {
  const { month, day } = dateBadge(event.start_date)
  return (
    <a
      href={'/events/' + event.id}
      className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition"
    >
      <div className="shrink-0 w-14 h-16 rounded-lg bg-leaf-tint text-leaf flex flex-col items-center justify-center">
        <span className="text-[11px] font-semibold tracking-wide">{month}</span>
        <span className="text-2xl font-bold leading-none mt-0.5">{day}</span>
      </div>
      <div className="min-w-0">
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 bg-teal-tint text-teal-ink">
          {event.type}
        </span>
        <h3 className="text-base font-semibold text-gray-900 leading-snug">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{formatWhen(event)}</p>
        <p className="text-sm text-gray-500">{[event.venue_name, eventPlace(event)].filter(Boolean).join(' · ')}</p>
      </div>
    </a>
  )
}
