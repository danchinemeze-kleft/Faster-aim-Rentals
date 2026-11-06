import Link from "next/link";

export const metadata = {
  title: { absolute: "Cookie Policy - Mr. Rent" },
  description:
    "How Mr. Rent uses cookies and similar technologies such as local storage, analytics and payment services, and how you can control them.",
};

const t = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem 3rem", color: "#e2e8f0", lineHeight: 1.7 },
  h1: { fontSize: "clamp(1.9rem, 5vw, 2.8rem)", color: "#0ef6cc", margin: "0 0 0.35rem", letterSpacing: "-0.02em" },
  date: { fontSize: "0.85rem", color: "rgba(148,163,184,0.9)", margin: "0 0 1.5rem" },
  p: { fontSize: "0.96rem", color: "rgba(226,232,240,0.85)", margin: "0 0 0.9rem" },
  h2: { fontSize: "1.25rem", color: "#fff", margin: "1.75rem 0 0.6rem" },
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(14,246,204,0.15)", borderRadius: "16px", padding: "1rem 1.25rem", marginBottom: "0.9rem" },
  cardTitle: { margin: "0 0 0.3rem", fontSize: "1.02rem", color: "#0ef6cc" },
  list: { margin: 0, paddingLeft: "1.2rem", fontSize: "0.96rem", color: "rgba(226,232,240,0.85)" },
  link: { color: "#0ef6cc" },
};

const types = [
  {
    h: "Essential (always on)",
    p: "These keep the site working and secure. They remember that you are signed in, keep your session safe and let you complete payments. Without them, features such as login, listing a property or revealing a contact will not work. This includes sign-in with Google or Facebook where you choose to use it.",
  },
  {
    h: "Preferences and chat memory",
    p: "Mr. Rent stores some information in your browser's local storage, such as your recent AI chat messages and search preferences, so the assistant can remember context. This is kept for about 3 days and stays on your device.",
  },
  {
    h: "Analytics",
    p: "We use Google Analytics to understand how visitors use the site, for example which pages are popular and how fast they load. This helps us improve Mr. Rent. The data is aggregated and is not used to identify you personally.",
  },
  {
    h: "Payments",
    p: "When you pay a fee, you are handled by our payment partner Paystack, which may set its own cookies to process the payment and prevent fraud.",
  },
];

export default function CookiePolicyPage() {
  return (
    <main style={t.page}>
      <h1 style={t.h1}>Cookie policy</h1>
      <p style={t.date}>Last updated: November 6, 2026</p>

      <p style={t.p}>
        This policy explains how Mr. Rent, operated by Faster Aim Technology Limited, uses cookies and
        similar technologies when you visit rent.fasteraim.com or use our apps. It should be read with
        our <Link href="/privacy-policy" style={t.link}>Privacy Policy</Link>.
      </p>

      <h2 style={t.h2}>What are cookies?</h2>
      <p style={t.p}>
        Cookies are small text files saved on your device when you visit a website. Similar
        technologies, such as local storage, do the same job. They help a site remember who you are,
        keep you signed in and understand how it is used.
      </p>

      <h2 style={t.h2}>How we use them</h2>
      {types.map((x) => (
        <div key={x.h} style={t.card}>
          <h3 style={t.cardTitle}>{x.h}</h3>
          <p style={{ ...t.p, margin: 0 }}>{x.p}</p>
        </div>
      ))}

      <h2 style={t.h2}>Third-party services</h2>
      <p style={t.p}>
        Some cookies are set by services we use, including Google (analytics and sign-in), Facebook
        (sign-in), Supabase (authentication) and Paystack (payments). These providers have their own
        privacy and cookie policies, and we do not control how they use their cookies.
      </p>

      <h2 style={t.h2}>Your choices</h2>
      <ul style={t.list}>
        <li>You can block or delete cookies in your browser settings. Essential cookies are needed for login and payments, so blocking them will break parts of the site.</li>
        <li>You can clear local storage, which removes your saved chat history, from your browser's site data settings.</li>
        <li>You can sign out at any time, which ends your session.</li>
        <li>You can opt out of Google Analytics using Google's browser add-on.</li>
      </ul>

      <h2 style={t.h2}>Changes to this policy</h2>
      <p style={t.p}>
        We may update this policy when our services change. The date at the top shows when it was last
        revised. Continued use of Mr. Rent means you accept the updated policy.
      </p>

      <h2 style={t.h2}>Contact us</h2>
      <p style={t.p}>
        Questions about cookies or your data? Email{" "}
        <a href="mailto:info@fasteraim.com" style={t.link}>info@fasteraim.com</a> or visit
        our <Link href="/support" style={t.link}>support page</Link>.
      </p>
    </main>
  );
}