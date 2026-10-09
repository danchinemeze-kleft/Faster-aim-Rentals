import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import styles from './services.module.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Search property, chat with the AI assistant, list for free, book short-lets and more on Mr. Rent.',
};

type Property = { label: string; href: string };
type Service = { title: string; note: string; href?: string; soon?: boolean };

// Oval property buttons. Change a label or link, or add a new line.
const properties: Property[] = [
  { label: 'Houses and flats', href: '/browse?type=house' },
  { label: 'Rooms and self-contain', href: '/browse?type=room' },
  { label: 'Shops and offices', href: '/browse?type=commercial' },
  { label: 'Warehouses and plazas', href: '/browse?type=warehouse' },
  { label: 'Hotels and guest houses', href: '/browse?type=hotel' },
  { label: 'Hostels', href: '/browse?type=hostel' },
  { label: 'Shortlet apartments', href: '/browse?type=shortlet' },
  { label: 'Event centres', href: '/browse?type=event-centre' },
  { label: 'Land and farmland', href: '/browse?type=land' },
];

// Service buttons. Set soon: true to show "Coming soon" with no link.
const services: Service[] = [
  { title: 'AI Assistant', note: 'Ask any property question', href: '/search' },
  { title: 'List a Property', note: 'First 2 listings free', href: '/list' },
  { title: 'Contact Reveal', note: "See the owner's number", href: '/browse' },
  { title: 'Document Check', note: 'Veryland verification', soon: true },
  { title: 'Short-let Booking', note: 'Book and pay online', href: '/browse?type=shortlet' },
  { title: 'Pro Tier', note: 'Price and market insight', soon: true },
  { title: 'Services Marketplace', note: 'Legal, inspection, moving', href: '/marketplace' },
  { title: 'Earn as Affiliate', note: 'Share and get paid', href: '/affiliate/auth' },
  { title: 'Android App', note: 'Search from your phone', soon: true },
];

const prices: { name: string; price: string }[] = [
  { name: 'Search and AI chat', price: 'Free' },
  { name: 'First 2 listings', price: 'Free' },
  { name: 'Contact reveal', price: '\u20A65,000' },
  { name: 'Landlord plan', price: '\u20A610,000 / month' },
  { name: 'Bookings', price: '9% commission' },
];

export default function ServicesPage() {
  return (
    <div className={`${jakarta.className} ${styles.wrap}`}>
      {/* Navbar (same look as the homepage) */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, color: '#0ea5e9' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Mr. Rent
        </Link>
        <div className={styles.navRight}>
          <Link href="/browse" className={styles.navLink}>Browse Rentals</Link>
          <Link href="/list" className={styles.navLink}>List Property</Link>
          <Link href="/account" className={styles.navBtn}>Get started</Link>
        </div>
      </nav>

      <main className={styles.page}>
        <h1 className={styles.title}>
          Our <span>Services</span>
        </h1>
        <p className={styles.sub}>Everything Mr. Rent does, one tap away.</p>

        <h2 className={styles.heading}>Find property</h2>
        <div className={styles.grid}>
          {properties.map((p) => (
            <Link key={p.label} href={p.href} className={`${styles.btn} ${styles.pill}`}>
              {p.label}
            </Link>
          ))}
        </div>

        <h2 className={styles.heading}>What you can do</h2>
        <div className={styles.grid}>
          {services.map((s) =>
            s.soon || !s.href ? (
              <span
                key={s.title}
                className={`${styles.btn} ${styles.card} ${styles.soon}`}
                aria-disabled="true"
              >
                <b>{s.title}</b>
                <small>{s.note}</small>
                <em>Coming soon</em>
              </span>
            ) : (
              <Link key={s.title} href={s.href} className={`${styles.btn} ${styles.card}`}>
                <b>{s.title}</b>
                <small>{s.note}</small>
              </Link>
            )
          )}
        </div>

        <h2 className={styles.heading}>Prices</h2>
        <ul className={styles.prices}>
          {prices.map((p) => (
            <li key={p.name}>
              <span>{p.name}</span>
              <b>{p.price}</b>
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          <Link href="/search" className={`${styles.btn} ${styles.pill} ${styles.main}`}>
            Start Searching
          </Link>
          <Link href="/list" className={`${styles.btn} ${styles.pill} ${styles.alt}`}>
            Create a Free Listing
          </Link>
        </div>
      </main>

      {/* Footer (same look as the homepage) */}
      <footer className={styles.footer}>
        <div className={styles.footerCard}>
          <div className={styles.footerLinks}>
            <Link href="/browse">Browse Rentals</Link>
            <Link href="/list">List Property</Link>
            <Link href="/about">About Us</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <p className={styles.copy}>&copy; {new Date().getFullYear()} Mr. Rent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}