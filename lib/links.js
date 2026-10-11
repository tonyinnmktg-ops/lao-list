// Turn what people type (a URL, a bare domain or an @handle) into a working link for each platform
const hasScheme = (v) => /^https?:\/\//i.test(v)
const handle = (v) => v.trim().replace(/^@/, '').replace(/\/+$/, '')

export function toUrl(v) {
  if (!v) return null
  return hasScheme(v) ? v : 'https://' + v.replace(/^\/+/, '')
}

export function socialUrl(platform, v) {
  if (!v) return null
  const s = v.trim()
  if (hasScheme(s)) return s
  const domains = { instagram: 'instagram.com', facebook: 'facebook.com', tiktok: 'tiktok.com', youtube: 'youtube.com' }
  if (s.toLowerCase().includes(domains[platform])) return toUrl(s)
  const h = handle(s)
  if (platform === 'instagram') return 'https://instagram.com/' + h
  if (platform === 'facebook') return 'https://www.facebook.com/' + h
  if (platform === 'tiktok') return 'https://www.tiktok.com/@' + h
  if (platform === 'youtube') return 'https://www.youtube.com/@' + h
  return toUrl(s)
}

// What to show as the link text: "@handle" for social accounts, the address for websites
export function socialLabel(platform, v) {
  if (!v) return ''
  const s = v.trim()
  const m = s.match(/(?:instagram\.com|tiktok\.com|youtube\.com|facebook\.com)\/(@?[^/?#]+)/i)
  if (m) return '@' + m[1].replace(/^@/, '')
  if (!hasScheme(s) && !s.includes('.')) return '@' + handle(s)
  return s
}

export const PLATFORMS = [
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'website', label: 'Website' },
]
