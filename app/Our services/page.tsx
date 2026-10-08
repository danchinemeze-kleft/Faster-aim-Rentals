import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './services.module.css';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Search property, chat with the AI assistant, list for free, book short-lets and more on Mr. Rent.',
};

type Property = { label: string; href: string };
type Service = { title: string; note: string; href?: string; soon?: boolean };

// Property buttons (oval). Change the label or link, or add a new line.
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
    <main className={styles.page}>
      <h1 className={styles.title}>Our Services</h1>
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
  );
}