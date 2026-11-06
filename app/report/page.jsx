import Link from "next/link";
import ReportForm from "./ReportForm";

export const metadata = {
  title: { absolute: "Report a Listing - Mr. Rent" },
  description:
    "Report a fake, misleading or suspicious listing, landlord or agent on Mr. Rent. Our team reviews every report.",
};

const t = {
  page: { maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem 3rem", color: "#e2e8f0", lineHeight: 1.7 },
  h1: { fontSize: "clamp(1.9rem, 5vw, 2.6rem)", color: "#0ef6cc", margin: "0 0 0.5rem", letterSpacing: "-0.02em" },
  lead: { color: "rgba(226,232,240,0.85)", margin: "0 0 1.5rem" },
  box: { marginTop: "1.5rem", fontSize: "0.9rem", color: "rgba(148,163,184,0.95)" },
  link: { color: "#0ef6cc" },
};

export default function ReportPage() {
  return (
    <main style={t.page}>
      <h1 style={t.h1}>Report a listing</h1>
      <p style={t.lead}>
        Saw a fake listing, a wrong price, a property that is already taken, or someone behaving
        suspiciously? Tell us and our team will review it. Reports help keep Mr. Rent safe for everyone.
      </p>

      <ReportForm />

      <div style={t.box}>
        <p style={{ margin: "0 0 0.5rem" }}>
          If you have already lost money, please also report to the police or the EFCC. See our{" "}
          <Link href="/safety-tips" style={t.link}>safety tips</Link> for what to do next.
        </p>
        <p style={{ margin: 0 }}>
          You can also reach us at <a href="mailto:info@fasteraim.com" style={t.link}>info@fasteraim.com</a> or
          visit the <Link href="/support" style={t.link}>support page</Link>. Reports are reviewed by our team and
          action may include removing a listing, suspending an account or referring a matter to the authorities.
        </p>
      </div>
    </main>
  );
}