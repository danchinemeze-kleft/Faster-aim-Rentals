import Link from "next/link";

const s = {
  footer: {
    width: "100%",
    padding: "2.5rem 1rem 1.5rem",
    marginTop: "auto",
    background: "transparent",
  },
  footerCard: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem 1.75rem 1.5rem",
    borderRadius: "16px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(14, 246, 204, 0.15)",
    backdropFilter: "blur(12px)",
  },
  footerTop: {
    marginBottom: "1.75rem",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#0ef6cc",
    letterSpacing: "-0.02em",
  },
  footerTagline: {
    margin: "0.4rem 0 0",
    fontSize: "0.9rem",
    color: "rgba(226, 232, 240, 0.75)",
    lineHeight: 1.5,
    maxWidth: "420px",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "1.75rem",
    marginBottom: "1.75rem",
  },
  footerHeading: {
    margin: "0 0 0.75rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#0ef6cc",
  },
  footerLink: {
    display: "block",
    marginBottom: "0.45rem",
    fontSize: "0.9rem",
    color: "rgba(226, 232, 240, 0.8)",
    textDecoration: "none",
    transition: "color 0.15s ease",
  },
  footerBottom: {
    paddingTop: "1.25rem",
    borderTop: "1px solid rgba(148, 163, 184, 0.15)",
    fontSize: "0.85rem",
    color: "rgba(148, 163, 184, 0.8)",
    textAlign: "center",
  },
};

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.footerCard} className="site-footer">
        <div style={s.footerTop}>
          <div
            style={{ ...s.navBrand, marginBottom: "0.5rem" }}
            className="footer-brand"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: "8px" }}
            >
              <path
                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="9 22 9 12 15 12 15 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Mr. Rent
          </div>
          <p style={s.footerTagline} className="footer-text">
            Find or list property for rent across Nigeria, quickly and securely.
          </p>
        </div>

        <div style={s.footerGrid} className="footer-grid">
          <div>
            <p style={s.footerHeading} className="footer-heading">
              Explore
            </p>
            <Link href="/browse" className="footer-link" style={s.footerLink}>
              Browse Rentals
            </Link>
            <Link href="/list" className="footer-link" style={s.footerLink}>
              List Property
            </Link>
            <Link href="/veryland" className="footer-link" style={s.footerLink}>
              Verified Properties
            </Link>
            <Link href="/services" className="footer-link" style={s.footerLink}>
              Our Services
            </Link>
            <Link href="/search" className="footer-link" style={s.footerLink}>
              AI Chat Assistant
            </Link>
          </div>

          <div>
            <p style={s.footerHeading} className="footer-heading">
              Company
            </p>
            <Link href="/about" className="footer-link" style={s.footerLink}>
              About Us
            </Link>
            <Link href="/support" className="footer-link" style={s.footerLink}>
              Contact & Support
            </Link>
            <Link href="/faq" className="footer-link" style={s.footerLink}>
              FAQ
            </Link>
            <Link href="/affiliate" className="footer-link" style={s.footerLink}>
              Earn with Referrals
            </Link>
            <Link href="/all-pages" className="footer-link" style={s.footerLink}>
              All Pages
            </Link>
          </div>

          <div>
            <p style={s.footerHeading} className="footer-heading">
              Legal
            </p>
            <Link
              href="/privacy-policy"
              className="footer-link"
              style={s.footerLink}
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link" style={s.footerLink}>
              Terms of Service
            </Link>
          </div>
        </div>

        <div style={s.footerBottom} className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Mr. Rent. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}