'use client'

export default function SwitchRoleModal({ fromRole, onConfirm, onCancel, loading }) {
  const isLandlord = fromRole === 'landlord'
  const toRole = isLandlord ? 'Tenant' : 'Landlord'
  const reason = isLandlord
    ? 'Only tenants can reveal landlord contacts.'
    : 'Only landlords can list properties and access the dashboard.'

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111318', border: '0.5px solid #2a2a2a',
          borderRadius: 16, padding: '2rem', maxWidth: 400, width: '100%',
          fontFamily: 'Segoe UI, system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 16 }}>🔄</div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e8e8e8', textAlign: 'center', marginBottom: 10 }}>
          Switch to {toRole} Mode?
        </h2>

        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 1.7, marginBottom: '1.75rem' }}>
          You're currently signed in as a <strong style={{ color: '#e8e8e8' }}>{isLandlord ? 'Landlord' : 'Tenant'}</strong>.{' '}
          {reason}
          <br /><br />
          Switching will change your active role. You can switch back at any time.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '13px', background: loading ? '#0a5c50' : '#0ef6cc',
              color: '#080a0f', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Switching…' : `Switch to ${toRole}`}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '12px', background: 'transparent',
              color: '#666', border: '0.5px solid #2a2a2a', borderRadius: 10,
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
