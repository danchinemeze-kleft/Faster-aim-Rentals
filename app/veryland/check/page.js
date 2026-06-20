'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BADGE_CONFIG = {
  white:  { fill: '#d0d0d0', check: '#888', label: 'Submitted — Under Review', color: '#aaa' },
  yellow: { fill: '#F59E0B', check: '#fff', label: 'Partially Verified',        color: '#F59E0B' },
  green:  { fill: '#10B981', check: '#fff', label: 'Verified',                   color: '#10B981' },
  blue:   { fill: '#3B82F6', check: '#fff', label: 'Premium Verified',           color: '#3B82F6' },
};

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara'
];

function BadgeIcon({ fill, check, size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx="22" cy="22" r="22" fill={fill} />
      <polyline points="12,22 20,30 33,14" stroke={check} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', background: '#1a1d24',
  border: '0.5px solid #2d3038', borderRadius: 8, color: '#e8e8e8',
  fontSize: 14, boxSizing: 'border-box', outline: 'none',
  fontFamily: 'DM Sans, system-ui, sans-serif',
};

export default function VerylandCheckPage() {
  const [address, setAddress]       = useState('');
  const [state, setState]           = useState('');
  const [docFile, setDocFile]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [dbResult, setDbResult]     = useState(null);
  const [aiResult, setAiResult]     = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [error, setError]           = useState('');

  async function handleCheck(e) {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter the property address to check.');
      return;
    }
    setError('');
    setLoading(true);
    setDbResult(null);
    setAiResult(null);

    try {
      let query = supabase
        .from('veryland_submissions')
        .select('id, property_address, state, badge_level, status, documents, submitted_at, reviewed_at')
        .ilike('property_address', `%${address.trim()}%`)
        .in('status', ['approved_partial', 'approved_full']);

      if (state) query = query.eq('state', state);

      const { data, error: dbErr } = await query;
      if (dbErr) throw new Error(dbErr.message);

      setDbResult(data && data.length > 0 ? { found: true, submissions: data } : { found: false });
    } catch (err) {
      setError('Database check failed: ' + err.message);
    }

    setLoading(false);

    // AI scan runs separately after DB result
    if (docFile) {
      setAiLoading(true);
      try {
        const formData = new FormData();
        formData.append('document', docFile);
        formData.append('address', address);
        formData.append('state', state);

        const res = await fetch('/api/veryland/check', { method: 'POST', body: formData });
        const data = await res.json();
        setAiResult(data.analysis || 'AI analysis unavailable.');
      } catch {
        setAiResult('AI analysis could not be completed. Please try again.');
      }
      setAiLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#e8e8e8' }}>

      {/* Nav */}
      <div style={{ borderBottom: '0.5px solid #1a1d24', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 56, gap: 12 }}>
        <a href="/" style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Mr. Rent</a>
        <span style={{ color: '#333' }}>/</span>
        <a href="/veryland" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>Veryland</a>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#e8e8e8', fontSize: 14 }}>Check Documents</span>
      </div>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
            Check Property Documents
          </h1>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.75 }}>
            Enter the property address to check if it&apos;s verified in our database. Optionally upload a document photo for an AI authenticity scan before you make any payment.
          </p>
        </div>

        <form onSubmit={handleCheck}>
          <div style={{ background: '#111318', border: '0.5px solid #1e2128', borderRadius: 14, padding: '1.5rem', marginBottom: 18 }}>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500 }}>Property Address *</label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter the address exactly as it appears on the document"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500 }}>State <span style={{ color: '#444' }}>(optional — narrows the search)</span></label>
              <select value={state} onChange={e => setState(e.target.value)} style={inputStyle}>
                <option value="">All states</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Upload Document for AI Scan <span style={{ color: '#444' }}>(optional — JPG or PNG image only)</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={e => setDocFile(e.target.files?.[0] || null)}
                style={{ ...inputStyle, padding: '8px 12px', cursor: 'pointer', color: '#888' }}
              />
              {docFile && (
                <p style={{ fontSize: 12, color: '#0ef6cc', marginTop: 6 }}>✓ {docFile.name} — will be scanned by AI</p>
              )}
            </div>
          </div>

          {error && (
            <div style={{ background: '#1a0a0a', border: '1px solid #E24B4A', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#E24B4A', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', background: '#ff2d78',
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800,
              fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'DM Sans, system-ui, sans-serif',
            }}
          >
            {loading ? 'Checking database…' : 'Check This Property →'}
          </button>
        </form>

        {/* DB Result */}
        {dbResult && (
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11, color: '#444', marginBottom: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Veryland Database Result
            </div>

            {dbResult.found ? (
              dbResult.submissions.map(sub => {
                const b = BADGE_CONFIG[sub.badge_level] || BADGE_CONFIG.green;
                return (
                  <div key={sub.id} style={{
                    background: '#0a1a12',
                    border: `1px solid ${b.fill}35`,
                    borderRadius: 14, padding: '1.5rem', marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      <BadgeIcon fill={b.fill} check={b.check} size={48} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: b.color }}>{b.label}</div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Found in the Veryland database</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#777', lineHeight: 2.1 }}>
                      <div><span style={{ color: '#444', fontWeight: 600 }}>Address:</span> {sub.property_address}</div>
                      <div><span style={{ color: '#444', fontWeight: 600 }}>State:</span> {sub.state}</div>
                      <div><span style={{ color: '#444', fontWeight: 600 }}>Documents on file:</span> {Array.isArray(sub.documents) ? sub.documents.length : 0}</div>
                      {sub.reviewed_at && (
                        <div>
                          <span style={{ color: '#444', fontWeight: 600 }}>Verified on:</span>{' '}
                          {new Date(sub.reviewed_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ background: '#111318', border: '0.5px solid #2d3038', borderRadius: 14, padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ fontSize: 30, flexShrink: 0, marginTop: 2 }}>⚠️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#EF9F27', marginBottom: 8 }}>
                    Not Found in Veryland
                  </div>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.75, margin: 0 }}>
                    This address is not in our verified database. That doesn&apos;t automatically mean it&apos;s fraudulent — but we strongly recommend asking the owner to{' '}
                    <a href="/veryland/submit" style={{ color: '#0ef6cc', textDecoration: 'none', fontWeight: 600 }}>
                      submit their documents for verification
                    </a>{' '}
                    before you commit any money.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Result */}
        {(aiLoading || aiResult) && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11, color: '#444', marginBottom: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              AI Document Analysis
            </div>

            {aiLoading ? (
              <div style={{ background: '#111318', border: '0.5px solid #1e2128', borderRadius: 14, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid #1a1d24', borderTopColor: '#3B82F6', animation: 'spin 0.9s linear infinite', flexShrink: 0 }} />
                <span style={{ color: '#555', fontSize: 13 }}>Gemini is analysing your document…</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ background: '#0a0f1a', border: '1px solid #3B82F630', borderRadius: 14, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#3B82F6' }}>Gemini AI Analysis</span>
                </div>
                <div style={{ fontSize: 13.5, color: '#bbb', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA if not checked yet */}
        {!dbResult && !loading && (
          <div style={{ marginTop: 36, textAlign: 'center' }}>
            <p style={{ color: '#333', fontSize: 13 }}>
              Are you a property owner?{' '}
              <a href="/veryland/submit" style={{ color: '#0ef6cc', textDecoration: 'none', fontWeight: 600 }}>
                Get your property verified →
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
