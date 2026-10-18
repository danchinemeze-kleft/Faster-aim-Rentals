'use client'

import { useState } from 'react'
import Link from 'next/link'
import GoBackButton from '../components/GoBackButton'
import Breadcrumb from '../components/Breadcrumb'

const PHONE_DISPLAY = '+234 803 285 1976'
const PHONE_TEL = '+2348032851976'
const WA_NUMBER = '2348032851976'
const EMAIL = 'info@fasteraim.com'

const TOPICS = [
  { id: 'listing', emoji: '🏡', label: 'Listing a property', hint: 'Tell us the property type, location and what you need help with.' },
  { id: 'rental', emoji: '🔍', label: 'Finding a rental', hint: 'Tell us the city, your budget and the type of place you want.' },
  { id: 'payment', emoji: '💳', label: 'Payment issues', hint: 'Include the email you paid with, the amount and the date.' },
  { id: 'bug', emoji: '🐛', label: 'Bug report', hint: 'Tell us the page, what you did and what went wrong.' },
  { id: 'partner', emoji: '🤝', label: 'Partnership', hint: 'Tell us about your company and what you have in mind.' },
  { id: 'ads', emoji: '📣', label: 'Advertising', hint: 'Tell us what you want to promote and where.' },
]

const ICONS = {
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
  mail: (<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>),
  pin: (<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>),
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  home: (<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>),
  send: (<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>),
}

