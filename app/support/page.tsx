export default function SupportPage() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <h1 style={{ color: "#0ef6cc", fontFamily: "Syne, sans-serif" }}>
        Contact Support
      </h1>
      <p style={{ color: "#ccc", marginBottom: "24px" }}>
        Having an issue? Reach out and we&apos;ll get back to you shortly.
      </p>
      
       <a href="mailto:Info@fasteraim.com?subject=Mr.%20Rent%20Support%20Enquiry&body=Please%20describe%20the%20issue%20and%20attach%20screenshot%20of%20the%20affected%20page%3A%0A%0A"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "#0ef6cc",
          color: "#080a0f",
          fontWeight: 600,
          textDecoration: "none",
          borderRadius: "6px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Contact Support
      </a>
      <p style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
        Or email us directly: Info@fasteraim.com
      </p>
    </div>
  );
}