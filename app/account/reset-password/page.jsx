'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    const t = setTimeout(() => {
      setError((e) => e || 'This reset link is invalid or has expired. Please request a new one.')
    }, 8000)
    return () => { sub.subscription.unsubscribe(); clearTimeout(t) }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/account'), 2000)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--page-bg)', color: 'var(--text-1)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--card-bg)', borderRadius: 16, padding: '2rem 1.5rem', border: '0.5px solid var(--border-1)' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 1rem' }}>Set a new password</h1>
        {done ? (
          <p style={{ color: '#27ae60' }}>Password updated. Taking you to login...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <p style={{ color: '#e74c3c', margin: 0 }}>{error}</p>}
            <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" style={{ padding: '0.7rem', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.3)', background: 'var(--input-bg)', color: '#fff' }} />
            <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" style={{ padding: '0.7rem', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.3)', background: 'var(--input-bg)', color: '#fff' }} />
            <button type="submit" disabled={loading || !ready} style={{ padding: '0.75rem', background: '#e67e22', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, opacity: loading || !ready ? 0.6 : 1 }}>
              {loading ? 'Saving...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}