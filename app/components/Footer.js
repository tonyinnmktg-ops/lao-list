import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2d5a3d' }} className="mt-16 px-6 py-12 text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-2">Lao List</h2>
          <p className="text-white opacity-60 text-sm leading-relaxed">
            A community directory of Lao-owned and Lao-inspired businesses across the United States.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">Browse</h3>
          <ul className="flex flex-col gap-2 text-sm opacity-80">
            <li><Link href="/?category=restaurant" className="hover:opacity-100">Restaurants</Link></li>
            <li><Link href="/?category=nonprofit" className="hover:opacity-100">Nonprofits</Link></li>
            <li><Link href="/?category=service" className="hover:opacity-100">Services</Link></li>
            <li><Link href="/?category=retail" className="hover:opacity-100">Retail</Link></li>
            <li><Link href="/?category=other" className="hover:opacity-100">Other</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">Community</h3>
          <ul className="flex flex-col gap-2 text-sm opacity-80">
            <li><Link href="/submit" className="hover:opacity-100">Submit a Business</Link></li>
            <li><a href="mailto:hello@laolist.com" className="hover:opacity-100">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">Follow Us</h3>
          <ul className="flex flex-col gap-2 text-sm opacity-80">
            <li><a href="https://instagram.com" target="_blank" className="hover:opacity-100">Instagram</a></li>
            <li><a href="https://facebook.com" target="_blank" className="hover:opacity-100">Facebook</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white border-opacity-20 text-xs text-white opacity-40 flex justify-between">
        <span>© {new Date().getFullYear()} Lao List. All rights reserved.</span>
        <span>Made with ♥ for the Lao community</span>
      </div>
    </footer>
  )
}
