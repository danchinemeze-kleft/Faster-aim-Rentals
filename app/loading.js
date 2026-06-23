export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      gap: 0,
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #0ef6cc, #ff2d78)',
      }} />

      {/* Brand mark */}
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(14,246,204,0.12), rgba(255,45,120,0.08))',
        border: '2px solid rgba(14,246,204,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 20,
        boxShadow: '0 0 32px rgba(14,246,204,0.15)',
      }}>
        🏠
      </div>

      {/* Fasteraim h1 */}
      <h1 style={{
        fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
        margin: '0 0 4px',
        background: 'linear-gradient(135deg, #0ef6cc, #ff2d78)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Fasteraim
      </h1>

      {/* Mr. Rent sub-brand */}
      <p style={{
        fontSize: 13, fontWeight: 700, color: 'rgba(14,246,204,0.7)',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        margin: '0 0 28px',
      }}>
        Mr. Rent
      </p>

      {/* Spinner */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.08)',
        borderTopColor: '#0ef6cc',
        animation: 'spin 0.75s linear infinite',
        marginBottom: 14,
      }} />

      {/* Loading text */}
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0, letterSpacing: '0.05em' }}>
        Loading…
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
