import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2d5a3d' }} className="mt-16 px-6 pt-14 pb-12 text-white rounded-t-[2rem] md:rounded-t-[2.75rem]">
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
            <li><Link href="/?category=Food%20%26%20Beverage" className="hover:opacity-100">Food &amp; Beverage</Link></li>
            <li><Link href="/?category=Community%20%26%20Faith" className="hover:opacity-100">Community &amp; Faith</Link></li>
            <li><Link href="/?category=Retail" className="hover:opacity-100">Retail</Link></li>
            <li><Link href="/?category=Services" className="hover:opacity-100">Services</Link></li>
            <li><Link href="/?category=Technology%20%26%20Media" className="hover:opacity-100">Technology &amp; Media</Link></li>
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
        <span>© {new Date().getFullYear()} LaoList. All rights reserved.</span>
        <span>Made with ♥ for the Lao community</span>
      </div>
    </footer>
  )
}
