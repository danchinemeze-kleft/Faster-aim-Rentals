'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function EyeIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  )
}

function PasswordField({ name, placeholder, value, onChange, style }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={6}
        autoComplete="new-password"
        style={{ ...style, width: '100%', paddingRight: '2.75rem', boxSizing: 'border-box' }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '0.75rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#cccccc',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
        setError('')
        if (session?.user?.email) setUserEmail(session.user.email)
      }
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
        setUserEmail(data.session.user?.email || '')
      }
    })
    const t = setTimeout(() => {
      setReady((isReady) => {
        if (!isReady) {
          setError('This reset link is invalid or has expired. Please request a new one.')
        }
        return isReady
      })
    }, 8000)
    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(t)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/account'), 2000)
  }

  const inputStyle = {
    padding: '0.7rem',
    borderRadius: 9,
    border: '1.5px solid rgba(255,255,255,0.3)',
    background: 'var(--input-bg)',
    color: '#fff',
    fontSize: '1rem',
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'var(--page-bg)',
        color: 'var(--text-1)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--card-bg)',
          borderRadius: 16,
          padding: '2rem 1.5rem',
          border: '0.5px solid var(--border-1)',
        }}
      >
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 1rem' }}>Set a new password</h1>
        {done ? (
          <p style={{ color: '#27ae60' }}>Password updated. Taking you to your account...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {error && <p style={{ color: '#e74c3c', margin: 0 }}>{error}</p>}

            {/* Hidden email field so the browser can offer to save the new password */}
            <input
              type="email"
              name="username"
              autoComplete="username"
              value={userEmail}
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
            />

            <PasswordField
              name="new-password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <PasswordField
              name="confirm-password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={loading || !ready}
              style={{
                padding: '0.75rem',
                background: '#e67e22',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 600,
                opacity: loading || !ready ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}