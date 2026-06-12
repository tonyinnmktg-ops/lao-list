import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{ backgroundColor: '#2d5a3d' }} className="px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-white tracking-tight">
        Lao List
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-white text-sm font-medium hover:opacity-80 transition">
          Directory
        </Link>
        <Link href="/submit" style={{ backgroundColor: '#f0f9f4', color: '#2d5a3d' }} className="text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition">
          Submit a Business
        </Link>
      </div>
    </nav>
  )
}
