"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FAQS } from "./faq-data";
import "./faq.css";

const CATEGORIES = ["All", ...Array.from(new Set(FAQS.map((f) => f.category)))];

export default function FaqPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const items = useMemo(() => {
    const t = query.trim().toLowerCase();
    return FAQS.filter(
      (f) =>
        (category === "All" || f.category === category) &&
        (!t || (f.question + f.brief + f.detail).toLowerCase().includes(t))
    );
  }, [category, query]);

  const toggle = (q: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(q) ? next.delete(q) : next.add(q);
      return next;
    });

  let last = "";
  return (
    <div className="faq">
      <nav className="faq-nav">
        <Link href="/" className="faq-brand">
          <img src="/icon.svg" alt="" />
          Mr. Rent
        </Link>
        <div className="faq-links">
          <Link href="/browse">Browse</Link>
          <Link href="/search">Ask Mr. Rent AI</Link>
          <div className="faq-menu">
            <span>Menu ▾</span>
            <div className="faq-drop">
              <Link href="/list">List a Property</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/account">My Account</Link>
              <Link href="/affiliate/auth">Affiliate Programme</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
          <Link href="/account" className="cta">Sign in</Link>
        </div>
      </nav>

      <header className="faq-hero">
        <div className="faq-herocard">
          <span className="faq-pill">Help Centre</span>
          <h1>Frequently Asked Questions</h1>
          <p>
            Everything about finding, listing and transacting on property safely – plus how
            you earn rewards while you do it.
          </p>
          <input
            className="faq-search"
            type="search"
            placeholder="Search questions…"
            aria-label="Search FAQs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="faq-main">
        <div className="faq-tabs">
          {CATEGORIES.map((c) => (
            <button key={c} className={c === category ? "on" : ""} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {items.map((f) => {
          const heading = f.category !== last ? <h2>{f.category}</h2> : null;
          last = f.category;
          const isOpen = open.has(f.question);
          return (
            <div key={f.question}>
              {heading}
              <div className={`faq-item${isOpen ? " open" : ""}`}>
                <button className="faq-q" aria-expanded={isOpen} onClick={() => toggle(f.question)}>
                  <b>{f.question}</b>
                  <span className="br">{f.brief}</span>
                </button>
                {isOpen && <div className="faq-dt" dangerouslySetInnerHTML={{ __html: f.detail }} />}
              </div>
            </div>
          );
        })}
        <div className="faq-help">
          <h3>Still have a question?</h3>
          <p>Ask the Mr. Rent AI anything about properties, areas and prices.</p>
          <Link href="/search" className="lively">Chat with Mr. Rent AI</Link>
          <Link href="/browse" className="lively">Browse properties</Link>
        </div>
        {items.length === 0 && <div className="faq-none">No matching question. Try a different word.</div>}
      </main>

      <footer className="faq-foot">
        <nav>
          <Link href="/browse">Browse</Link>
          <Link href="/list">List a Property</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/affiliate/auth">Affiliate</Link>
        </nav>
        <small>
          Prices, rewards and features may change as Mr. Rent grows. Mr. Rent&apos;s AI gives
          property guidance and evaluations, not legal or investment advice. Always consult
          qualified professionals before big decisions.
        </small>
      </footer>
    </div>
  );
}