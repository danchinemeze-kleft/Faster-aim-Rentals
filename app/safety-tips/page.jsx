import Link from "next/link";

export const metadata = {
  title: { absolute: "Safety Tips - Mr. Rent" },
  description:
    "Practical safety tips for renting or buying property in Nigeria: how to spot fake listings, verify documents, inspect safely and pay without being scammed.",
};

const t = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem 3rem", color: "#e2e8f0", lineHeight: 1.7 },
  h1: { fontSize: "clamp(1.9rem, 5vw, 2.8rem)", color: "#0ef6cc", margin: "0 0 0.5rem", letterSpacing: "-0.02em" },
  lead: { fontSize: "1.05rem", color: "rgba(226,232,240,0.85)", margin: "0 0 1.75rem" },
  alert: { background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.45)", borderRadius: "16px", padding: "1.1rem 1.25rem", marginBottom: "1.5rem" },
  alertTitle: { margin: "0 0 0.35rem", color: "#f472b6", fontSize: "1.05rem" },
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(14,246,204,0.15)", borderRadius: "16px", padding: "1.25rem 1.4rem", marginBottom: "1rem" },
  h2: { margin: "0 0 0.5rem", fontSize: "1.2rem", color: "#fff" },
  list: { margin: 0, paddingLeft: "1.2rem", color: "rgba(226,232,240,0.85)", fontSize: "0.96rem" },
  btn: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", background: "#0ef6cc", color: "#0f172a", fontWeight: 700, textDecoration: "none" },
  btnGhost: { display: "inline-block", padding: "0.7rem 1.3rem", borderRadius: "10px", border: "1px solid #0ef6cc", color: "#0ef6cc", fontWeight: 600, textDecoration: "none" },
};

const sections = [
  {
    h: "Before you contact anyone",
    items: [
      "Be careful with prices far below the area average. If it looks too good to be true, it usually is.",
      "Check that the photos, description and location match. Scammers often reuse photos from other listings.",
      "Prefer listings with a verification badge, and still do your own checks.",
      "Use the contact details shown on Mr. Rent. Do not move to unknown numbers or accounts on someone's say-so.",
    ],
  },
  {
    h: "Inspecting the property",
    items: [
      "Always see the property in person before paying anything. Never rent or buy from photos alone.",
      "Go in daylight and take a trusted friend or family member along.",
      "Meet the person who actually has the right to rent or sell it. Ask for a valid ID.",
      "Ask neighbours or nearby shops about the property and the landlord.",
      "Be wary of anyone who rushes you or says many other people are about to pay.",
    ],
  },
  {
    h: "Checking documents",
    items: [
      "Ask the landlord or seller to prove ownership or authority to let or sell the property.",
      "For purchases, ask to see title documents such as the Certificate of Occupancy, Deed of Assignment, survey plan and any government consent that applies.",
      "Check that names, plot details and addresses match across documents, and that the person you are dealing with matches the paper.",
      "For land and property purchases, have an independent lawyer and surveyor verify everything before you pay.",
      "Get any tenancy agreement or sale agreement in writing and read it fully before signing.",
    ],
  },
  {
    h: "Paying safely",
    items: [
      "Pay only after you have inspected the property and checked the documents.",
      "Pay by bank transfer to an account bearing the landlord's or company's verified name, and keep every receipt and transfer record.",
      "Be cautious about \"inspection fees\", \"commitment fees\" or \"agent fees\" demanded before you have seen the property.",
      "Do not send cash to someone you have not met, and do not pay through a third party you do not know.",
      "Mr. Rent platform fees, such as the contact reveal fee, are paid only inside the app through Paystack.",
    ],
  },
  {
    h: "Short-let and holiday stays",
    items: [
      "Confirm the host and the address before you pay, and keep all messages and booking details.",
      "Check reviews and the exact check-in terms, deposits and house rules.",
      "Be suspicious of hosts who push you to pay outside the platform or want the full amount very early.",
    ],
  },
  {
    h: "Protect your account",
    items: [
      "Mr. Rent will never ask for your password, card PIN, OTP or full card details in chat, calls or messages.",
      "Use a strong password and sign out on shared or public devices.",
      "Do not click links from strangers claiming to be Mr. Rent. Our official site is rent.fasteraim.com.",
    ],
  },
];

export default function SafetyTipsPage() {
  return (
    <main style={t.page}>
      <h1 style={t.h1}>Safety tips</h1>
      <p style={t.lead}>
        Most rental and property scams follow the same patterns. A few simple habits can protect your
        money. Please read this before you pay for any property, on Mr. Rent or anywhere else.
      </p>

      <div style={t.alert}>
        <h2 style={t.alertTitle}>The golden rule</h2>
        <p style={{ margin: 0, fontSize: "0.96rem" }}>
          Never pay for a property you have not seen, from a person you have not verified, with
          documents you have not checked.
        </p>
      </div>

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
        <h2 style={t.h2}>If you think you have been scammed</h2>
        <ul style={t.list}>
          <li>Stop all further payments and keep screenshots, receipts and call records.</li>
          <li>Contact your bank immediately and ask whether the transfer can be flagged.</li>
          <li>Report to the nearest police station or the EFCC.</li>
          <li>
            Tell us at <a href="mailto:info@fasteraim.com" style={{ color: "#0ef6cc" }}>info@fasteraim.com</a> or
            use the <Link href="/report" style={{ color: "#0ef6cc" }}>report form</Link> so we can review the listing.
          </li>
        </ul>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
        <Link href="/report" style={t.btn}>Report a listing</Link>
        <Link href="/community-guidelines" style={t.btnGhost}>Community guidelines</Link>
        <Link href="/support" style={t.btnGhost}>Contact support</Link>
      </div>
    </main>
  );
}