function Icon({ name, size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', company: '' })
  const [topic, setTopic] = useState(TOPICS[0])
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const MAX = 1500

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function validate() {
    if (form.name.trim().length < 2) return 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address so we can reply.'
    if (form.message.trim().length < 10) return 'Write at least a short sentence about how we can help.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return
    const problem = validate()
    if (problem) {
      setError(problem)
      setStatus('error')
      return
    }
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, topic: topic.label }),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('sent')
    } catch {
      setError('Your message did not go through. Check your connection and try again, or use WhatsApp below.')
      setStatus('error')
    }
  }

  function reset() {
    setForm({ name: '', email: '', phone: '', message: '', company: '' })
    setStatus('idle')
    setError('')
  }

  const waText = `Hello Faster Aim, my name is ${form.name.trim() || '(your name)'}. Topic: ${topic.label}. ${form.message.trim()}`.trim()
  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`

  return (
    <div className="faim-contact-page">
      <div className="faim-wrap">
        <div className="faim-nav-row">
          <GoBackButton />
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }]} />
        </div>

        {/* Hero */}
        <section className="faim-hero">
          <span className="faim-live">
            <span className="faim-dot" />
            We reply within 24 hours on business days
          </span>
          <h1>Talk to a real person at Faster Aim</h1>
          <p className="faim-lead">
            Question, complaint or partnership idea? Call, message us on WhatsApp or use the form below.
          </p>
          <a href={`tel:${PHONE_TEL}`} className="faim-hero-phone">{PHONE_DISPLAY}</a>
          <div className="faim-hero-actions">
            <a href={`tel:${PHONE_TEL}`} className="faim-btn faim-btn--primary">
              <Icon name="phone" size={18} /> Call now
            </a>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="faim-btn faim-btn--wa"
            >
              <Icon name="chat" size={18} /> WhatsApp us
            </a>
            <a href={`mailto:${EMAIL}`} className="faim-btn faim-btn--ghost">
              <Icon name="mail" size={18} /> Email
            </a>
          </div>
        </section>

        <div className="faim-main">
          {/* Form */}
          <section className="faim-card faim-form-card" aria-labelledby="faim-form-title">
            {status === 'sent' ? (
              <div className="faim-success" role="status">
                <svg className="faim-check" viewBox="0 0 52 52" width="84" height="84" aria-hidden="true">
                  <circle className="faim-check-ring" cx="26" cy="26" r="24" fill="none" />
                  <path className="faim-check-tick" fill="none" d="M14 27l8 8 16-17" />
                </svg>
                <h2>Message sent</h2>
                <p>
                  Thanks, {form.name.trim().split(' ')[0]}. We will reply to <strong>{form.email.trim()}</strong> within 24 hours on business days.
                </p>
                <button type="button" className="faim-btn faim-btn--dark" onClick={reset}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2 id="faim-form-title">Send us a message</h2>
                <p className="faim-form-sub">Pick a topic so it reaches the right person first.</p>

                <div className="faim-chips" role="radiogroup" aria-label="Topic">
                  {TOPICS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={topic.id === t.id}
                      className={`faim-chip ${topic.id === t.id ? 'is-on' : ''}`}
                      onClick={() => setTopic(t)}
                    >
                      <span aria-hidden="true">{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>

                <div className="faim-row">
                  <div className="faim-field">
                    <label htmlFor="faim-name">Your name</label>
                    <input id="faim-name" name="name" type="text" autoComplete="name" value={form.name} onChange={update} placeholder="Daniel Okafor" required />
                  </div>
                  <div className="faim-field">
                    <label htmlFor="faim-email">Email</label>
                    <input id="faim-email" name="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={update} placeholder="you@example.com" required />
                  </div>
                </div>

                <div className="faim-field">
                  <label htmlFor="faim-phone">Phone or WhatsApp <span className="faim-opt">(optional)</span></label>
                  <input id="faim-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={update} placeholder="0803 000 0000" />
                </div>

                {/* Honeypot: real users never see or fill this */}
                <div className="faim-hp" aria-hidden="true">
                  <label htmlFor="faim-company">Company</label>
                  <input id="faim-company" name="company" type="text" tabIndex={-1} autoComplete="off" value={form.company} onChange={update} />
                </div>

                <div className="faim-field">
                  <label htmlFor="faim-message">Message</label>
                  <textarea id="faim-message" name="message" rows={6} maxLength={MAX} value={form.message} onChange={update} placeholder={topic.hint} required />
                  <span className="faim-count">{form.message.length}/{MAX}</span>
                </div>

                {status === 'error' && error && (
                  <div className="faim-error" role="alert">{error}</div>
                )}

                <button type="submit" className="faim-submit" disabled={status === 'sending'}>
                  {status === 'sending' ? (
                    <><span className="faim-spinner" /> Sending…</>
                  ) : (
                    <><Icon name="send" size={18} /> Send message</>
                  )}
                </button>

                <a href={waLink} target="_blank" rel="noopener noreferrer" className="faim-wa-alt">
                  <Icon name="chat" size={16} /> Prefer WhatsApp? Send this message there instead
                </a>
              </form>
            )}
          </section>

          {/* Side channels */}
          <aside className="faim-side" aria-label="Other ways to reach us">
            <h2 className="faim-side-title">Other ways to reach us</h2>

            <a href={`tel:${PHONE_TEL}`} className="faim-channel">
              <span className="faim-ico faim-ico--teal"><Icon name="phone" /></span>
              <span>
                <strong>Call</strong>
                <em>{PHONE_DISPLAY}</em>
              </span>
            </a>

            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="faim-channel">
              <span className="faim-ico faim-ico--green"><Icon name="chat" /></span>
              <span>
                <strong>WhatsApp</strong>
                <em>{PHONE_DISPLAY}</em>
              </span>
            </a>

            <a href={`mailto:${EMAIL}`} className="faim-channel">
              <span className="faim-ico faim-ico--pink"><Icon name="mail" /></span>
              <span>
                <strong>Email</strong>
                <em>{EMAIL}</em>
              </span>
            </a>

            <Link href="/search" className="faim-channel">
              <span className="faim-ico faim-ico--ink"><Icon name="home" /></span>
              <span>
                <strong>Mr. Rent AI</strong>
                <em>Get instant property help</em>
              </span>
            </Link>

            <div className="faim-channel faim-channel--static">
              <span className="faim-ico faim-ico--amber"><Icon name="pin" /></span>
              <span>
                <strong>Location</strong>
                <em>Awka, Anambra State, Nigeria</em>
              </span>
            </div>

            <div className="faim-legal">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/refund-policy">Refund Policy</Link>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .faim-contact-page {
          --fc-bg: var(--page-bg, #f0ede8);
          --fc-card: var(--card-bg, #ffffff);
          --fc-ink: var(--text-1, #080a0f);
          --fc-muted: var(--text-2, #5b6270);
          --fc-line: var(--border-2, #e3dfd8);
          --fc-accent: var(--accent, #14B8A6);
          --fc-glow: #0ef6cc;
          --fc-pink: #ec4899;
          --fc-dark: #080a0f;
          background: var(--fc-bg);
          color: var(--fc-ink);
          font-family: inherit;
          min-height: 100vh;
          padding: 24px 16px 72px;
        }
        .faim-contact-page *, .faim-contact-page *::before, .faim-contact-page *::after { box-sizing: border-box; }
        .faim-contact-page h1, .faim-contact-page h2, .faim-contact-page p { margin: 0; }
        .faim-wrap { max-width: 1040px; margin: 0 auto; }
        .faim-nav-row { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; margin-bottom: 18px; }

        /* Hero */
        .faim-hero {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border-radius: 24px;
          padding: 36px 24px;
          margin-bottom: 24px;
          color: #fff;
          background: linear-gradient(135deg, #080a0f 0%, #0a1a20 55%, #0b2a2b 100%);
          box-shadow: 0 24px 48px -24px rgba(8, 10, 15, 0.6);
        }
        .faim-hero::before, .faim-hero::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(64px);
          z-index: -1;
        }
        .faim-hero::before {
          width: 340px; height: 340px; top: -130px; right: -90px;
          background: rgba(14, 246, 204, 0.38);
          animation: faimDrift 12s ease-in-out infinite alternate;
        }
        .faim-hero::after {
          width: 280px; height: 280px; bottom: -120px; left: -70px;
          background: rgba(236, 72, 153, 0.3);
          animation: faimDrift 15s ease-in-out infinite alternate-reverse;
        }
        @keyframes faimDrift { to { transform: translate(-44px, 32px) scale(1.18); } }

        .faim-live {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 7px 14px;
          font-size: 0.8rem;
          color: #cfe9e5;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          backdrop-filter: blur(6px);
        }
        .faim-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: var(--fc-glow);
          box-shadow: 0 0 0 0 rgba(14, 246, 204, 0.7);
          animation: faimPulse 2s infinite;
          flex-shrink: 0;
        }
        @keyframes faimPulse {
          0% { box-shadow: 0 0 0 0 rgba(14, 246, 204, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(14, 246, 204, 0); }
          100% { box-shadow: 0 0 0 0 rgba(14, 246, 204, 0); }
        }
        .faim-hero h1 {
          font-size: clamp(1.9rem, 6vw, 3.1rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.025em;
          margin: 18px 0 12px;
          max-width: 18ch;
        }
        .faim-lead { color: #b9c6cf; line-height: 1.6; max-width: 52ch; margin-bottom: 20px; }
        .faim-hero-phone {
          display: inline-block;
          font-size: clamp(1.6rem, 7vw, 2.5rem);
          font-weight: 800;
          letter-spacing: 0.01em;
          text-decoration: none;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #0ef6cc, #9af7e8 60%, #f9a8d4);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .faim-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; }

        /* Buttons */
        .faim-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px;
          font: inherit; font-size: 0.92rem; font-weight: 700;
          text-decoration: none;
          border-radius: 12px;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .faim-btn:hover { transform: translateY(-2px); }
        .faim-btn:active { transform: translateY(0); }
        .faim-btn--primary { background: linear-gradient(135deg, #0ef6cc, #14B8A6); color: #04201c; box-shadow: 0 8px 22px -8px rgba(14, 246, 204, 0.8); }
        .faim-btn--wa { background: #25D366; color: #052e16; box-shadow: 0 8px 22px -8px rgba(37, 211, 102, 0.8); }
        .faim-btn--ghost { color: #fff; border-color: rgba(255, 255, 255, 0.28); background: rgba(255, 255, 255, 0.06); }
        .faim-btn--ghost:hover { background: rgba(255, 255, 255, 0.14); }
        .faim-btn--dark { background: var(--fc-dark); color: #fff; }

        /* Layout */
        .faim-main { display: grid; grid-template-columns: 1fr; gap: 24px; }
        .faim-card {
          background: var(--fc-card);
          border: 1px solid var(--fc-line);
          border-radius: 22px;
          padding: 24px 20px;
          box-shadow: 0 18px 40px -22px rgba(8, 10, 15, 0.28);
        }
        .faim-form-card h2 { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.01em; }
        .faim-form-sub { color: var(--fc-muted); margin: 6px 0 18px; font-size: 0.92rem; }

        /* Topic chips */
        .faim-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .faim-chip {
          font: inherit; font-size: 0.84rem; font-weight: 600;
          padding: 9px 14px;
          color: var(--fc-ink);
          background: var(--fc-bg);
          border: 1.5px solid transparent;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .faim-chip:hover { border-color: var(--fc-accent); }
        .faim-chip.is-on {
          color: #fff;
          background: var(--fc-dark);
          border-color: var(--fc-glow);
          box-shadow: 0 6px 18px -6px rgba(14, 246, 204, 0.7);
          transform: translateY(-1px);
        }

        /* Fields */
        .faim-row { display: grid; grid-template-columns: 1fr; gap: 0; }
        .faim-field { position: relative; margin-bottom: 16px; }
        .faim-field label { display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 7px; }
        .faim-opt { font-weight: 500; color: var(--fc-muted); }
        .faim-field input, .faim-field textarea {
          width: 100%;
          font: inherit; font-size: 16px;
          color: var(--fc-ink);
          padding: 13px 14px;
          background: rgba(127, 127, 127, 0.06);
          border: 1.5px solid var(--fc-line);
          border-radius: 12px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .faim-field textarea { resize: vertical; min-height: 140px; line-height: 1.5; }
        .faim-field input::placeholder, .faim-field textarea::placeholder { color: var(--fc-muted); opacity: 0.7; }
        .faim-field input:focus, .faim-field textarea:focus {
          outline: none;
          border-color: var(--fc-accent);
          background: var(--fc-card);
          box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2);
        }
        .faim-count { position: absolute; right: 12px; bottom: 10px; font-size: 0.72rem; color: var(--fc-muted); pointer-events: none; }
        .faim-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

        .faim-error {
          margin-bottom: 14px; padding: 12px 14px;
          font-size: 0.88rem; line-height: 1.45;
          color: #9f1239;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-left: 4px solid #e11d48;
          border-radius: 10px;
        }

        .faim-submit {
          position: relative; overflow: hidden;
          width: 100%;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          padding: 16px 20px;
          font: inherit; font-size: 1rem; font-weight: 800;
          color: #04201c;
          background: linear-gradient(135deg, #0ef6cc, #14B8A6);
          border: 0; border-radius: 14px;
          cursor: pointer;
          box-shadow: 0 14px 28px -12px rgba(20, 184, 166, 0.9);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .faim-submit::after {
          content: '';
          position: absolute; top: 0; bottom: 0; left: -60%;
          width: 40%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .faim-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 32px -12px rgba(20, 184, 166, 1); }
        .faim-submit:hover:not(:disabled)::after { left: 130%; }
        .faim-submit:disabled { opacity: 0.8; cursor: progress; }
        .faim-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 3px solid rgba(4, 32, 28, 0.25);
          border-top-color: #04201c;
          animation: faimSpin 0.7s linear infinite;
        }
        @keyframes faimSpin { to { transform: rotate(360deg); } }

        .faim-wa-alt {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 14px;
          font-size: 0.86rem; font-weight: 600;
          color: #15803d;
          text-decoration: none;
        }
        .faim-wa-alt:hover { text-decoration: underline; }

        /* Success */
        .faim-success { text-align: center; padding: 28px 8px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .faim-success h2 { font-size: 1.6rem; font-weight: 800; }
        .faim-success p { color: var(--fc-muted); line-height: 1.6; max-width: 40ch; margin-bottom: 8px; }
        .faim-success strong { color: var(--fc-ink); }
        .faim-check-ring { stroke: var(--fc-accent); stroke-width: 3; stroke-dasharray: 151; stroke-dashoffset: 151; animation: faimDraw 0.6s ease forwards; }
        .faim-check-tick { stroke: var(--fc-accent); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 40; stroke-dashoffset: 40; animation: faimDraw 0.4s 0.5s ease forwards; }
        @keyframes faimDraw { to { stroke-dashoffset: 0; } }

        /* Side column */
        .faim-side { display: flex; flex-direction: column; gap: 12px; }
        .faim-side-title { font-size: 1.05rem; font-weight: 800; margin-bottom: 2px; }
        .faim-channel {
          display: flex; align-items: center; gap: 14px;
          padding: 16px;
          color: var(--fc-ink);
          text-decoration: none;
          background: var(--fc-card);
          border: 1px solid var(--fc-line);
          border-radius: 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .faim-channel:hover { transform: translateY(-3px); border-color: var(--fc-accent); box-shadow: 0 14px 28px -16px rgba(8, 10, 15, 0.4); }
        .faim-channel--static:hover { transform: none; border-color: var(--fc-line); box-shadow: none; }
        .faim-channel strong { display: block; font-size: 0.95rem; }
        .faim-channel em { display: block; font-style: normal; font-size: 0.85rem; color: var(--fc-muted); margin-top: 2px; }
        .faim-ico { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 13px; }
        .faim-ico--teal { color: #0f766e; background: #ccfbf1; }
        .faim-ico--green { color: #15803d; background: #dcfce7; }
        .faim-ico--pink { color: #be185d; background: #fce7f3; }
        .faim-ico--ink { color: #fff; background: var(--fc-dark); }
        .faim-ico--amber { color: #b45309; background: #fef3c7; }

        .faim-legal { display: flex; flex-wrap: wrap; gap: 6px 16px; padding: 6px 4px; font-size: 0.8rem; }
        .faim-legal a { color: var(--fc-accent); text-decoration: none; font-weight: 600; }
        .faim-legal a:hover { text-decoration: underline; }

        /* Keyboard focus */
        .faim-contact-page a:focus-visible, .faim-contact-page button:focus-visible {
          outline: 3px solid var(--fc-glow);
          outline-offset: 3px;
        }

        @media (min-width: 560px) {
          .faim-row { grid-template-columns: 1fr 1fr; gap: 16px; }
          .faim-card { padding: 32px; }
        }
        @media (min-width: 900px) {
          .faim-contact-page { padding-top: 36px; }
          .faim-hero { padding: 56px 52px; }
          .faim-main { grid-template-columns: 1.4fr 1fr; align-items: start; }
          .faim-side { position: sticky; top: 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .faim-contact-page *, .faim-contact-page *::before, .faim-contact-page *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  )
}