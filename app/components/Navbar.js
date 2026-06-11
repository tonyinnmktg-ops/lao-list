import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">Lao List</Link>
      <div className="flex gap-6">
        <Link href="/" className="hover:underline">Directory</Link>
        <Link href="/submit" className="hover:underline">Submit a Business</Link>
      </div>
    </nav>
  )
}
