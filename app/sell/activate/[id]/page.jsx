'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ActivateSaleListing() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const [user, setUser] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data?.user || null;
      setUser(currentUser);

      if (!currentUser) { setLoading(false); return; }

      const { data: sale, error: fetchErr } = await supabase
        .from('property_sales')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !sale) {
        setError('Listing not found.');
      } else if (sale.seller_id !== currentUser.id) {
        setError('You do not have access to this listing.');
      } else {
        setListing(sale);
      }
      setLoading(false);
    });
  }, [id, supabase]);

  async function handleActivate() {
    setPaying(true);
    setError('');
    try {
      const { data: profile } = await supabase
        .from('Profiles').select('email').eq('id', user.id).single();
      const email = profile?.email || user.email;

      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'sale_activation', listing_id: id, user_id: user.id }),
      });
      const payData = await res.json();
      if (!payData.authorization_url) throw new Error(payData.error || 'Payment init failed');
      window.location.href = payData.authorization_url;
    } catch (err) {
      setError('Error: ' + err.message);
      setPaying(false);
    }
  }

  const nav = (
    <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
      <a href="/" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
      <span style={{ color: '#555', margin: '0 8px' }}>/</span>
      <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>Activate Listing</span>
    </nav>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #333', borderTopColor: '#0ef6cc', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ffffff' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      {nav}
      <div style={{ maxWidth: 480, margin: '6rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: 12 }}>Login Required</h1>
        <p style={{ color: '#cccccc', marginBottom: 28 }}>You need to be logged in to activate your listing.</p>
        <a href={`/account?redirect=/sell/activate/${id}`} style={{ display: 'inline-block', background: '#0ef6cc', color: '#080a0f', padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
          Login / Sign Up
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ffffff' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      {nav}
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.5)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#fca5a5', fontSize: 15, fontWeight: 600, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {listing && listing.status === 'pending' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#EF9F27', marginBottom: 12 }}>Under Review</h1>
            <p style={{ color: '#cccccc', fontSize: 15, lineHeight: 1.8 }}>
              Your listing <strong style={{ color: '#fff' }}>&ldquo;{listing.title}&rdquo;</strong> is still being reviewed by our team. You&apos;ll be able to activate it once it&apos;s approved — usually within 24–48 hours.
            </p>
          </div>
        )}

        {listing && listing.status === 'rejected' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fca5a5', marginBottom: 12 }}>Listing Rejected</h1>
            <p style={{ color: '#cccccc', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              Unfortunately your listing <strong style={{ color: '#fff' }}>&ldquo;{listing.title}&rdquo;</strong> was not approved. This is usually due to incomplete or unverifiable documents.
            </p>
            <a href="/sell" style={{ display: 'inline-block', background: '#0ef6cc', color: '#080a0f', padding: '13px 28px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
              Submit a New Listing →
            </a>
          </div>
        )}

        {listing && listing.status === 'active' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🟢</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0ef6cc', marginBottom: 12 }}>Already Live!</h1>
            <p style={{ color: '#cccccc', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              Your listing <strong style={{ color: '#fff' }}>&ldquo;{listing.title}&rdquo;</strong> is already active and visible to buyers on the platform.
            </p>
            <a href="/buy" style={{ display: 'inline-block', background: '#0ef6cc', color: '#080a0f', padding: '13px 28px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
              View on Buy Page →
            </a>
          </div>
        )}

        {listing && listing.status === 'approved' && (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(14,246,204,0.1)', border: '3px solid #0ef6cc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>✅</div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0ef6cc', margin: '0 0 10px' }}>Your Listing is Approved!</h1>
              <p style={{ color: '#cccccc', fontSize: 15, lineHeight: 1.75 }}>
                Pay the one-time activation fee to make your listing <strong style={{ color: '#ffffff' }}>live</strong> on the Buy Property page.
              </p>
            </div>

            {/* Listing card */}
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-1)', borderRadius: 16, padding: '1.5rem', marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{listing.property_type?.replace(/_/g, ' ')}</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>{listing.title}</h2>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>📍 {listing.location}, {listing.state}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0ef6cc', marginTop: 8 }}>
                ₦{Number(listing.price).toLocaleString()}
                {listing.negotiable && <span style={{ fontSize: 12, color: '#888', fontWeight: 400, marginLeft: 8 }}>Negotiable</span>}
              </div>
            </div>

            {/* Fee notice */}
            <div style={{ background: 'rgba(14,246,204,0.06)', border: '2px solid rgba(14,246,204,0.3)', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 800, color: '#0ef6cc', fontSize: 15 }}>💳 Activation Fee</span>
                <span style={{ fontWeight: 900, color: '#ffffff', fontSize: 22 }}>₦15,000</span>
              </div>
              <div style={{ fontSize: 13, color: '#cccccc', lineHeight: 1.65 }}>
                One-time payment. Your listing stays live until your property is sold — no monthly charges.
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.5)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={paying}
              style={{
                width: '100%', padding: '16px',
                background: paying ? '#444' : 'linear-gradient(135deg, #0ef6cc, #00c9a7)',
                color: '#080a0f', border: 'none', borderRadius: 12,
                fontWeight: 900, fontSize: 17, cursor: paying ? 'not-allowed' : 'pointer',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                boxShadow: paying ? 'none' : '0 4px 20px rgba(14,246,204,0.35)',
              }}
            >
              {paying ? 'Redirecting to Paystack…' : 'Pay ₦15,000 & Go Live →'}
            </button>

            <p style={{ textAlign: 'center', color: '#555', fontSize: 13, marginTop: 14 }}>
              Secured by Paystack. You&apos;ll be redirected back after payment.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
