'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#0ea5e9', fontWeight: '700', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          ← Back to Mr. Rent
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1.5rem', color: '#0f172a' }}>Privacy Policy</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
          Last updated: February 2026
        </p>
        <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          At Mr. Rent, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '2rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
        <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          We collect information that you provide directly to us when you register an account, list a property, make a payment, or communicate with our AI assistant. This may include your name, email address, phone number, and property details.
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '2rem', marginBottom: '1rem' }}>2. How We Use Your Information</h2>
        <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          We use the information we collect to provide, maintain, and improve our services, process transactions, verify landlord identities, and facilitate communication between tenants and landlords.
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '3rem' }}>
          If you require the full legal text or have questions regarding our privacy practices, please contact support.
        </p>
      </div>
    </main>
  )
}
