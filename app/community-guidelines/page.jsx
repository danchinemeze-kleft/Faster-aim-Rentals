import Link from "next/link";

export const metadata = {
  title: { absolute: "Community Guidelines - Mr. Rent" },
  description:
    "The rules for using Mr. Rent: honest listings, respectful behaviour, no scams, no fake reviews and how we enforce them.",
};

const t = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem 3rem", color: "#e2e8f0", lineHeight: 1.7 },
  h1: { fontSize: "clamp(1.9rem, 5vw, 2.8rem)", color: "#0ef6cc", margin: "0 0 0.5rem", letterSpacing: "-0.02em" },
  lead: { fontSize: "1.05rem", color: "rgba(226,232,240,0.85)", margin: "0 0 1.75rem" },
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(14,246,204,0.15)", borderRadius: "16px", padding: "1.25rem 1.4rem", marginBottom: "1rem" },
  h2: { margin: "0 0 0.5rem", fontSize: "1.2rem", color: "#fff" },
  list: { margin: 0, paddingLeft: "1.2rem", color: "rgba(226,232,240,0.85)", fontSize: "0.96rem" },
  btn: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", background: "#0ef6cc", color: "#0f172a", fontWeight: 700, textDecoration: "none" },
  btnGhost: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", border: "1px solid #0ef6cc", color: "#0ef6cc", fontWeight: 600, textDecoration: "none" },
  link: { color: "#0ef6cc" },
};

const sections = [
  {
    h: "1. Be honest",
    items: [
      "List only properties you own or are authorised to rent or sell.",
      "Use real, recent photos of the actual property. Do not use photos taken from other listings or the internet.",
      "State the correct price, location, size, condition and terms. Do not hide fees or conditions.",
      "Remove or mark a listing once the property is no longer available.",
      "Do not post duplicate listings of the same property.",
    ],
  },
  {
    h: "2. Be respectful",
    items: [
      "Treat every landlord, agent, tenant, buyer and member of our team with courtesy.",
      "No harassment, threats, hate speech or abusive language.",
      "No discrimination in listings or conversations based on tribe, religion, gender, disability or similar grounds.",
      "Do not share anyone's personal details without their permission.",
    ],
  },
  {
    h: "3. Keep transactions safe and fair",
    items: [
      "Do not use Mr. Rent to defraud, deceive or pressure anyone into paying.",
      "Do not submit forged, altered or misleading property documents. Verification is there to protect users.",
      "Do not use contact details you obtain on Mr. Rent for spam, marketing or any purpose other than the property enquiry.",
      "Do not try to bypass platform fees or features, for example by sharing contact details through the chat or listing text to avoid the contact reveal process.",
      "Never ask anyone for their password, PIN or OTP.",
    ],
  },
  {
    h: "4. Keep reviews and referrals genuine",
    items: [
      "Post reviews only about your real experience. No fake, paid or repeated reviews.",
      "Do not create fake accounts, use bots or self-refer to earn referral rewards.",
      "Do not manipulate views, likes, ratings or any reward system.",
    ],
  },
  {
    h: "5. Use the AI assistant responsibly",
    items: [
      "Use the assistant for real property questions. Do not try to abuse, overload or trick it.",
      "Treat its answers, including price insights, as guidance only, not legal or investment advice. Verify important details with qualified professionals.",
    ],
  },
  {
    h: "6. Professionals on Mr. Rent",
    items: [
      "Lawyers, surveyors and other professionals must give accurate details about their qualifications and experience.",
      "Do not claim to be verified unless Mr. Rent has verified you.",
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <main style={t.page}>
      <h1 style={t.h1}>Community guidelines</h1>
      <p style={t.lead}>
        Mr. Rent only works when people trust each other. These guidelines apply to everyone who uses
        our website, apps, listings, chat and referral programme. By using Mr. Rent you agree to follow
        them, together with our <Link href="/terms" style={t.link}>Terms of Service</Link>.
      </p>

      {sections.map((s) => (
        <section key={s.h} style={t.card}>
          <h2 style={t.h2}>{s.h}</h2>
          <ul style={t.list}>
            {s.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
      ))}

      <section style={t.card}>
        <h2 style={t.h2}>What happens if the guidelines are broken</h2>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.96rem", color: "rgba(226,232,240,0.85)" }}>
          Depending on how serious the breach is, we may remove a listing or review, withhold referral
          rewards, warn you, suspend or permanently close your account and, where fraud or other crime
          is involved, share relevant information with the authorities.
        </p>
        <p style={{ margin: 0, fontSize: "0.96rem", color: "rgba(226,232,240,0.85)" }}>
          If you believe we made a mistake, email{" "}
          <a href="mailto:info@fasteraim.com" style={t.link}>info@fasteraim.com</a> and we will review it.
        </p>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
        <Link href="/report" style={t.btn}>Report a problem</Link>
        <Link href="/safety-tips" style={t.btnGhost}>Safety tips</Link>
        <Link href="/privacy-policy" style={t.btnGhost}>Privacy policy</Link>
      </div>
    </main>
  );
}