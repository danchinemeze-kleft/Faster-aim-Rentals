import Breadcrumb from '../components/Breadcrumb'
import SupportForm from './SupportForm'

export const metadata = {
  title: 'Support',
  description:
    'Need help with Mr. Rent? Call, email or message us. Get quick answers about contact reveals, payments, listing a property and reporting scams.',
}

/* ── Edit contact details here ───────────────────────────── */
const CONTACT = {
  phone: '+2348032851976',
  phoneDisplay: '0803 285 1976',
  email: 'info@fasteraim.com',
  address: '13 Barr Nso Street, Awada Obosi, Onitsha, Anambra State',
  hours: 'Monday to Saturday, 8am to 6pm',
  reply: 'within 24 hours',
}

/* ── Social links: to add one, copy a line and change it ──── */
const SOCIALS = [
  {
    label: 'Follow Faster Aim Technology on Facebook',
    href: 'https://www.facebook.com/fasteraimtechnology',
    icon: '👍',
    primary: true,
  },
  {
    label: 'Join our Facebook community',
    href: 'https://www.facebook.com/share/g/1CTJQsjESZ/',
    icon: '👥',
  },
  // { label: 'Follow us on Instagram', href: 'https://instagram.com/...', icon: '📸' },
  // { label: 'Watch us on YouTube', href: 'https://youtube.com/...', icon: '▶️' },
]

const FAQS = [
  {
    q: 'How does contact reveal work?',
    a: 'Searching and browsing are free. When you find a property you like, pay a one-time ₦5,000 to reveal the landlord’s phone number. Your revealed contacts are saved under Saved Contacts in your account.',
  },
  {
    q: 'I paid but I cannot see the landlord’s contact.',
    a: 'Wait a minute, then refresh My Account and open Saved Contacts. If it is still missing, send us your payment reference and the property title using the form on this page and we will fix it.',
  },
  {
    q: 'How do I list a property?',
    a: 'Log in, complete your profile (name and phone number), then go to List a Property. Landlords can list 2 properties free each month, and a ₦10,000 monthly subscription lets you list more. New listings go live after a quick review, usually within 24 hours.',
  },
  {
    q: 'Why must I add a phone number to my profile?',
    a: 'We collect contact details from your profile so landlords and tenants can reach each other safely. You need a phone number on your profile before you can list a property or reveal a contact.',
  },
  {
    q: 'How do I report a scam or a fake listing?',
    a: 'Use the form on this page, choose “Report a scam or fake listing”, and include the link to the listing. Reports go straight to our team.',
  },
  {
    q: 'What about refunds?',
    a: 'Our refund rules are on the Refund Policy page. If you think a payment was charged by mistake, contact us with your payment reference.',
    link: { href: '/refund-policy', label: 'Read the Refund Policy →' },
  },
]

const SAFETY = [
  'Always inspect a property in person before you pay rent or any deposit.',
  'Never send money to someone you have not met, even if the photos look perfect.',
  'Check that the person you meet is the landlord or an authorised agent, and ask for proof.',
  'Be careful of prices that look too good to be true.',
  'If something feels wrong, stop and report it to us.',
]

