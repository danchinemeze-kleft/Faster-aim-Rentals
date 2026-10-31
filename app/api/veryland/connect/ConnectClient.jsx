'use client';
import { useState } from 'react';

const DONATE_URL = 'https://paystack.shop/pay/support-mr-rent';
const donateReady = DONATE_URL.startsWith('https://');

const wrap = { maxWidth: 520, margin: '0 auto', padding: '1.5rem 1rem 3rem' };
const card = { background: 'var(--card-bg, #fff)', color: 'var(--text-1, #0f172a)', border: '1px solid rgba(128,128,128,.25)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' };
const input = { width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid rgba(128,128,128,.4)', fontSize: '1rem', marginBottom: '0.75rem', boxSizing: 'border-box', fontFamily: 'inherit' };
const bigBtn = { display: 'block', width: '100%', padding: '1rem', borderRadius: 14, border: 'none', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', color: '#fff', textAlign: 'center', textDecoration: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' };

export default function ConnectClient() {
  const [tab, setTab] = useState(null); // null | 'support' | 'partnership'
  const [form, setForm] = useState({ name: '', email: '', phone: '', business_name: '', message: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function open(t) {
    setTab(tab === t ? null : t);
    setMsg(''); setSent('');
  }

  async function submit() {
    setBusy(true); setMsg('');
    try {
      const source = new URLSearchParams(window.location.search).get('src') || 'direct';
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: tab, source }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong.');
      setSent(tab === 'support'
        ? 'Thank you! We received your question and will reply soon.'
        : 'Thank you! We received your partnership request and will contact you.');
      setForm({ name: '', email: '', phone: '', business_name: '', message: '', website: '' });
      setTab(null);
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  }

  return (
    <main style={wrap}>
      <h1 style={{ fontSize: '1.7rem', textAlign: 'center', marginBottom: '0.4rem' }}>Welcome to Mr. Rent</h1>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '1.5rem' }}>
        Find or list property across Nigeria, quickly and securely. How can we help you today?
      </p>

      {sent && <div style={{ ...card, borderColor: '#16a34a', fontWeight: 600 }}>{sent}</div>}

      <button style={{ ...bigBtn, background: '#0080FF' }} onClick={() => open('support')}>
        💬 Support: ask us anything
      </button>
      <button style={{ ...bigBtn, background: '#14b8a6' }} onClick={() => open('partnership')}>
        🤝 Partnership: work with us
      </button>
      {donateReady ? (
        <a style={{ ...bigBtn, background: '#ec4899' }} href={DONATE_URL} target="_blank" rel="noopener noreferrer">
          ❤️ Donate: support our work
        </a>
      ) : (
        <button style={{ ...bigBtn, background: '#9ca3af', cursor: 'not-allowed' }} disabled>
          ❤️ Donate (coming soon)
        </button>
      )}

      {tab && (
        <div style={card}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
            {tab === 'support' ? 'Ask your question' : 'Tell us about your business'}
          </h2>

          <input style={input} placeholder="Your name" value={form.name} onChange={set('name')} />
          {tab === 'partnership' && (
            <input style={input} placeholder="Business name" value={form.business_name} onChange={set('business_name')} />
          )}
          <input style={input} type="email" placeholder="Email" value={form.email} onChange={set('email')} />
          <input style={input} type="tel" placeholder="Phone (optional if you gave an email)" value={form.phone} onChange={set('phone')} />
          <textarea
            style={{ ...input, minHeight: 110 }}
            placeholder={tab === 'support'
              ? 'Type your question here'
              : 'What does your business do, and what would you like us to do together?'}
            value={form.message}
            onChange={set('message')}
          />

          {/* bot trap: real users never see or fill this */}
          <input
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
            tabIndex={-1} autoComplete="off" aria-hidden="true"
            value={form.website} onChange={set('website')}
          />

          <button style={{ ...bigBtn, background: busy ? '#9ca3af' : '#0080FF', marginBottom: 0 }} disabled={busy} onClick={submit}>
            {busy ? 'Sending…' : 'Send'}
          </button>
          {msg && <p style={{ color: '#dc2626', fontWeight: 600, marginTop: '0.75rem' }}>{msg}</p>}
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.7, marginTop: '1.5rem' }}>
        Or email info@fasteraim.com
      </p>
    </main>
  );
}