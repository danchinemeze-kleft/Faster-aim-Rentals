'use client';

const GREEN = '#059669';
const GREEN_DARK = '#047857';
const GREEN_LIGHT = '#d1fae5';

const BADGE_TIERS = [
  {
    level: 'white',
    fill: '#cbd5e1',
    check: '#64748b',
    title: 'Submitted',
    desc: 'Documents received and queued for manual review.',
    color: '#475569',
    border: '#e2e8f0',
  },
  {
    level: 'yellow',
    fill: '#F59E0B',
    check: '#fff',
    title: 'Partial Verified',
    desc: 'Some documents confirmed. Verification in progress.',
    color: '#92400e',
    border: '#fde68a',
  },
  {
    level: 'green',
    fill: '#10B981',
    check: '#fff',
    title: 'Verified',
    desc: 'Core ownership documents confirmed authentic.',
    color: '#065f46',
    border: '#a7f3d0',
  },
  {
    level: 'blue',
    fill: '#1d4ed8',
    check: '#fff',
    title: 'Premium Verified',
    desc: 'All docs verified + physical inspection confirmed.',
    color: '#1e3a8a',
    border: '#bfdbfe',
  },
];

function BadgeIcon({ fill, check, size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="26" fill={fill} />
      <polyline
        points="14,26 23,35 38,17"
        stroke={check}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function VerylandPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text-1)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Nav */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)' }} />
      <nav style={{ borderBottom: '2px solid #0ef6cc', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 3, background: 'var(--card-bg)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ color: 'var(--text-3)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Mr. Rent</a>
          <span style={{ color: 'var(--border-2)' }}>/</span>
          <span style={{ color: GREEN, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
            Veryland
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1d4ed8"/><path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/account" style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
          <a href="/veryland/submit" style={{ background: GREEN, color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: GREEN_LIGHT, border: `1px solid ${GREEN}44`,
          borderRadius: 100, padding: '6px 18px', fontSize: 12, color: GREEN_DARK,
          fontWeight: 700, marginBottom: 28, letterSpacing: 1, textTransform: 'uppercase'
        }}>
          A Faster Aim Technology Product
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-1px' }}>
          Verify Nigerian Land Title Documents<br />
          <span style={{ color: GREEN }}>Before You Buy</span>
        </h1>

        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-2)', fontWeight: 500, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.75 }}>
          AI-powered document forensics + physical registry verification.<br />
          Know the truth before you pay.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/veryland/submit" style={{
            background: GREEN, color: '#fff', padding: '14px 34px',
            borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none',
            boxShadow: `0 4px 16px ${GREEN}44`,
          }}>
            Start Verification
          </a>
          <a href="#how-it-works" style={{
            background: 'transparent', color: 'var(--text-2)',
            border: '1.5px solid var(--border-2)', padding: '14px 34px',
            borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}>
            How It Works
          </a>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: 'var(--page-bg)', borderTop: '1px solid var(--border-1)', borderBottom: '1px solid var(--border-1)', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {[
            { icon: '🏛️', text: 'CAC-Registered Verification' },
            { icon: '🤖', text: 'Gemini AI Document Scan' },
            { icon: '👨‍⚖️', text: 'Human Expert Review' },
            { icon: '🛡️', text: 'Fraud Prevention' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
              <span>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Badge Tiers */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Four Levels of Trust
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 15, fontWeight: 500, maxWidth: 480, margin: '0 auto' }}>
            Every verified property earns a badge. The colour tells you exactly how much has been confirmed.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: 18 }}>
          {BADGE_TIERS.map(tier => (
            <div key={tier.level} style={{
              background: 'var(--card-bg)',
              border: `1.5px solid ${tier.border}`,
              borderRadius: 16, padding: '1.75rem 1.5rem', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <BadgeIcon fill={tier.fill} check={tier.check} size={48} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: tier.color, marginBottom: 8 }}>{tier.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, lineHeight: 1.6 }}>{tier.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Service Cards */}
      <div style={{ background: 'var(--page-bg)', borderTop: '1px solid var(--border-1)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div style={{
            background: 'var(--card-bg)', border: `1.5px solid ${GREEN}33`,
            borderRadius: 20, padding: '2.25rem',
            boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
          }}>
            <div style={{ width: 52, height: 52, background: GREEN_LIGHT, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>🏠</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 12px' }}>
              For Property Owners
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 500, lineHeight: 1.8, marginBottom: 24 }}>
              Submit your documents — C of O, Survey Plan, Deed of Assignment and more. Our team manually reviews every submission. Once approved, your listing earns a coloured Veryland badge that signals trust to buyers and tenants.
            </p>
            <a href="/veryland/submit" style={{
              display: 'inline-block', background: GREEN, color: '#fff',
              padding: '12px 26px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: `0 4px 12px ${GREEN}33`,
            }}>
              Submit Documents →
            </a>
          </div>

          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid #fecdd3',
            borderRadius: 20, padding: '2.25rem',
            boxShadow: '0 4px 16px rgba(239,68,68,0.06)',
          }}>
            <div style={{ width: 52, height: 52, background: '#fff1f2', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 12px' }}>
              For Buyers &amp; Tenants
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 500, lineHeight: 1.8, marginBottom: 24 }}>
              Before you pay for any property, check if the documents you were given are authentic. Cross-check our verified database and optionally upload the document for an AI-powered authenticity scan.
            </p>
            <a href="/veryland/check" style={{
              display: 'inline-block', background: '#ef4444', color: '#fff',
              padding: '12px 26px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
            }}>
              Check Documents →
            </a>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 2rem 6rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', textAlign: 'center', margin: '0 0 56px', letterSpacing: '-0.5px' }}>
          How Verification Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40 }}>
          {[
            { step: '01', title: 'Submit Documents', desc: 'Upload scanned copies of your C of O, survey plan, deed of assignment, and any other ownership documents.', color: GREEN, bg: GREEN_LIGHT },
            { step: '02', title: 'Human Review', desc: 'Our verification team manually checks each document for authenticity, completeness, and consistency.', color: '#d97706', bg: '#fef3c7' },
            { step: '03', title: 'Badge Awarded', desc: 'Once approved, your listing gets a coloured Veryland badge. Buyers see it instantly and trust you more.', color: '#1d4ed8', bg: '#dbeafe' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                width: 48, height: 48, background: item.bg, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 900, color: item.color,
              }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500, lineHeight: 1.75 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`, padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Ready to Verify Your Property?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: 15, marginBottom: 32 }}>
          Join property owners across Nigeria who trust Veryland.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/veryland/submit" style={{ background: '#fff', color: GREEN_DARK, padding: '14px 34px', borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
            Verify My Property →
          </a>
          <a href="/veryland/check" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)', padding: '14px 34px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Check a Document
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border-1)', padding: '1.75rem 2rem', textAlign: 'center', background: 'var(--page-bg)' }}>
        <span style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 500 }}>Veryland is a product of </span>
        <a href="https://fasteraim.com" style={{ color: GREEN_DARK, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Faster Aim Technology Limited</a>
        <span style={{ color: 'var(--border-2)', fontSize: 13 }}> · </span>
        <a href="/privacy-policy" style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>
        <span style={{ color: 'var(--border-2)', fontSize: 13 }}> · </span>
        <a href="/browse" style={{ color: 'var(--text-3)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Browse Listings</a>
      </div>
    </div>
  );
}
