'use client';

const BADGE_TIERS = [
  {
    level: 'white',
    fill: '#d0d0d0',
    check: '#888',
    title: 'Submitted',
    desc: 'Documents received and queued for manual review. First step in the Veryland process.',
    color: '#aaa',
  },
  {
    level: 'yellow',
    fill: '#F59E0B',
    check: '#fff',
    title: 'Partial Verified',
    desc: 'Some documents confirmed authentic. Additional verification still in progress.',
    color: '#F59E0B',
  },
  {
    level: 'green',
    fill: '#10B981',
    check: '#fff',
    title: 'Verified',
    desc: 'Core ownership documents confirmed authentic. Property is safe to transact.',
    color: '#10B981',
  },
  {
    level: 'blue',
    fill: '#3B82F6',
    check: '#fff',
    title: 'Premium Verified',
    desc: 'All documents verified + physical inspection confirmed. Maximum trust level.',
    color: '#3B82F6',
  },
];

function BadgeIcon({ fill, check, size = 52 }) {
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
    <div style={{ minHeight: '100vh', background: '#080a0f', color: '#e8e8e8', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Nav */}
      <div style={{ borderBottom: '0.5px solid #1a1d24', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 56, gap: 12 }}>
        <a href="/" style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>Mr. Rent</a>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#888', fontSize: 14 }}>Veryland</span>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(14,246,204,0.07)', border: '1px solid rgba(14,246,204,0.18)',
          borderRadius: 100, padding: '6px 18px', fontSize: 11, color: '#0ef6cc',
          fontWeight: 700, marginBottom: 28, letterSpacing: 1, textTransform: 'uppercase'
        }}>
          A Faster Aim Technology Product
        </div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(2.4rem, 7vw, 4.5rem)',
          fontWeight: 900, color: '#fff', margin: '0 0 22px', lineHeight: 1.05
        }}>
          Veryland
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#777', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.75 }}>
          Nigeria&apos;s first property document verification system. Prove your property is real — or check if the one you&apos;re about to buy is legitimate.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/veryland/submit" style={{
            background: '#0ef6cc', color: '#080a0f', padding: '14px 34px',
            borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none'
          }}>
            Verify My Property →
          </a>
          <a href="/veryland/check" style={{
            background: 'transparent', color: '#0ef6cc',
            border: '1.5px solid #0ef6cc', padding: '14px 34px',
            borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none'
          }}>
            Check a Document
          </a>
        </div>
      </div>

      {/* Badge Tiers */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            Four Levels of Trust
          </h2>
          <p style={{ color: '#555', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Every verified property earns a badge. The colour tells you exactly how much has been confirmed.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: 18 }}>
          {BADGE_TIERS.map(tier => (
            <div key={tier.level} style={{
              background: '#111318',
              border: `1px solid ${tier.fill}28`,
              borderRadius: 16, padding: '1.75rem 1.5rem', textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <BadgeIcon fill={tier.fill} check={tier.check} size={52} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: tier.color, marginBottom: 8 }}>{tier.title}</div>
              <div style={{ fontSize: 12.5, color: '#555', lineHeight: 1.6 }}>{tier.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Service Cards */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div style={{
          background: 'linear-gradient(140deg, #071a14, #111318)',
          border: '1px solid #0ef6cc25', borderRadius: 20, padding: '2rem'
        }}>
          <div style={{ fontSize: 38, marginBottom: 18 }}>🏠</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            For Property Owners
          </h3>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
            Submit your documents — C of O, Survey Plan, Deed of Assignment and more. Our team manually reviews every submission. Once approved, your listing earns a coloured Veryland badge that signals trust to buyers and tenants.
          </p>
          <a href="/veryland/submit" style={{
            display: 'inline-block', background: '#0ef6cc', color: '#080a0f',
            padding: '12px 26px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none'
          }}>
            Submit Documents
          </a>
        </div>
        <div style={{
          background: 'linear-gradient(140deg, #180a12, #111318)',
          border: '1px solid #ff2d7825', borderRadius: 20, padding: '2rem'
        }}>
          <div style={{ fontSize: 38, marginBottom: 18 }}>🔍</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            For Buyers &amp; Tenants
          </h3>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
            Before you pay for any property, check if the documents you were given are authentic. Cross-check our verified database and optionally upload the document for an AI-powered authenticity scan.
          </p>
          <a href="/veryland/check" style={{
            display: 'inline-block', background: '#ff2d78', color: '#fff',
            padding: '12px 26px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none'
          }}>
            Check Documents
          </a>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 6rem' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#fff', textAlign: 'center', margin: '0 0 48px' }}>
          How Verification Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
          {[
            { step: '01', title: 'Submit Documents', desc: 'Upload scanned copies of your C of O, survey plan, deed of assignment, and any other ownership documents.', color: '#0ef6cc' },
            { step: '02', title: 'Human Review', desc: 'Our verification team manually checks each document for authenticity, completeness, and consistency.', color: '#F59E0B' },
            { step: '03', title: 'Badge Awarded', desc: 'Once approved, your listing gets a coloured Veryland badge. Buyers see it instantly and trust you more.', color: '#10B981' },
          ].map(item => (
            <div key={item.step} style={{ position: 'relative', paddingTop: 10 }}>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontSize: '4rem', fontWeight: 900,
                color: item.color, opacity: 0.12, position: 'absolute', top: -16, left: -4, lineHeight: 1
              }}>{item.step}</div>
              <div style={{ paddingTop: 28 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#e8e8e8', marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '0.5px solid #111318', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <span style={{ color: '#333', fontSize: 13 }}>Veryland is a product of </span>
        <a href="https://fasteraim.com" style={{ color: '#0ef6cc', fontSize: 13, textDecoration: 'none' }}>Faster Aim Technology Limited</a>
        <span style={{ color: '#333', fontSize: 13 }}> · </span>
        <a href="/privacy-policy" style={{ color: '#444', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</a>
        <span style={{ color: '#333', fontSize: 13 }}> · </span>
        <a href="/browse" style={{ color: '#444', fontSize: 13, textDecoration: 'none' }}>Browse Listings</a>
      </div>
    </div>
  );
}
