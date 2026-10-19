'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import Breadcrumb from '../components/Breadcrumb'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const STEPS = [
  { icon: '🔍', title: 'Browse Listings', desc: 'Search properties by location, budget, and type across all 36 states.', link: '/browse' },
  { icon: '🤖', title: 'Ask Mr. Rent AI', desc: 'Chat with our AI assistant to find the perfect property for your needs.', link: '/search' },
  { icon: '💳', title: 'Reveal Contact', desc: "Pay ₦5,000 to instantly reveal the landlord's contact details.", link: '/browse' },
  { icon: '🏠', title: 'Move In', desc: 'Contact the landlord directly and arrange your inspection and move.', link: '/browse' },
]

const LANDLORD_FEATURES = [
  'Unlimited property listings',
  'Appear in AI-powered searches',
  'Earn from contact reveals',
  'Professional landlord dashboard',
  'Available/unavailable toggle',
]

export default function HomeDarkPage() {
  const [listingCount, setListingCount] = useState(null)

  useEffect(() => {
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => { if (count !== null) setListingCount(count) })
  }, [])

  const displayCount = listingCount === null ? '...' : listingCount > 0 ? `${listingCount}+` : 'New'

  return (
    <main className="home">
      <Breadcrumb theme="dark" items={[{ label: 'Mr. Rent', href: '/' }]} />

      <nav className="home-nav">
        <div className="home-brand">🏠 Mr. Rent</div>
        <div className="home-nav-links">
          <a href="/browse">Browse</a>
          <a href="/search">AI Chat</a>
          <a href="/list">List Property</a>
          <a href="/veryland" className="home-veryland">Veryland</a>
          <a href="/account" className="home-nav-btn">Login / Sign up</a>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero-frame">
          <div className="home-hero-layout">
            <div>
              <div className="home-badge">🇳🇬 Nigeria Nationwide</div>
              <h1>
                Find or List<br />
                <span className="accent-cyan">Property for Rent</span><br />
                <span className="accent-teal">Quickly & Securely</span>
              </h1>
              <p className="home-sub">
                Connect with verified landlords across Nigeria. Browse listings, chat with Mr. Rent AI, and find your perfect home today.
              </p>
              <div className="home-actions">
                <a href="/browse" className="btn-cyan">Browse (free)</a>
                <a href="/search" className="btn-teal">AI Chat (free)</a>
                <a href="/list" className="btn-outline">Add Property (free)</a>
                <a href="https://fasteraim.com" target="_blank" rel="noopener noreferrer" className="btn-purple">Learn AI Skills</a>
                <a href="/affiliate" className="btn-green span-2">Join Associate — Earn Commission</a>
                <a href="/veryland" className="btn-blue span-2">Veryland — Verify Your Property Documents</a>
              </div>
              <div className="home-stats">
                <div><strong className="accent-cyan">{displayCount}</strong><span>Active Homes</span></div>
                <div><strong className="accent-teal">36</strong><span>States</span></div>
              </div>
              <p className="home-note">Available in every city across Nigeria</p>
            </div>

            <a href="/search" className="home-avatar">
              <Image src="/mr-rent-avatar.png" alt="Mr. Rent" width={320} height={380} priority />
            </a>
          </div>
        </div>
      </section>

      <section className="home-section">
        <p className="home-tag">How it works</p>
        <h2>Simple. Fast. <span className="accent-cyan">Secure.</span></h2>
        <div className="home-steps">
          {STEPS.map((step, i) => (
            <a href={step.link} key={step.title} className="home-step">
              <span className="step-num">0{i + 1}</span>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="home-section home-landlord">
        <div className="home-landlord-grid">
          <div>
            <p className="home-tag">For landlords</p>
            <h2>List Your Property. <span className="accent-teal">Reach Thousands.</span></h2>
            <p className="home-sub">
              Subscribe for ₦10,000/month and list unlimited properties. Tenants pay ₦5,000 to reveal your contact.
            </p>
            <ul className="home-features">
              {LANDLORD_FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <a href="/account" className="btn-cyan">Get Started</a>
          </div>
          <div className="home-price-card">
            <p className="home-tag">Landlord plan</p>
            <div className="home-price"><span>₦</span>10,000</div>
            <p className="home-note">/month</p>
            <ul className="home-features">
              <li>Unlimited listings</li>
              <li>Dashboard access</li>
              <li>AI promotion</li>
              <li>Cancel anytime</li>
            </ul>
            <a href="/account" className="btn-teal">Subscribe Now</a>
          </div>
        </div>
      </section>

      <section className="home-section home-cta">
        <p className="home-tag">Join Mr. Rent</p>
        <h2>Your Next Home is <span className="accent-cyan">One Click Away</span></h2>
        <p className="home-sub">Join thousands of Nigerians finding and listing homes on Mr. Rent</p>
        <div className="home-actions center">
          <a href="/browse" className="btn-cyan">Browse Listings</a>
          <a href="/search" className="btn-teal">Ask Mr. Rent AI</a>
          <a href="/list" className="btn-outline">Add Your Property</a>
          <a href="/affiliate" className="btn-green">Join Associate</a>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-brand">🏠 Mr. Rent</div>
        <div className="home-nav-links">
          <a href="/browse">Browse</a>
          <a href="/search">AI Chat</a>
          <a href="/list">List Property</a>
          <a href="/veryland">Veryland</a>
          <a href="/account">Login</a>
        </div>
        <p className="home-note">© 2026 Faster Aim Technology Limited.</p>
      </footer>
    </main>
  )
}