import Link from "next/link";

export const metadata = {
  title: "Trading & Investment Partners | Mr. Rent",
  description:
    "Discover upcoming connections to selected trading and investment apps through Mr. Rent's partner network.",
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(5rem, 10vw, 8rem) 1.25rem 4rem",
    background: "var(--page-bg)",
    color: "var(--text-1)",
  },
  content: {
    maxWidth: 850,
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    padding: "0.45rem 0.8rem",
    border: "1px solid rgba(14, 246, 204, 0.35)",
    borderRadius: 999,
    color: "#0ef6cc",
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  title: {
    margin: "1rem 0",
    fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
  },
  accent: {
    color: "#0ef6cc",
  },
  intro: {
    maxWidth: 680,
    color: "var(--text-2)",
    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
    lineHeight: 1.7,
  },
  card: {
    marginTop: "2.5rem",
    padding: "clamp(1.25rem, 4vw, 2rem)",
    border: "1px solid var(--border-1)",
    borderRadius: 20,
    background: "var(--card-bg)",
    boxShadow: "var(--shadow-card)",
  },
  cardTitle: {
    margin: "0 0 0.75rem",
    fontSize: "1.25rem",
  },
  paragraph: {
    color: "var(--text-2)",
    lineHeight: 1.7,
  },
  list: {
    display: "grid",
    gap: "0.85rem",
    margin: "1.25rem 0 0",
    padding: 0,
    listStyle: "none",
  },
  item: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-start",
    color: "var(--text-2)",
    lineHeight: 1.6,
  },
  dot: {
    flex: "0 0 auto",
    color: "#0ef6cc",
    fontWeight: 800,
  },
  notice: {
    marginTop: "1.5rem",
    padding: "1rem 1.1rem",
    borderLeft: "3px solid #14B8A6",
    borderRadius: "0 10px 10px 0",
    background: "rgba(20, 184, 166, 0.08)",
    color: "var(--text-2)",
    lineHeight: 1.65,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginTop: "1.75rem",
  },
  primaryLink: {
    display: "inline-flex",
    padding: "0.8rem 1.15rem",
    borderRadius: 10,
    background: "#0ef6cc",
    color: "#080a0f",
    fontWeight: 800,
    textDecoration: "none",
  },
  secondaryLink: {
    display: "inline-flex",
    padding: "0.8rem 1.15rem",
    border: "1px solid var(--border-1)",
    borderRadius: 10,
    color: "var(--text-1)",
    fontWeight: 700,
    textDecoration: "none",
  },
};

export default function ConnectedPage() {
  return (
    <main style={styles.page}>
      <div style={styles.content}>
        <span style={styles.badge}>Additional service · Coming soon</span>
        <h1 style={styles.title}>
          Your next connection:
          <br />
          <span style={styles.accent}>trading &amp; investing.</span>
        </h1>
        <p style={styles.intro}>
          We&apos;re preparing a partner directory to help our community discover
          selected trading and investment apps. This is a new service alongside
          Mr. Rent, not a feature for managing rental listings.
        </p>

        <section style={styles.card} aria-labelledby="partner-status">
          <h2 id="partner-status" style={styles.cardTitle}>
            Partner apps are not available yet
          </h2>
          <p style={styles.paragraph}>
            We haven&apos;t finalized any trading or investment app partnerships.
            Once agreements are in place, this page will introduce participating
            providers and explain how to visit or connect with them.
          </p>
          <ul style={styles.list}>
            <li style={styles.item}>
              <span style={styles.dot} aria-hidden="true">•</span>
              <span>Only confirmed partners will be listed here.</span>
            </li>
            <li style={styles.item}>
              <span style={styles.dot} aria-hidden="true">•</span>
              <span>
                Any future account setup or investment activity will be handled
                by the partner app, subject to its own terms and availability.
              </span>
            </li>
          </ul>
          <p style={styles.notice}>
            Trading and investing involve risk, including possible loss of
            capital. Mr. Rent does not provide investment advice or guarantee
            returns.
          </p>
          <div style={styles.actions}>
            <Link href="/connect" style={styles.primaryLink}>
              Ask about partnerships
            </Link>
            <Link href="/services" style={styles.secondaryLink}>
              Explore all services
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
