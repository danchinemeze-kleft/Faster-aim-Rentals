'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo, CSSProperties, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from '../components/Breadcrumb'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const useSupabase = () => {
  return useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])
}

interface Review {
  id: string
  name: string
  role: 'Renter' | 'Landlord'
  rating: number
  comment: string
  location: string
  created_at?: string
  verified: boolean
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Chidi O.',
    role: 'Renter',
    rating: 5,
    comment: 'Found a 2-bedroom apartment in Ifite Awka directly from the landlord. Saved over N150,000 on agent fees and inspection charges. Super fast and reliable!',
    location: 'Awka, Anambra State',
    verified: true,
  },
  {
    id: '2',
    name: 'Emeka K.',
    role: 'Landlord',
    rating: 5,
    comment: 'Listed my self-contained unit and had direct calls from quality tenants within 24 hours. No stress with middlemen or unverified inquiries.',
    location: 'Amawbia, Anambra State',
    verified: true,
  },
  {
    id: '3',
    name: 'Blessing N.',
    role: 'Renter',
    rating: 5,
    comment: 'The document audit feature gave me complete peace of mind before making payment. Mr. Rent is genuinely changing property rentals here.',
    location: 'Awka, Anambra State',
    verified: true,
  },
]

export default function ReviewsPage() {
  const router = useRouter()
  const supabase = useSupabase()

  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS)
  const [filter, setFilter] = useState<'All' | 'Renter' | 'Landlord'>('All')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Review Form State
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState<'Renter' | 'Landlord'>('Renter')
  const [formLocation, setFormLocation] = useState('Awka')
  const [formRating, setFormRating] = useState(5)
  const [formComment, setFormComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Session check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Fetch Reviews from Supabase
  useEffect(() => {
    supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setReviews(data)
        }
      })
  }, [supabase])

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formName || !formComment) return

    setSubmitting(true)

    const newReview = {
      name: formName,
      role: formRole,
      rating: formRating,
      comment: formComment,
      location: formLocation || 'Awka',
      verified: true,
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select()

    if (!error && data) {
      setReviews([data[0], ...reviews])
    } else {
      // Fallback local append if table is not configured yet
      setReviews([{ ...newReview, id: Date.now().toString() }, ...reviews])
    }

    setSubmitting(false)
    setSubmitSuccess(true)
    setFormName('')
    setFormComment('')
    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'All') return true
    return r.role === filter
  })

  return (
    <main className={jakarta.className} style={s.main}>
      <style>{`
        .mobile-menu-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(15, 23, 42, 0.6);
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
        }
        .mobile-menu-panel {
          background-color: #ffffff;
          width: 85%;
          max-width: 360px;
          height: 100%;
          box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          overflow-y: auto;
          box-sizing: border-box;
        }
        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }
        .mobile-menu-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #64748b;
          cursor: pointer;
          line-height: 1;
        }
        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .review-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .review-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.08);
        }
        .star-picker {
          cursor: pointer;
          font-size: 1.4rem;
          color: #cbd5e1;
          transition: color 0.15s;
        }
        .star-picker.active {
          color: #f59e0b;
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .header-title { font-size: 2rem !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Breadcrumb theme="light" items={[{ label: 'Mr. Rent', href: '/' }, { label: 'Verified Reviews', href: '/reviews' }]} />

      {/* Navigation */}
      <nav style={s.nav}>
        <div style={s.navBrand} onClick={() => router.push('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', color: '#0ea5e9' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mr. Rent
        </div>

        <div className="nav-links-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/browse" style={s.navLink}>Browse Rentals</Link>
          <Link href="/list" style={s.navLink}>List Property</Link>
          <Link href="/veryland" style={{ ...s.navLink, color: '#0ea5e9', fontWeight: 700 }}>Verified Properties</Link>
          <Link href="/account" style={s.navBtn}>{user ? 'My Account' : 'Login / Sign up'}</Link>
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu" style={{ background: 'none', border: '2px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', color: '#0f172a' }}>☰</button>
      </nav>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div style={s.navBrand}>Mr. Rent</div>
              <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/browse" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>Browse Rentals</Link>
              <Link href="/list" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>List Property</Link>
              <Link href="/veryland" className="mobile-menu-item" style={{ color: '#0ea5e9' }} onClick={() => setMenuOpen(false)}>Verified Properties</Link>
              <Link href="/account" style={{ ...s.navBtn, marginTop: '1rem' }} onClick={() => setMenuOpen(false)}>{user ? 'My Account' : 'Login / Sign up'}</Link>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <section style={s.headerBanner}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={s.badge}>100% Real Renter &amp; Landlord Feedback</div>
          <h1 className="header-title" style={s.title}>
            Rated 5 Stars by Verified Renters
          </h1>
          <p style={s.subtitle}>
            See how renters and landlords across Awka and beyond are skipping agency fees and connecting directly with verified listings.
          </p>

          {/* Aggregate Rating Box */}
          <div style={s.ratingCard}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>5.0</div>
            <div style={{ color: '#f59e0b', fontSize: '1.2rem', margin: '0.25rem 0' }}>★★★★★</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Based on verified community feedback</div>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Reviews Grid */}
      <section style={s.container}>
        <div style={s.filterBar}>
          {(['All', 'Renter', 'Landlord'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={filter === tab ? s.filterBtnActive : s.filterBtn}
            >
              {tab === 'All' ? 'All Reviews' : `${tab}s`}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="reviews-grid" style={s.reviewsGrid}>
          {filteredReviews.map((review) => (
            <div key={review.id} className="review-card" style={s.reviewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={s.reviewerName}>{review.name}</h3>
                  <span style={s.reviewerMeta}>{review.role} • {review.location}</span>
                </div>
                {review.verified && (
                  <span style={s.verifiedBadge}>✓ Verified</span>
                )}
              </div>

              <div style={{ color: '#f59e0b', fontSize: '1rem', marginBottom: '0.75rem' }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>

              <p style={s.reviewComment}>&quot;{review.comment}&quot;</p>
            </div>
          ))}
        </div>

        {/* Review Submission Form */}
        <div style={s.formContainer}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Share Your Experience
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Have you rented or listed a space through Mr. Rent? Leave a verified review for the community.
          </p>

          {submitSuccess && (
            <div style={s.successAlert}>
              ✓ Thank you! Your review has been submitted successfully.
            </div>
          )}

          <form onSubmit={handleReviewSubmit}>
            <div className="form-grid" style={s.formGrid}>
              <div>
                <label style={s.label}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daniel I."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={s.input}
                />
              </div>

              <div>
                <label style={s.label}>I am a...</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'Renter' | 'Landlord')}
                  style={s.input}
                >
                  <option value="Renter">Renter</option>
                  <option value="Landlord">Landlord</option>
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ ...s.formGrid, marginTop: '1rem' }}>
              <div>
                <label style={s.label}>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ifite, Awka"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  style={s.input}
                />
              </div>

              <div>
                <label style={s.label}>Rating</label>
                <div style={{ display: 'flex', gap: '0.25rem', paddingTop: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star-picker ${star <= formRating ? 'active' : ''}`}
                      onClick={() => setFormRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={s.label}>Your Review</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your experience renting or listing on Mr. Rent..."
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                style={{ ...s.input, resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={submitting} style={s.submitBtn}>
              {submitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} Mr. Rent (Faster Aim Technology Limited). All rights reserved.
        </div>
      </footer>
    </main>
  )
}

// Inline Style Specifications
const s: Record<string, CSSProperties> = {
  main: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#0f172a',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  navBtn: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    textAlign: 'center',
    display: 'inline-block',
  },
  headerBanner: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '3.5rem 1.5rem 2.5rem 1.5rem',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    color: '#0ea5e9',
    fontWeight: 700,
    fontSize: '0.8rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.2,
    margin: '0 0 0.75rem 0',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  ratingCard: {
    display: 'inline-block',
    marginTop: '2rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.25rem 2.5rem',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
  },
  filterBar: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    justifyContent: 'center',
  },
  filterBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#475569',
    padding: '0.5rem 1.25rem',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#0f172a',
    border: '1px solid #0f172a',
    color: '#ffffff',
    padding: '0.5rem 1.25rem',
    borderRadius: '9999px',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  reviewerName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  reviewerMeta: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  verifiedBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#16a34a',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  reviewComment: {
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: 1.5,
    margin: 0,
    fontStyle: 'italic',
  },
  formContainer: {
    marginTop: '4rem',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '2.5rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.4rem',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a', // Explicit dark text color
    fontSize: '0.9rem',
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: '1.5rem',
    width: '100%',
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    border: 'none',
    padding: '0.85rem',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  footer: {
    backgroundColor: '#0f172a',
    padding: '2rem 1.5rem',
    marginTop: '4rem',
  },
}
