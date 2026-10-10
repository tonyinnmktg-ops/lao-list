const GREEN = '#2d5a3d'

const OPTIONS = [
  {
    href: '/submit',
    title: 'A business',
    body: 'A Lao-owned or Lao-inspired restaurant, shop, service, nonprofit or temple.',
    cta: 'Add a business',
  },
  {
    href: '/events/submit',
    title: 'An event',
    body: 'A festival, temple celebration, pop-up, fundraiser or community gathering.',
    cta: 'Add an event',
  },
  {
    href: 'mailto:laolistapp@gmail.com?subject=Resource%20suggestion',
    title: 'A resource',
    body: 'A scholarship, legal clinic, health service or program that helps Lao Americans.',
    cta: 'Suggest by email',
  },
]

export const metadata = { title: 'Add to LaoList' }

export default function AddPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">Add to LaoList</h1>
      <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
        LaoList grows through the community. Adding something is free and takes a couple of minutes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {OPTIONS.map((o) => (
          <a key={o.href} href={o.href} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition flex flex-col">
            <h2 className="text-xl font-bold text-gray-900">{o.title}</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed flex-1">{o.body}</p>
            <span className="text-sm font-semibold mt-5" style={{ color: GREEN }}>{o.cta} →</span>
          </a>
        ))}
      </div>
    </main>
  )
}
