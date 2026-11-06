"use client";

import { useState } from "react";

const EMAIL = "info@fasteraim.com";
const WHATSAPP = "2348032851976";

const TYPES = [
  "Fake or scam listing",
  "Wrong price or false information",
  "Property already rented or sold",
  "Suspicious landlord or agent",
  "Abusive or inappropriate behaviour",
  "Fake review or affiliate abuse",
  "Other",
];

const s = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(14,246,204,0.15)", borderRadius: "16px", padding: "1.5rem" },
  label: { display: "block", margin: "0 0 0.35rem", fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" },
  field: { width: "100%", boxSizing: "border-box", padding: "0.7rem 0.8rem", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.35)", background: "rgba(2,6,23,0.6)", color: "#e2e8f0", fontSize: "0.95rem", marginBottom: "1rem", fontFamily: "inherit" },
  btn: { padding: "0.75rem 1.4rem", borderRadius: "10px", border: "none", background: "#0ef6cc", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" },
  ok: { marginTop: "1rem", padding: "0.9rem 1rem", borderRadius: "10px", background: "rgba(14,246,204,0.08)", border: "1px solid rgba(14,246,204,0.3)", fontSize: "0.92rem" },
};

export default function ReportForm() {
  const [type, setType] = useState(TYPES[0]);
  const [listing, setListing] = useState("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  const body = () =>
    [
      `Report type: ${type}`,
      `Listing link or ID: ${listing || "Not provided"}`,
      `Details: ${details}`,
      `My contact (optional): ${contact || "Not provided"}`,
    ].join("\n\n");

  const submit = (e) => {
    e.preventDefault();
    if (!details.trim()) return;
    const subject = `Mr. Rent report: ${type}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body())}`;
    setSent(true);
  };

  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Mr. Rent report\n\n" + body())}`;

  return (
    <div style={s.card}>
      <form onSubmit={submit}>
        <label style={s.label} htmlFor="rtype">What are you reporting?</label>
        <select id="rtype" style={s.field} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>

        <label style={s.label} htmlFor="rlisting">Listing link or ID (if any)</label>
        <input id="rlisting" style={s.field} value={listing} onChange={(e) => setListing(e.target.value)} placeholder="https://rent.fasteraim.com/listing/..." />

        <label style={s.label} htmlFor="rdetails">What happened?</label>
        <textarea id="rdetails" required rows={5} style={s.field} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the problem. Include names, phone numbers, amounts and dates if you have them." />

        <label style={s.label} htmlFor="rcontact">Your phone or email (optional)</label>
        <input id="rcontact" style={s.field} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="So we can follow up with you" />

        <button type="submit" style={s.btn}>Send report</button>
      </form>

      {sent && (
        <div style={s.ok}>
          Your email app should open with the report ready to send. If nothing opened, send it
          directly to <strong>{EMAIL}</strong> or{" "}
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: "#0ef6cc" }}>
            report on WhatsApp
          </a>.
        </div>
      )}
    </div>
  );
}