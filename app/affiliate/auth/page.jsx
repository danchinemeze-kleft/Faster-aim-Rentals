'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AffiliateAuthPage() {
  const [mode, setMode] = useState('signup')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      if (formData.password !== formData.confirmPassword) {
        setMsgType('error')
        setMsg('Passwords do not match')
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setMsgType('error')
        setMsg('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.full_name }
        }
      })

      if (authError) {
        setMsgType('error')
        setMsg(authError.message)
        setLoading(false)
        return
      }

      const { error: affiliateError } = await supabase
        .from('affiliates')
        .insert({
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_name: formData.account_name,
          status: 'active'
        })

      if (affiliateError) {
        setMsgType('error')
        setMsg('Failed to create affiliate account: ' + affiliateError.message)
        setLoading(false)
        return
      }

      setMsgType('success')
      setMsg('✅ Signup successful! Redirecting to dashboard...')
      
      setTimeout(() => {
        window.location.href = '/affiliate/dashboard'
      }, 2000)

    } catch (err) {
      setMsgType('error')
      setMsg('An error occurred: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setMsgType('error')
        setMsg(error.message)
        setLoading(false)
        return
      }

      setMsgType('success')
      setMsg('✅ Login successful! Redirecting...')
      
      setTimeout(() => {
        window.location.href = '/affiliate/dashboard'
      }, 1500)

    } catch (err) {
      setMsgType('error')
      setMsg('An error occurred: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#0f172a' }}>
      
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(90deg,#0ea5e9,#ff2d78)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>🏠 Mr. Rent</a>
        <a href="/affiliate" style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>← Back</a>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', minHeight: 'calc(100vh - 70px)' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '3rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', maxWidth: 500, width: '100%' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
            <button 
              onClick={() => { setMode('signup'); setMsg('') }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: mode === 'signup' ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'transparent',
                color: mode === 'signup' ? '#fff' : '#64748b',
                fontWeight: 800,
                fontSize: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
            <button 
              onClick={() => { setMode('login'); setMsg('') }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: mode === 'login' ? 'linear-gradient(135deg,#ff2d78,#c0135a)' : 'transparent',
                color: mode === 'login' ? '#fff' : '#64748b',
                fontWeight: 800,
                fontSize: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </div>

          {mode === 'signup' && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Join the Affiliate Program</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 600 }}>Create your account and start earning ₦500 per reveal, ₦2,000 per subscription.</p>

              {[
                { name: 'full_name', label: 'Full Name *', type: 'text', placeholder: 'Daniel Igboke' },
                { name: 'email', label: 'Email *', type: 'email', placeholder: 'your@email.com' },
                { name: 'password', label: 'Password *', type: 'password', placeholder: 'Min 6 characters' },
                { name: 'confirmPassword', label: 'Confirm Password *', type: 'password', placeholder: 'Confirm password' },
                { name: 'phone', label: 'WhatsApp / Phone *', type: 'tel', placeholder: '08012345678' },
                { name: 'bank_name', label: 'Bank Name *', type: 'text', placeholder: 'Access Bank' },
                { name: 'account_number', label: 'Account Number *', type: 'text', placeholder: '10-digit number' },
                { name: 'account_name', label: 'Account Name *', type: 'text', placeholder: 'Name on account' },
              ].map(field => (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    style={{ padding: '0.7rem 0.9rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', color: '#0f172a' }}
                  />
                </div>
              ))}

              {msg && (
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: msgType === 'success' ? '#22c55e' : '#e74c3c', padding: '0.65rem 0.9rem', background: msgType === 'success' ? '#f0fdf4' : '#fff0f0', borderRadius: '8px' }}>
                  {msg}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Creating account...' : 'Create Account & Get Ref Code'}
              </button>

              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>By signing up, you agree to our Terms of Service</p>
            </form>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Login to Your Account</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 600 }}>Access your dashboard and view your earnings</p>

              {[
                { name: 'email', label: 'Email *', type: 'email', placeholder: 'your@email.com' },
                { name: 'password', label: 'Password *', type: 'password', placeholder: 'Your password' },
              ].map(field => (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    style={{ padding: '0.7rem 0.9rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', color: '#0f172a' }}
                  />
                </div>
              ))}

              {msg && (
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: msgType === 'success' ? '#22c55e' : '#e74c3c', padding: '0.65rem 0.9rem', background: msgType === 'success' ? '#f0fdf4' : '#fff0f0', borderRadius: '8px' }}>
                  {msg}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                style={{ background: 'linear-gradient(135deg,#ff2d78,#c0135a)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
