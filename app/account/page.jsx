'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function AccountPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('tenant')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const redirectTo = searchParams.get('redirect') || null

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await handleRedirectAfterAuth(session.user)
      }
    }
    checkSession()
  }, [])

  const handleRedirectAfterAuth = async (user) => {
    if (redirectTo) {
      router.push(redirectTo)
      return
    }
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'tenant'
    router.push(userRole === 'landlord' ? '/dashboard' : '/my-account')
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const callbackUrl = redirectTo
      ? `${window.location.origin}/account/callback?redirect=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/account/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    await handleRedirectAfterAuth(data.user)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone, role } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user && !data.session) {
      setSuccessMsg('Check your email to confirm your account, then log in.')
      setLoading(false)
      setMode('login')
      return
    }
    if (data.user) {
      await supabase.from('Profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role,
      })
      await handleRedirectAfterAuth(data.user)
    }
  }

  return (
    <main className="faim-account-page">
      <div className="faim-account-card">
        <div className="faim-account-brand">
          <span className="faim-brand-icon">🏠</span>
          <h1 className="faim-brand-name">Mr. Rent</h1>
          <p className="faim-brand-tagline">Find your next home in Nigeria</p>
        </div>

        <div className="faim-tab-toggle">
          <button
            className={`faim-tab ${mode === 'login' ? 'faim-tab--active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccessMsg('') }}
            type="button"
          >
            Log in
          </button>
          <button
            className={`faim-tab ${mode === 'signup' ? 'faim-tab--active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccessMsg('') }}
            type="button"
          >
            Sign up
          </button>
        </div>

        {error && <div className="faim-alert faim-alert--error">{error}</div>}
        {successMsg && <div className="faim-alert faim-alert--success">{successMsg}</div>}

        <button
          className="faim-google-btn"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <div className="faim-divider"><span>or</span></div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="faim-form">
            <div className="faim-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="faim-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="faim-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
            <p className="faim-switch-mode">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError('') }}>
                Sign up
              </button>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="faim-form">
            <div className="faim-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Daniel Igboke"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="faim-field">
              <label htmlFor="signup-phone">Phone number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="080XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
            <div className="faim-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="faim-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="faim-field">
              <label>I am a</label>
              <div className="faim-role-toggle">
                <button
                  type="button"
                  className={`faim-role-btn ${role === 'tenant' ? 'faim-role-btn--active' : ''}`}
                  onClick={() => setRole('tenant')}
                >
                  🔍 Tenant
                </button>
                <button
                  type="button"
                  className={`faim-role-btn ${role === 'landlord' ? 'faim-role-btn--active' : ''}`}
                  onClick={() => setRole('landlord')}
                >
                  🏠 Landlord
                </button>
              </div>
            </div>
            <button type="submit" className="faim-submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <p className="faim-switch-mode">
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError('') }}>
                Log in
              </button>
            </p>
          </form>
        )}

        <p className="faim-terms">
          By continuing, you agree to our{' '}
          <a href="/terms-of-service">Terms of Service</a> and{' '}
          <a href="/privacy-policy">Privacy Policy</a>.
        </p>
      </div>

      <style>{`
        .faim-account-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: #f5f4f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .faim-account-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .faim-account-brand { text-align: center; margin-bottom: 1.75rem; }
        .faim-brand-icon { font-size: 2rem; display: block; margin-bottom: 0.25rem; }
        .faim-brand-name { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.25rem; }
        .faim-brand-tagline { font-size: 0.875rem; color: #666; margin: 0; }
        .faim-tab-toggle {
          display: flex; background: #f0efeb; border-radius: 10px;
          padding: 4px; margin-bottom: 1.25rem; gap: 4px;
        }
        .faim-tab {
          flex: 1; padding: 0.5rem; border: none; border-radius: 7px;
          background: transparent; font-size: 0.9rem; font-weight: 500;
          color: #666; cursor: pointer; transition: all 0.15s ease;
        }
        .faim-tab--active { background: #ffffff; color: #1a1a2e; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .faim-alert { padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.875rem; margin-bottom: 1rem; }
        .faim-alert--error { background: #fff0f0; color: #c0392b; border: 1px solid #fcc; }
        .faim-alert--success { background: #f0fff4; color: #27ae60; border: 1px solid #b2f0c8; }
        .faim-google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 0.7rem 1rem; border: 1.5px solid #ddd; border-radius: 10px;
          background: #fff; font-size: 0.9rem; font-weight: 500; color: #333;
          cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease;
        }
        .faim-google-btn:hover { background: #f8f8f8; border-color: #bbb; }
        .faim-google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .faim-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 1.25rem 0; color: #aaa; font-size: 0.8rem;
        }
        .faim-divider::before, .faim-divider::after {
          content: ''; flex: 1; height: 1px; background: #e5e5e5;
        }
        .faim-form { display: flex; flex-direction: column; gap: 1rem; }
        .faim-field { display: flex; flex-direction: column; gap: 6px; }
        .faim-field label { font-size: 0.85rem; font-weight: 600; color: #444; }
        .faim-field input {
          padding: 0.65rem 0.875rem; border: 1.5px solid #e0e0e0; border-radius: 9px;
          font-size: 0.9rem; color: #1a1a2e; outline: none;
          transition: border-color 0.15s ease; background: #fff;
        }
        .faim-field input:focus { border-color: #e67e22; }
        .faim-role-toggle { display: flex; gap: 8px; }
        .faim-role-btn {
          flex: 1; padding: 0.6rem; border: 1.5px solid #e0e0e0; border-radius: 9px;
          background: #fff; font-size: 0.85rem; font-weight: 500; color: #555;
          cursor: pointer; transition: all 0.15s ease;
        }
        .faim-role-btn--active { border-color: #e67e22; background: #fff8f2; color: #e67e22; }
        .faim-submit-btn {
          width: 100%; padding: 0.75rem; background: #e67e22; color: #fff;
          border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s ease; margin-top: 0.25rem;
        }
        .faim-submit-btn:hover { background: #cf6d17; }
        .faim-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .faim-switch-mode { text-align: center; font-size: 0.85rem; color: #666; margin: 0; }
        .faim-switch-mode button {
          background: none; border: none; color: #e67e22; font-weight: 600;
          cursor: pointer; font-size: 0.85rem; padding: 0;
        }
        .faim-terms { text-align: center; font-size: 0.78rem; color: #aaa; margin: 1.25rem 0 0; line-height: 1.5; }
        .faim-terms a { color: #e67e22; text-decoration: none; }
        @media (max-width: 480px) { .faim-account-card { padding: 2rem 1.25rem; } }
      `}</style>
    </main>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>}>
      <AccountPageInner />
    </Suspense>
  )
}