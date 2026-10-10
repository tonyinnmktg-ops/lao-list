// Event types. `value` must match events.type exactly.
export const EVENT_TYPES = [
  { value: 'Festival & Holiday', blurb: 'Pi Mai Lao, Boun festivals, temple celebrations' },
  { value: 'Food Pop-up', blurb: 'Dinner pop-ups, food trucks, night markets' },
  { value: 'Community & Nonprofit', blurb: 'Fundraisers, workshops, meetings, youth programs' },
  { value: 'Arts & Nightlife', blurb: 'Concerts, parties, dance and film nights' },
]

// Today's date as YYYY-MM-DD in US Central time, so an event stays "upcoming" through its last day
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date())
}

// Supabase filter for events that haven't ended yet
export function upcomingFilter(today = todayISO()) {
  return `end_date.gte.${today},and(end_date.is.null,start_date.gte.${today})`
}

function parseDate(d) {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

const fmt = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts })

// "Sat, Nov 7" / "Sat, Nov 7, 2027" when not this year
export function formatDate(d, { weekday = true } = {}) {
  const date = parseDate(d)
  const sameYear = date.getUTCFullYear() === new Date().getFullYear()
  return fmt({ ...(weekday && { weekday: 'short' }), month: 'short', day: 'numeric', ...(!sameYear && { year: 'numeric' }) }).format(date)
}

// "6:00 PM" from "18:00" or "18:00:00"
export function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`
}

// One line for cards: "Sat, Nov 7 · 10 AM–3 PM" or "Dec 31 – Jan 1"
export function formatWhen(e) {
  const multiDay = e.end_date && e.end_date !== e.start_date
  const dates = multiDay
    ? `${formatDate(e.start_date)} – ${formatDate(e.end_date)}`
    : formatDate(e.start_date)
  const times = e.start_time
    ? formatTime(e.start_time) + (e.end_time && !multiDay ? `–${formatTime(e.end_time)}` : '')
    : ''
  return [dates, times].filter(Boolean).join(' · ')
}

// Month and day for the date badge
export function dateBadge(d) {
  const date = parseDate(d)
  return {
    month: fmt({ month: 'short' }).format(date).toUpperCase(),
    day: date.getUTCDate(),
  }
}

export function eventPlace(e) {
  if (e.is_online) return 'Online'
  return [e.city, e.state].filter(Boolean).join(', ')
}
