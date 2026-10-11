import Link from 'next/link'
import Image from 'next/image'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

export const metadata = {
  title: 'Page Not Found - Mr. Rent',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main className={`${jakarta.className} faim-nf`}>
      <style>{CSS}</style>

      <div className="faim-nf-card">
        <div className="faim-nf-avatar">
          <Image src="/mr-rent-avatar.png" alt="Mr. Rent" fill sizes="120px" style={{ objectFit: 'cover', objectPosition: 'center 15%' }} priority />
        </div>

        <p className="faim-nf-code">404</p>
        <h1>This page has moved out</h1>
        <p className="faim-nf-msg">
          We couldn’t find the page you were looking for. The link may be wrong, or the page may have
          been moved or removed. No wahala, you are in good hands, so let’s get you to the right place.
        </p>

        <div className="faim-nf-actions">
          <Link href="/browse" className="faim-nf-btn faim-nf-btn-primary">Browse Rentals</Link>
          <Link href="/" className="faim-nf-btn faim-nf-btn-teal">Back to Home</Link>
        </div>

        <div className="faim-nf-links">
          <Link href="/search">Ask Mr. Rent AI</Link>
          <span aria-hidden="true">•</span>
          <Link href="/all-pages">See all pages</Link>
          <span aria-hidden="true">•</span>
          <Link href="/support">Contact support</Link>
        </div>
      </div>
    </main>
  )
}

const CSS = `
.faim-nf{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;color:#0f172a;
  background:radial-gradient(700px 360px at 85% 0%,rgba(14,165,233,.14),transparent 60%),
             radial-gradient(700px 360px at 10% 100%,rgba(20,184,166,.14),transparent 60%),#f8fafc}
.faim-nf *{box-sizing:border-box}
.faim-nf-card{width:100%;max-width:560px;text-align:center;background:#fff;border:1px solid #e2e8f0;border-bottom:4px solid #14b8a6;
  border-radius:24px;padding:40px 28px 32px;box-shadow:0 24px 50px -24px rgba(15,23,42,.22)}
.faim-nf-avatar{position:relative;width:104px;height:104px;margin:0 auto 14px;border-radius:50%;overflow:hidden;
  border:4px solid #fff;background:#f1f5f9;box-shadow:0 0 0 3px rgba(20,184,166,.35),0 12px 24px -10px rgba(15,23,42,.3)}
.faim-nf-code{margin:0;font-size:clamp(64px,16vw,96px);font-weight:800;line-height:1;letter-spacing:-.03em;
  background:linear-gradient(135deg,#0ea5e9,#14b8a6);-webkit-background-clip:text;background-clip:text;color:transparent}
.faim-nf h1{margin:8px 0 12px;font-size:clamp(22px,5vw,28px);font-weight:800;letter-spacing:-.01em}
.faim-nf-msg{margin:0 auto 26px;max-width:440px;color:#64748b;font-size:16px;line-height:1.65}
.faim-nf-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:22px}
.faim-nf-btn{text-decoration:none;color:#fff;font-weight:700;padding:13px 24px;border-radius:12px;
  transition:transform .15s,box-shadow .15s}
.faim-nf-btn:hover{transform:translateY(-3px)}
.faim-nf-btn-primary{background:#0ea5e9;box-shadow:0 8px 20px -6px rgba(14,165,233,.5)}
.faim-nf-btn-teal{background:#14b8a6;box-shadow:0 8px 20px -6px rgba(20,184,166,.5)}
.faim-nf-links{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;font-size:14px;color:#94a3b8}
.faim-nf-links a{color:#0ea5e9;text-decoration:none;font-weight:600}
.faim-nf-links a:hover{text-decoration:underline}
@media (prefers-reduced-motion:reduce){.faim-nf-btn{transition:none}}
`