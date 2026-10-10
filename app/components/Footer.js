import Link from 'next/link'
import { categoryHref } from '../../lib/categories'
import EmailSignup from './EmailSignup'

const FOOTER_CATEGORIES = ['Food & Beverage', 'Retail', 'Professional Services', 'Healthcare', 'Home & Construction', 'Community & Faith']

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2d5a3d' }} className="mt-16 px-6 pt-14 pb-12 text-white rounded-t-[2rem] md:rounded-t-[2.75rem]">
      <div className="max-w-5xl mx-auto mb-12 pb-12 border-b border-white/20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Stay in the loop</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            New Lao businesses, community events and resources, in your inbox about once a month. No spam, and we never sell your email.
          </p>
        </div>
        <EmailSignup source="footer" />
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

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
            <li><Link href="/events" className="hover:opacity-100">Events</Link></li>
            <li><Link href="/resources" className="hover:opacity-100">Resources</Link></li>
            <li><Link href="/submit" className="hover:opacity-100">Submit a Business</Link></li>
            <li><Link href="/events/submit" className="hover:opacity-100">Submit an Event</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">Contact</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            For more information, email{' '}
            <a href="mailto:laolistapp@gmail.com" className="underline underline-offset-2 hover:opacity-100 whitespace-nowrap">laolistapp@gmail.com</a>
          </p>
        </div>

      </div>

      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white border-opacity-20 text-xs text-white">
        <p className="opacity-50 leading-relaxed mb-4">
          Disclaimer: LaoList is a community-maintained directory. Listing details come from public sources and community
          submissions; LaoList does not own this information and cannot guarantee that it is accurate or current. LaoList does not sell listing data or any information you submit. Please
          confirm details directly with each business. Business owners may request that their listing be updated or removed
          at any time by emailing{' '}
          <a href="mailto:laolistapp@gmail.com" className="underline underline-offset-2">laolistapp@gmail.com</a>.
        </p>
        <div className="opacity-40 flex flex-col sm:flex-row gap-1 sm:justify-between">
          <span>© {new Date().getFullYear()} LaoList. All rights reserved.</span>
          <span>Made with ♥ for the Lao community</span>
        </div>
      </div>
    </footer>
  )
}