export default function SupportPage() {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`

  return (
    <div className="faim-sp-page">
      <div className="faim-sp-wrap">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Support', href: '/support' }]} />

        <header className="faim-sp-hero">
          <h1>How can we help?</h1>
          <p>
            Questions about a payment, a listing or your account? Reach us any way below. We are
            available {CONTACT.hours} and reply {CONTACT.reply}.
          </p>
        </header>

        {/* Contact options */}
        <section className="faim-sp-cards" aria-label="Ways to contact us">
          <a className="faim-sp-card" href={`tel:${CONTACT.phone}`}>
            <span className="faim-sp-icon">📞</span>
            <span className="faim-sp-card-title">Call us</span>
            <span className="faim-sp-card-text">{CONTACT.phoneDisplay}</span>
          </a>
          <a className="faim-sp-card" href={`mailto:${CONTACT.email}`}>
            <span className="faim-sp-icon">✉️</span>
            <span className="faim-sp-card-title">Email us</span>
            <span className="faim-sp-card-text">{CONTACT.email}</span>
          </a>
          <a className="faim-sp-card" href={mapsHref} target="_blank" rel="noopener noreferrer">
            <span className="faim-sp-icon">📍</span>
            <span className="faim-sp-card-title">Visit our office</span>
            <span className="faim-sp-card-text">{CONTACT.address}</span>
          </a>
        </section>

        {/* Form */}
        <section className="faim-sp-section" id="contact-form">
          <h2>Send us a message</h2>
          <p className="faim-sp-muted">
            Fill in the form and our team will reply by email {CONTACT.reply}.
          </p>
          <SupportForm />
        </section>

        {/* FAQ */}
        <section className="faim-sp-section">
          <h2>Quick answers</h2>
          <div className="faim-sp-faq">
            {FAQS.map((item) => (
              <details key={item.q} className="faim-sp-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
                {item.link && (
                  <p>
                    <a href={item.link.href} className="faim-sp-link">{item.link.label}</a>
                  </p>
                )}
              </details>
            ))}
          </div>
          <p className="faim-sp-muted" style={{ marginTop: '1rem' }}>
            More answers are on our <a href="/faq" className="faim-sp-link">FAQ page</a>.
          </p>
        </section>

        {/* Safety */}
        <section className="faim-sp-section faim-sp-safety">
          <h2>🛡️ Stay safe when searching for rentals</h2>
          <ul>
            {SAFETY.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        {/* Social */}
        <section className="faim-sp-section">
          <h2>Stay connected</h2>
          <p className="faim-sp-muted">Follow us for new listings, tips and updates.</p>
          <div className="faim-sp-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`faim-sp-social ${s.primary ? 'faim-sp-social--primary' : ''}`}
              >
                <span>{s.icon}</span> {s.label}
              </a>
            ))}
          </div>
        </section>

        <p className="faim-sp-legal">
          <a href="/terms-of-service">Terms of Service</a> · <a href="/privacy-policy">Privacy Policy</a> ·{' '}
          <a href="/refund-policy">Refund Policy</a>
        </p>
      </div>

      <style>{`.faim-sp-page {
  /* All colours derive from --text-1, so they flip with your theme toggle.
     Dark text in light mode, light text in dark mode. */
  --sp-text: var(--text-1, #fff);
  --sp-text-soft: color-mix(in srgb, var(--text-1, #fff) 88%, transparent);
  --sp-text-faint: color-mix(in srgb, var(--text-1, #fff) 68%, transparent);
  --sp-line: color-mix(in srgb, var(--text-1, #fff) 42%, transparent);
  --sp-line-soft: color-mix(in srgb, var(--text-1, #fff) 28%, transparent);
  /* Cyan turns dark teal on white and stays bright on black */
  --sp-accent-text: color-mix(in srgb, #0ef6cc 30%, var(--text-1, #fff));
  --sp-ok: color-mix(in srgb, #27ae60 55%, var(--text-1, #fff));
  --sp-err: color-mix(in srgb, #e74c3c 55%, var(--text-1, #fff));
  min-height:100vh; background:var(--page-bg); color:var(--sp-text); font-family:'Segoe UI',system-ui,sans-serif; padding:1.5rem 1rem 4rem;
}
.faim-sp-wrap { max-width:960px; margin:0 auto; }
.faim-sp-hero { text-align:center; padding:2rem 0 1.5rem; }
.faim-sp-hero h1 { font-size:2rem; font-weight:700; color:var(--sp-accent-text); margin:0 0 0.75rem; }
.faim-sp-hero p { color:var(--sp-text-soft); font-size:1.05rem; line-height:1.7; max-width:620px; margin:0 auto; }
.faim-sp-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1rem; margin-bottom:2rem; }
.faim-sp-card { background:var(--card-bg); border:1.5px solid var(--sp-line); border-radius:14px; padding:1.5rem 1.25rem; text-decoration:none; text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px; box-shadow:var(--shadow-card); transition:transform .15s, border-color .15s; }
.faim-sp-card:hover { transform:translateY(-2px); border-color:var(--sp-accent-text); }
.faim-sp-icon { font-size:1.8rem; }
.faim-sp-card-title { font-size:1rem; font-weight:700; color:var(--sp-text); }
.faim-sp-card-text { font-size:0.95rem; color:var(--sp-text-soft); line-height:1.5; word-break:break-word; }
.faim-sp-section { background:var(--card-bg); border:1.5px solid var(--sp-line); border-radius:16px; padding:1.75rem 1.5rem; margin-bottom:1.5rem; box-shadow:var(--shadow-card); }
.faim-sp-section h2 { font-size:1.3rem; font-weight:700; color:var(--sp-text); margin:0 0 0.5rem; }
.faim-sp-muted { color:var(--sp-text-soft); font-size:0.95rem; line-height:1.6; margin:0 0 1rem; }
.faim-sp-link { color:var(--sp-accent-text); text-decoration:underline; font-weight:600; }
.faim-sp-link:hover { text-decoration:none; }

.faim-sp-form { display:flex; flex-direction:column; gap:1rem; }
.faim-sp-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
.faim-sp-field { display:flex; flex-direction:column; gap:6px; }
.faim-sp-field label { font-size:0.95rem; font-weight:700; color:var(--sp-text); }
.faim-sp-field input, .faim-sp-field select, .faim-sp-field textarea { padding:0.7rem 0.95rem; border:1.5px solid var(--sp-line); border-radius:9px; font-size:1rem; color:var(--sp-text); background:var(--input-bg); outline:none; font-family:inherit; width:100%; box-sizing:border-box; }
.faim-sp-field input:focus, .faim-sp-field select:focus, .faim-sp-field textarea:focus { border-color:var(--sp-accent-text); box-shadow:0 0 0 3px color-mix(in srgb, var(--sp-accent-text) 25%, transparent); }
.faim-sp-field input::placeholder, .faim-sp-field textarea::placeholder { color:var(--sp-text-faint); }
.faim-sp-hp { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
.faim-sp-submit { background:#0ef6cc; color:#080a0f; border:1.5px solid #080a0f; padding:0.85rem 1.5rem; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:opacity .15s; }
.faim-sp-submit:hover { opacity:0.9; }
.faim-sp-submit:disabled { opacity:0.6; cursor:not-allowed; }
.faim-sp-alert { padding:0.75rem 1rem; border-radius:8px; font-size:0.95rem; line-height:1.5; }
.faim-sp-alert--error { background:color-mix(in srgb, #e74c3c 12%, transparent); color:var(--sp-err); border:1.5px solid var(--sp-err); }
.faim-sp-alert--ok { background:color-mix(in srgb, #27ae60 12%, transparent); color:var(--sp-ok); border:1.5px solid var(--sp-ok); }

.faim-sp-faq { display:flex; flex-direction:column; gap:0.75rem; margin-top:0.75rem; }
.faim-sp-faq-item { background:var(--card-bg2); border:1.5px solid var(--sp-line-soft); border-radius:10px; padding:0.9rem 1.1rem; }
.faim-sp-faq-item summary { cursor:pointer; font-weight:600; color:var(--sp-text); font-size:1rem; }
.faim-sp-faq-item p { color:var(--sp-text-soft); font-size:0.95rem; line-height:1.7; margin:0.6rem 0 0; }

.faim-sp-safety { border-color:#d35400; }
.faim-sp-safety ul { margin:0.5rem 0 0; padding-left:1.2rem; color:var(--sp-text-soft); font-size:0.95rem; line-height:1.9; }

.faim-sp-socials { display:flex; flex-wrap:wrap; gap:0.75rem; margin-top:0.5rem; }
.faim-sp-social { display:inline-flex; align-items:center; gap:8px; padding:0.7rem 1.2rem; border:1.5px solid var(--sp-line); border-radius:10px; color:var(--sp-text); text-decoration:none; font-weight:600; font-size:0.95rem; transition:all .15s; }
.faim-sp-social:hover { border-color:var(--sp-accent-text); color:var(--sp-accent-text); }
.faim-sp-social--primary { background:#0ef6cc; border-color:#080a0f; color:#080a0f; }
.faim-sp-social--primary:hover { color:#080a0f; opacity:0.9; }

.faim-sp-legal { text-align:center; font-size:0.85rem; color:var(--sp-text-faint); margin-top:1rem; }
.faim-sp-legal a { color:var(--sp-text-soft); text-decoration:underline; }
.faim-sp-legal a:hover { color:var(--sp-accent-text); }
@media (max-width:480px) { .faim-sp-hero h1 { font-size:1.6rem; } .faim-sp-section { padding:1.25rem 1rem; } }`}</style>
    </div>
  )
}