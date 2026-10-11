// Round profile photo for artists and creators, with an initials fallback
export default function Avatar({ person, size = 56 }) {
  const initials = (person.name || '?')
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, '')[0] || '')
    .join('')
    .toUpperCase()
  const style = { width: size, height: size, minWidth: size }
  return person.avatar_url ? (
    <img
      src={person.avatar_url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="rounded-full object-cover bg-gray-100 border border-gray-100"
      style={style}
    />
  ) : (
    <span
      aria-hidden
      className="rounded-full bg-teal-tint text-teal-ink font-semibold flex items-center justify-center"
      style={{ ...style, fontSize: size * 0.36 }}
    >
      {initials || '?'}
    </span>
  )
}
