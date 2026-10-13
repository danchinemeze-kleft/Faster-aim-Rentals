import Link from 'next/link'

// Keep this page out of search engines
export const metadata = {
  title: 'Admin hub | Mr. Rent',
  robots: { index: false, follow: false },
}

const LINKS = [
  { href: '/admin', title: 'Main admin', note: 'Dashboard (asks for the admin password)' },
  { href: '/admin/veryland', title: 'Veryland admin', note: 'Review landlord documents and badges' },
  { href: '/admin/professionals', title: 'Professionals admin', note: 'Approve lawyers and surveyors' },
]

export default function AdminHub() {
  return (
    <main className="faim-hub">
      <style>{css}</style>
      <div className="faim-hub-card">
        <h1>Mr. Rent</h1>
        <p>Admin hub</p>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="faim-hub-btn">
            <strong>{l.title}</strong>
            <span>{l.note}</span>
          </Link>
        ))}
        <Link href="/" className="faim-hub-home">Back to the website</Link>
      </div>
    </main>
  )
}

const css = `
.faim-hub{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;background:#05090d;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
.faim-hub-card{width:100%;max-width:420px;padding:1.75rem 1.25rem;border:1px solid #1e2a33;border-radius:20px;background:#0c1319;text-align:center}
.faim-hub-card h1{margin:0;color:#14f1d0;font-size:1.5rem;font-weight:700}
.faim-hub-card p{margin:.25rem 0 1.25rem;color:#94a3b8;font-size:.9rem}
.faim-hub-btn{display:flex;flex-direction:column;gap:.2rem;min-height:64px;justify-content:center;margin-top:.75rem;padding:.8rem 1rem;border:1.5px solid #14f1d0;border-radius:14px;color:#e8fffb;text-decoration:none;text-align:left}
.faim-hub-btn:hover,.faim-hub-btn:focus-visible{background:#14f1d0;color:#05090d;outline:none}
.faim-hub-btn strong{font-size:1rem;font-weight:600}
.faim-hub-btn span{font-size:.8rem;font-weight:400;opacity:.8}
.faim-hub-home{display:inline-block;margin-top:1.25rem;color:#64748b;font-size:.85rem;text-decoration:none}
`