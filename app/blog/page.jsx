import Link from "next/link";

export const metadata = {
  title: { absolute: "Blog - Mr. Rent" },
  description:
    "Guides and tips on renting, buying and listing property in Nigeria: avoiding scams, checking documents, inspecting a house and more.",
};

const posts = [
  {
    id: "avoid-rental-scams-nigeria",
    category: "Safety",
    date: "November 6, 2026",
    title: "How to avoid rental scams in Nigeria",
    excerpt: "The warning signs of fake listings and the simple habits that keep your money safe.",
    body: [
      "Rental scams succeed because they create pressure. A fake agent posts a beautiful flat at a price that looks too good, then rushes you to pay before you have seen it.",
      "Watch for these red flags: a price far below similar properties in the area, a landlord who is always \"abroad\" or \"unavailable\", requests for an inspection or commitment fee before you have seen anything, and photos that look copied from elsewhere.",
      "Protect yourself by seeing the property in person, meeting the person who has the right to rent it, checking their ID and documents, and paying by bank transfer to a verified name while keeping every receipt. Never pay for a property you have not seen.",
    ],
  },
  {
    id: "documents-to-check-before-buying",
    category: "Buying",
    date: "November 6, 2026",
    title: "Documents to check before you buy land or a house",
    excerpt: "A plain-language checklist of the papers that prove who owns a property.",
    body: [
      "Buying property is one of the biggest purchases most people make, and forged documents are a known problem. Before paying, ask to see the title documents and have them checked independently.",
      "Common documents include the Certificate of Occupancy, Deed of Assignment, survey plan and, where it applies, government consent. The names, plot numbers and addresses should match across all of them, and the seller should match the paper.",
      "Always involve your own lawyer and a licensed surveyor. Rules and processes differ between states, so professional advice for your location is essential. Mr. Rent's Veryland verification is an extra layer of checking, not a replacement for legal advice.",
    ],
  },
  {
    id: "how-to-inspect-a-property",
    category: "Renting",
    date: "November 6, 2026",
    title: "How to inspect a rental property like a pro",
    excerpt: "What to look at, what to ask and when to walk away.",
    body: [
      "Visit in daylight and bring someone with you. Check water supply, power, drainage, roofing, windows, locks, toilets and kitchen fittings. Run the taps and flush the toilet.",
      "Look at the neighbourhood too: security, noise, road access, transport and distance to work or school. Talk to neighbours about the area and the landlord.",
      "Ask clearly what the rent covers, how long the tenancy runs, what deposits or service charges apply and who handles repairs. Get everything in writing before you sign or pay.",
    ],
  },
  {
    id: "tips-for-landlords-listing",
    category: "Landlords",
    date: "November 6, 2026",
    title: "How landlords can get more serious tenants",
    excerpt: "Better photos, honest details and verification help your property stand out.",
    body: [
      "Good listings are specific. Use clear, recent photos of every key area, state the correct price and terms, and describe the location accurately, including what is nearby.",
      "Complete your profile so tenants can trust there is a real person behind the listing, and respond quickly when someone reaches out. Remove the listing as soon as the property is taken.",
      "Verified documents build trust. Submitting your papers through Veryland can earn a verification badge that shows tenants you are serious and genuine.",
    ],
  },
];

const t = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem 3rem", color: "#e2e8f0", lineHeight: 1.7 },
  h1: { fontSize: "clamp(1.9rem, 5vw, 2.8rem)", color: "#0ef6cc", margin: "0 0 0.5rem", letterSpacing: "-0.02em" },
  lead: { fontSize: "1.05rem", color: "rgba(226,232,240,0.85)", margin: "0 0 1.75rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "2.5rem" },
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(14,246,204,0.15)", borderRadius: "16px", padding: "1.15rem", textDecoration: "none", color: "inherit", display: "block" },
  tag: { display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#f472b6", marginBottom: "0.35rem" },
  cardTitle: { margin: "0 0 0.35rem", fontSize: "1.05rem", color: "#fff" },
  cardText: { margin: 0, fontSize: "0.9rem", color: "rgba(226,232,240,0.8)" },
  article: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(14,246,204,0.15)", borderRadius: "16px", padding: "1.4rem", marginBottom: "1.25rem", scrollMarginTop: "90px" },
  h2: { margin: "0 0 0.25rem", fontSize: "1.4rem", color: "#fff" },
  meta: { margin: "0 0 0.9rem", fontSize: "0.82rem", color: "rgba(148,163,184,0.9)" },
  p: { margin: "0 0 0.8rem", fontSize: "0.97rem", color: "rgba(226,232,240,0.88)" },
  btn: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", background: "#0ef6cc", color: "#0f172a", fontWeight: 700, textDecoration: "none" },
  btnGhost: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", border: "1px solid #0ef6cc", color: "#0ef6cc", fontWeight: 600, textDecoration: "none" },
};

export default function BlogPage() {
  return (
    <main style={t.page}>
      <h1 style={t.h1}>Mr. Rent blog</h1>
      <p style={t.lead}>
        Practical guides for tenants, buyers and landlords across Nigeria. This content is general
        information, not legal or investment advice.
      </p>

      <div style={t.grid}>
        {posts.map((p) => (
          <a key={p.id} href={`#${p.id}`} style={t.card}>
            <span style={t.tag}>{p.category}</span>
            <h2 style={t.cardTitle}>{p.title}</h2>
            <p style={t.cardText}>{p.excerpt}</p>
          </a>
        ))}
      </div>

      {posts.map((p) => (
        <article key={p.id} id={p.id} style={t.article}>
          <span style={t.tag}>{p.category}</span>
          <h2 style={t.h2}>{p.title}</h2>
          <p style={t.meta}>{p.date}</p>
          {p.body.map((para) => (
            <p key={para.slice(0, 30)} style={t.p}>{para}</p>
          ))}

          {/* Support Us link at the end of each article */}
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(14,246,204,0.15)" }}>
            <a
              href="https://paystack.shop/pay/support-mr-rent?src=blog"
              title="Support Mr. Rent's mission, platform development, and growth"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0ef6cc", fontSize: "0.85rem", fontWeight: 600, textDecoration: "underline" }}
            >
              Enjoying this guide? Support Us
            </a>
          </div>
        </article>
      ))}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
        <Link href="/browse" style={t.btn}>Browse rentals</Link>
        <Link href="/safety-tips" style={t.btnGhost}>Safety tips</Link>
        <Link href="/how-it-works" style={t.btnGhost}>How it works</Link>
      </div>
    </main>
  );
}