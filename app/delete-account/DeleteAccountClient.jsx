'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // change to "import supabase from ..." if yours is a default export

const box = { maxWidth: 560, margin: '0 auto', padding: '1.5rem' };
const card = { background: 'var(--card-bg, #fff)', color: 'var(--text-1, #0f172a)', border: '1px solid rgba(128,128,128,.25)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' };
const input = { width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid rgba(128,128,128,.4)', fontSize: '1rem', marginBottom: '0.75rem', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '0.85rem', borderRadius: 10, border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', color: '#fff' };

export default function DeleteAccountClient() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [confirmText, setConfirmText] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  async function deleteNow() {
    setBusy(true); setMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ confirm: confirmText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong.');
      await supabase.auth.signOut();
      setDone(true);
      setTimeout(() => { window.location.href = '/'; }, 3000);
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  }

  async function sendRequest() {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong.');
      setDone(true);
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  }

  return (
    <main style={box}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Delete Your Mr. Rent Account</h1>
      <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
        You can delete your account and data at any time. This cannot be undone.
      </p>

      <div style={card}>
        <strong>What gets deleted</strong>
        <ul style={{ margin: '0.5rem 0 0 1.2rem' }}>
          <li>Your profile, phone number and email</li>
          <li>Your property listings</li>
          <li>Your contact reveals and saved activity</li>
          <li>Your login</li>
        </ul>
        <p style={{ marginTop: '0.75rem', opacity: 0.8 }}>
          <strong>What we may keep:</strong> payment records required for accounting and legal purposes.
          Active landlord subscriptions end with the account and are not refunded automatically.
        </p>
      </div>

      {done ? (
        <div style={card}>
          {user
            ? 'Your account has been deleted. Taking you to the homepage…'
            : 'Request received. We will delete your account within 30 days and email you when it is done.'}
        </div>
      ) : user === undefined ? (
        <div style={card}>Loading…</div>
      ) : user ? (
        <div style={card}>
          <p style={{ marginBottom: '0.75rem' }}>Logged in as <strong>{user.email}</strong>. Type <strong>DELETE</strong> to confirm.</p>
          <input style={input} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
          <button
            style={{ ...btn, background: confirmText === 'DELETE' && !busy ? '#dc2626' : '#9ca3af' }}
            disabled={confirmText !== 'DELETE' || busy}
            onClick={deleteNow}
          >
            {busy ? 'Deleting…' : 'Permanently delete my account'}
          </button>
        </div>
      ) : (
        <div style={card}>
          <p style={{ marginBottom: '0.75rem' }}>Can&apos;t log in? Send a deletion request and we will handle it.</p>
          <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used on your account" />
          <textarea style={{ ...input, minHeight: 80 }} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" />
          <button style={{ ...btn, background: busy ? '#9ca3af' : '#0080FF' }} disabled={busy} onClick={sendRequest}>
            {busy ? 'Sending…' : 'Request account deletion'}
          </button>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Or log in first for instant deletion, or email info@fasteraim.com.
          </p>
        </div>
      )}

      {msg && <p style={{ color: '#dc2626', fontWeight: 600 }}>{msg}</p>}
    </main>
  );
}