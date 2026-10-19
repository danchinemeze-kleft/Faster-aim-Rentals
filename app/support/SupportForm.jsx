'use client'

import { useState } from 'react'

const TOPICS = [
  'Payment or contact reveal problem',
  'Listing a property',
  'My account or login',
  'Report a scam or fake listing',
  'Subscription or billing',
  'Other',
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  topic: TOPICS[0],
  message: '',
  website: '', // honeypot: real people leave this empty
}

export default function SupportForm() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent'
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.message.trim().length < 10) {
      setError('Please describe your issue in a little more detail (at least 10 characters).')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not send your message.')
      setForm(emptyForm)
      setStatus('sent')
    } catch (err) {
      setError(
        (err?.message || 'Could not send your message.') +
          ' You can also call or email us using the details above.'
      )
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <div className="faim-sp-alert faim-sp-alert--ok">
        ✅ Thank you! Your message has been received. We will reply by email shortly.
        <div style={{ marginTop: '0.75rem' }}>
          <button type="button" className="faim-sp-submit" onClick={() => setStatus('idle')}>
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="faim-sp-form" noValidate={false}>
      {error && <div className="faim-sp-alert faim-sp-alert--error">{error}</div>}

      <div className="faim-sp-row">
        <div className="faim-sp-field">
          <label htmlFor="sp-name">Full name *</label>
          <input id="sp-name" name="name" type="text" value={form.name} onChange={handleChange}
            placeholder="Your name" required maxLength={100} autoComplete="name" />
        </div>
        <div className="faim-sp-field">
          <label htmlFor="sp-email">Email address *</label>
          <input id="sp-email" name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com" required maxLength={150} autoComplete="email" />
        </div>
      </div>

      <div className="faim-sp-row">
        <div className="faim-sp-field">
          <label htmlFor="sp-phone">Phone number <span style={{ fontWeight: 400, color: '#cccccc' }}>(optional)</span></label>
          <input id="sp-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
            placeholder="080XXXXXXXX" maxLength={20} autoComplete="tel" />
        </div>
        <div className="faim-sp-field">
          <label htmlFor="sp-topic">What is this about? *</label>
          <select id="sp-topic" name="topic" value={form.topic} onChange={handleChange}>
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="faim-sp-field">
        <label htmlFor="sp-message">Your message *</label>
        <textarea id="sp-message" name="message" rows={6} value={form.message} onChange={handleChange}
          placeholder="Describe the issue. If it is about a payment, include your payment reference. If it is about a listing, include the property title or link."
          required maxLength={3000} />
      </div>

      {/* Honeypot field, hidden from people */}
      <div className="faim-sp-hp" aria-hidden="true">
        <label htmlFor="sp-website">Website</label>
        <input id="sp-website" name="website" type="text" tabIndex={-1} autoComplete="off"
          value={form.website} onChange={handleChange} />
      </div>

      <button type="submit" className="faim-sp-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}