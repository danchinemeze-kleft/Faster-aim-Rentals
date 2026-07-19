'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FeedbackForm() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <p className="faim-feedback-loading">Loading...</p>;
  }

  if (!user) {
    return (
      <p className="faim-feedback-signin-prompt">
        Please <a href="/account">sign in</a> to send us feedback.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, page_url: window.location.pathname }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('sent');
      setMessage('');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="faim-feedback-form">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us what's on your mind..."
        required
      />
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent ✓' : 'Send Feedback'}
      </button>
      {status === 'error' && <p className="faim-feedback-error">{errorMsg}</p>}
    </form>
  );
}