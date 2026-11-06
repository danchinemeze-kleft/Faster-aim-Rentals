"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// ---- EDIT THESE LINKS ----
const DOWNLOAD_LINKS = {
  android: "https://play.google.com/store/apps/details?id=com.fasteraim.mrrent",
  ios: "https://apps.apple.com/app/mr-rent/id0000000000",
  windows: "/downloads/MrRent-Setup.exe",
  mac: "/downloads/MrRent.dmg",
  linux: "/downloads/MrRent.AppImage",
  fallback: "/download", // page listing all download options
};

function detectPlatform() {
  if (typeof navigator === "undefined") return "fallback";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1))
    return "ios";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "mac";
  if (/Linux|X11|CrOS/i.test(ua)) return "linux";
  return "fallback";
}

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
    display: "flex",
    flexWrap: "wrap",
    gap: "1.25rem",
    alignItems: "center",
    justifyContent: "space-between",
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
  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "0.65rem 1.2rem",
    borderRadius: "10px",
    background: "#0ef6cc",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  supportBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "0.65rem 1.2rem",
    borderRadius: "10px",
    border: "1px solid #0ef6cc",
    color: "#0ef6cc",
    fontWeight: 600,
    fontSize: "0.9rem",
    textDecoration: "none",
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

function FLink({ href, children }) {
  return (
    <Link href={href} className="footer-link" style={s.footerLink}>
      {children}
    </Link>
  );
}

const subscribe = () => () => {};

export default function Footer() {
  const platform = useSyncExternalStore(subscribe, detectPlatform, () => "fallback");

  const downloadHref = DOWNLOAD_LINKS[platform] || DOWNLOAD_LINKS.fallback;
  const isFile = platform === "windows" || platform === "mac" || platform === "linux";
  const isStore = platform === "android" || platform === "ios";

  const labels = {
    android: "Get it on Google Play",
    ios: "Download on App Store",
    windows: "Download for Windows",
    mac: "Download for Mac",
    linux: "Download for Linux",
    fallback: "Download App",
  };

  return (
    <footer style={s.footer}>
      <div style={s.footerCard} className="site-footer">
        <div style={s.footerTop}>
          <div>
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

          <div style={s.ctaRow}>
            {isFile ? (
              <a href={downloadHref} download style={s.downloadBtn} className="footer-download">
                ⬇ {labels[platform]}
              </a>
            ) : (
              <a
                href={downloadHref}
                {...(isStore ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={s.downloadBtn}
                className="footer-download"
              >
                ⬇ {labels[platform]}
              </a>
            )}
            <Link href="/connect" style={s.supportBtn} className="footer-support">
              ❤ Join the Campaign
            </Link>
          </div>
        </div>

        <div style={s.footerGrid} className="footer-grid">
          <div>
            <p style={s.footerHeading} className="footer-heading">
              Explore
            </p>
            <FLink href="/browse">Browse Rentals</FLink>
            <FLink href="/list">List Property</FLink>
            <FLink href="/veryland">Verified Properties</FLink>
            <FLink href="/services">Our Services</FLink>
            <FLink href="/search">AI Chat Assistant</FLink>
            <FLink href="/download">Download App</FLink>
          </div>

          <div>
            <p style={s.footerHeading} className="footer-heading">
              Company
            </p>
            <FLink href="/about">About Us</FLink>
            <FLink href="/support">Contact & Support</FLink>
            <FLink href="/connect?src=footer">Support Us / Join Campaign</FLink>
            <FLink href="/faq">FAQ</FLink>
            <FLink href="/affiliate">Earn with Referrals</FLink>
            <FLink href="/blog">Blog</FLink>
            <FLink href="/all-pages">All Pages</FLink>
          </div>

          <div>
            <p style={s.footerHeading} className="footer-heading">
              Safety & Help
            </p>
            <FLink href="/safety-tips">Safety Tips</FLink>
            <FLink href="/report">Report a Listing</FLink>
            <FLink href="/community-guidelines">Community Guidelines</FLink>
            <FLink href="/how-it-works">How It Works</FLink>
          </div>

          <div>
            <p style={s.footerHeading} className="footer-heading">
              Legal
            </p>
            <FLink href="/privacy-policy">Privacy Policy</FLink>
            <FLink href="/terms">Terms of Service</FLink>
            <FLink href="/cookie-policy">Cookie Policy</FLink>
            <FLink href="/refund-policy">Refund Policy</FLink>
            <FLink href="/delete-account">Delete Account</FLink>
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