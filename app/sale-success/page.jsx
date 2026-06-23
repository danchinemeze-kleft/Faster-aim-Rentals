'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SaleSuccessInner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const listingId = searchParams.get('listing_id');

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const verified = useRef(false);

  useEffect(() => {
    if (!reference || verified.current) return;
    verified.current = true;

    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
        } else {
          setErrorMsg(data.error || 'Payment verification failed.');
          setStatus('error');
        }
      })
      .catch(() => {
        setErrorMsg('Could not verify payment. Please contact support.');
        setStatus('error');
      });
  }, [reference]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ffffff' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 60, background: 'var(--card-bg)', position: 'sticky', top: 3, zIndex: 100 }}>
        <a href="/" style={{ color: '#cccccc', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Mr. Rent</a>
        <span style={{ color: '#555', margin: '0 8px' }}>/</span>
        <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>Sale Listing</span>
      </nav>

      <div style={{ maxWidth: 560, margin: '4rem auto', padding: '0 1.5rem 6rem', textAlign: 'center' }}>

        {status === 'verifying' && (
          <div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '5px solid #333', borderTopColor: '#0ef6cc', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <h1 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 900, marginBottom: 10 }}>Verifying Payment…</h1>
            <p style={{ color: '#cccccc', fontSize: 15 }}>Please wait while we confirm your listing fee.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(14,246,204,0.12)', border: '3px solid #0ef6cc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>
              🚀
            </div>
            <h1 style={{ color: '#0ef6cc', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 12px' }}>
              Your Listing is Now LIVE!
            </h1>
            <p style={{ color: '#cccccc', fontSize: 16, lineHeight: 1.75, marginBottom: 28 }}>
              Your <strong style={{ color: '#0ef6cc' }}>₦15,000</strong> activation fee has been received. Your verified property listing is now visible to thousands of buyers across Nigeria.
            </p>

            <div style={{ background: 'rgba(14,246,204,0.06)', border: '1.5px solid rgba(14,246,204,0.25)', borderRadius: 14, padding: '1.25rem', marginBottom: 28, textAlign: 'left' }}>
              <div style={{ fontWeight: 800, color: '#0ef6cc', marginBottom: 8, fontSize: 14 }}>Your listing benefits</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  '✅ Veryland Verified badge — builds instant buyer trust',
                  '📍 Visible on the Buy Property page to all visitors',
                  '📞 Buyers contact you directly — no middleman',
                  '♾️ Stays live until sold — no monthly charges ever',
                ].map((step, i) => (
                  <div key={i} style={{ color: '#cccccc', fontSize: 14, lineHeight: 1.6 }}>{step}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="/buy" style={{ display: 'block', background: 'linear-gradient(135deg, #0ef6cc, #00c9a7)', color: '#080a0f', padding: '14px', borderRadius: 11, fontWeight: 900, fontSize: 16, textDecoration: 'none' }}>
                View Buy Property Page →
              </a>
              <a href="/" style={{ display: 'block', background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--border-1)', color: '#cccccc', padding: '13px', borderRadius: 11, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                Back to Homepage
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontSize: 56, marginBottom: 20 }}>⚠️</div>
            <h1 style={{ color: '#fca5a5', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 12px' }}>Verification Issue</h1>
            <p style={{ color: '#cccccc', fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
              {errorMsg}
            </p>
            {reference && (
              <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
                Reference: <strong style={{ color: '#cccccc' }}>{reference}</strong>
              </p>
            )}
            <p style={{ color: '#cccccc', fontSize: 14, marginBottom: 24 }}>
              If payment was deducted, please email us at <a href="mailto:info@fasteraim.com" style={{ color: '#0ef6cc' }}>info@fasteraim.com</a> with your payment reference and we&apos;ll manually activate your listing.
            </p>
            <a href="/sell" style={{ display: 'inline-block', background: '#0ef6cc', color: '#080a0f', padding: '13px 28px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
              ← Back to Sell Page
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SaleSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #333', borderTopColor: '#0ef6cc', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <SaleSuccessInner />
    </Suspense>
  );
}
