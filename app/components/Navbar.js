import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{ backgroundColor: '#2d5a3d' }} className="px-6 py-4 flex items-center justify-between">
      <a href="/" className="text-xl font-bold text-white tracking-tight">
        LaoList
      </a>
      <div className="flex items-center gap-6">
        <a href="/" style={{ color: 'white' }} className="text-sm font-medium hover:opacity-80 transition">
          Directory
        </a>
        <Link href="/submit" className="bg-gold text-gold-ink text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition">
          Submit a Business
        </Link>
      </div>
    </nav>
  )
}
