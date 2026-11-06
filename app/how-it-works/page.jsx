import Link from "next/link";

export const metadata = {
  title: { absolute: "How It Works - Mr. Rent" },
  description:
    "Learn how Mr. Rent works for tenants, buyers and landlords: search with AI, verify documents with Veryland, reveal contacts safely and list your property.",
};

const t = {
  page: { maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem 3rem", color: "#e2e8f0", lineHeight: 1.7 },
  h1: { fontSize: "clamp(1.9rem, 5vw, 2.8rem)", color: "#0ef6cc", margin: "0 0 0.5rem", letterSpacing: "-0.02em" },
  lead: { fontSize: "1.05rem", color: "rgba(226,232,240,0.85)", maxWidth: "660px", margin: "0 0 2rem" },
  h2: { fontSize: "1.5rem", color: "#fff", margin: "2rem 0 1rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" },
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(14,246,204,0.15)", borderRadius: "16px", padding: "1.25rem" },
  num: { display: "inline-flex", width: "32px", height: "32px", borderRadius: "50%", background: "#f472b6", color: "#0f172a", fontWeight: 800, alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" },
  h3: { margin: "0 0 0.35rem", fontSize: "1.02rem", color: "#fff" },
  p: { margin: 0, fontSize: "0.92rem", color: "rgba(226,232,240,0.8)" },
  note: { marginTop: "1rem", fontSize: "0.9rem", color: "rgba(148,163,184,0.9)" },
  btn: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", background: "#0ef6cc", color: "#0f172a", fontWeight: 700, textDecoration: "none" },
  btnGhost: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", border: "1px solid #0ef6cc", color: "#0ef6cc", fontWeight: 600, textDecoration: "none" },
};

const tenants = [
  { h: "Search or ask the AI", p: "Browse listings, or chat with the Mr. Rent AI assistant in plain language. Tell it the city, budget and type of property you want." },
  { h: "Create a free account", p: "Sign up with Google or email and complete your profile, including your phone number. Prices are shown to signed-in users." },
  { h: "Check the property", p: "Look at the photos, details and any verification badge. Always inspect in person before paying anything." },
  { h: "Reveal the contact", p: "Pay the one-time contact reveal fee on the platform to get the landlord or agent's contact. The fee is shown before you pay." },
];

const landlords = [
  { h: "Sign up and complete your profile", p: "Add your name, email and phone number so tenants know a real person is behind the listing." },
  { h: "List your property", p: "Add clear photos, an honest description, the location and your price. You can list a limited number of properties free." },
  { h: "Get verified with Veryland", p: "Submit your property documents for review. Approved documents earn a verification badge that builds tenant trust." },
  { h: "Connect with serious tenants", p: "Interested tenants reveal your contact and reach you directly. Upgrade when you need to list more properties." },
];

export default function HowItWorksPage() {
  return (
    <main style={t.page}>
      <h1 style={t.h1}>How Mr. Rent works</h1>
      <p style={t.lead}>
        Mr. Rent is an AI-powered property marketplace for Nigeria. Whether you want to rent, buy or
        list land, houses, shops or event centres, here is how it works from start to finish.
      </p>

      <h2 style={t.h2}>For tenants and buyers</h2>
      <div style={t.grid}>
        {tenants.map((s, i) => (
          <div key={s.h} style={t.card}>
            <span style={t.num}>{i + 1}</span>
            <h3 style={t.h3}>{s.h}</h3>
            <p style={t.p}>{s.p}</p>
          </div>
        ))}
      </div>

      <h2 style={t.h2}>For landlords, agents and sellers</h2>
      <div style={t.grid}>
        {landlords.map((s, i) => (
          <div key={s.h} style={t.card}>
            <span style={t.num}>{i + 1}</span>
            <h3 style={t.h3}>{s.h}</h3>
            <p style={t.p}>{s.p}</p>
          </div>
        ))}
      </div>

      <h2 style={t.h2}>What makes Mr. Rent different</h2>
      <div style={t.grid}>
        <div style={t.card}>
          <h3 style={t.h3}>AI assistant</h3>
          <p style={t.p}>Ask about properties, areas, typical prices and what to look out for. If we cannot find a match, the assistant says so honestly and suggests the nearest options.</p>
        </div>
        <div style={t.card}>
          <h3 style={t.h3}>Veryland verification</h3>
          <p style={t.p}>Property documents are reviewed before a verification badge is shown, to help reduce forged papers and fake listings.</p>
        </div>
        <div style={t.card}>
          <h3 style={t.h3}>Secure payments</h3>
          <p style={t.p}>Platform fees are processed through Paystack. We never ask for your card PIN, OTP or password.</p>
        </div>
        <div style={t.card}>
          <h3 style={t.h3}>Referral rewards</h3>
          <p style={t.p}>Refer friends and earn through the affiliate programme, then track your balance in your wallet.</p>
        </div>
      </div>
      <p style={t.note}>
        Mr. Rent connects people and gives you tools to check a property, but it is not a party to
        your tenancy or sale. Read our <Link href="/safety-tips" style={{ color: "#0ef6cc" }}>safety tips</Link> and
        always verify before you pay.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2rem" }}>
        <Link href="/browse" style={t.btn}>Browse rentals</Link>
        <Link href="/list" style={t.btnGhost}>List a property</Link>
        <Link href="/faq" style={t.btnGhost}>Read the FAQ</Link>
      </div>
    </main>
  );
}