'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { US_STATES } from '../../lib/states'

// Monthly email signup. Stored in the subscribers table; visitors can add an email but never read the list.
export default function EmailSignup({ source = 'footer' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [company, setCompany] = useState('') // honeypot: hidden from people, bots fill it
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (company) return setStatus('done')
    setStatus('sending')
    const { error } = await supabase.from('subscribers').insert([{
      name: name.trim().replace(/\s+/g, ' ') || null,
      email: email.trim().toLowerCase(),
      state: state || null,
      source,
    }])
    // 23505 = already subscribed; treat it as success so we don't reveal who is on the list
    setStatus(!error || error.code === '23505' ? 'done' : 'error')
  }

  if (status === 'done') {
    return (
      <p className="text-sm text-white/90" role="status">
        {name.trim() ? `Thanks, ${name.trim().split(' ')[0]}! ` : ''}You're on the list. Look out for our next email. Khop jai! 🙏
      </p>
    )
  }

  const field = 'rounded-full px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gold'
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      <label className="sr-only" htmlFor={`signup-name-${source}`}>Your name</label>
      <input
        id={`signup-name-${source}`}
        type="text"
        required
        autoComplete="given-name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={field + ' min-w-0'}
      />
      <label className="sr-only" htmlFor={`signup-email-${source}`}>Email address</label>
      <input
        id={`signup-email-${source}`}
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        className={field + ' min-w-0'}
      />
      <label className="sr-only" htmlFor={`signup-state-${source}`}>State (optional)</label>
      <select
        id={`signup-state-${source}`}
        value={state}
        onChange={(e) => setState(e.target.value)}
        className={field}
      >
        <option value="">State (optional)</option>
        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-gold text-gold-ink font-semibold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition whitespace-nowrap disabled:opacity-60"
      >
        {status === 'sending' ? 'Signing up…' : 'Sign up'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-white/90 sm:col-span-2" role="alert">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
