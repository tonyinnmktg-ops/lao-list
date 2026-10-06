import Link from 'next/link'
import { categoryHref } from '../../lib/categories'

const FOOTER_CATEGORIES = ['Food & Beverage', 'Retail', 'Professional Services', 'Healthcare', 'Home & Construction', 'Community & Faith']

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2d5a3d' }} className="mt-16 px-6 pt-14 pb-12 text-white rounded-t-[2rem] md:rounded-t-[2.75rem]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-2">LaoList</h2>
          <p className="text-white opacity-60 text-sm leading-relaxed">
            A community directory of Lao-owned and Lao-inspired businesses across the United States.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">Browse</h3>
          <ul className="flex flex-col gap-2 text-sm opacity-80">
            {FOOTER_CATEGORIES.map((c) => (
              <li key={c}><Link href={categoryHref(c)} className="hover:opacity-100">{c}</Link></li>
            ))}
            <li><Link href="/#categories" className="hover:opacity-100">All categories</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">Community</h3>
          <ul className="flex flex-col gap-2 text-sm opacity-80">
            <li><Link href="/submit" className="hover:opacity-100">Submit a Business</Link></li>
            <li><a href="mailto:laolistapp@gmail.com" className="hover:opacity-100">Contact Us</a></li>
            <li><a href="mailto:laolistapp@gmail.com" className="hover:opacity-100 break-all">laolistapp@gmail.com</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white border-opacity-20 text-xs text-white opacity-40 flex justify-between">
        <span>© {new Date().getFullYear()} LaoList. All rights reserved.</span>
        <span>Made with ♥ for the Lao community</span>
      </div>
    </footer>
  )
}
