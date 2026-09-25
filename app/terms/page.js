'use client'

import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#0ea5e9', fontWeight: '700', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          ← Back to Mr. Rent
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1.5rem', color: '#0f172a' }}>Terms of Service</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          Last updated: February 2026
        </p>
        <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          Welcome to Mr. Rent. By accessing or using our website and services, you agree to be bound by these Terms of Service.
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '2rem', marginBottom: '1rem' }}>1. Use of Services</h2>
        <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials.
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '2rem', marginBottom: '1rem' }}>2. Verification and Listings</h2>
        <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          Landlords listing properties must provide accurate information and undergo identity and document verification. Mr. Rent reserves the right to remove any listings that violate our guidelines.
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '3rem' }}>
          If you require the full legal text or have questions regarding our terms, please contact support.
        </p>
      </div>
    </main>
  )
}
