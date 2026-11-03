'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'

const PLAY_STORE_URL = '' // paste your Play Store link here when it is live

let appInstalled = false

function subscribeToInstalled(callback) {
  const mediaQuery = window.matchMedia('(display-mode: standalone)')
  const onInstalled = () => {
    appInstalled = true
    callback()
  }
  mediaQuery.addEventListener('change', callback)
  window.addEventListener('appinstalled', onInstalled)
  return () => {
    mediaQuery.removeEventListener('change', callback)
    window.removeEventListener('appinstalled', onInstalled)
  }
}

function getInstalledSnapshot() {
  return appInstalled || window.matchMedia('(display-mode: standalone)').matches
}

function getServerInstalledSnapshot() {
  return false
}

const card = {
  background: '#111318',
  border: '0.5px solid #222',
  borderRadius: 16,
  padding: '1.25rem',
  marginBottom: '1.25rem',
}

export default function InstallClient() {
  const [deferred, setDeferred] = useState(null)
  const installed = useSyncExternalStore(
    subscribeToInstalled,
    getInstalledSnapshot,
    getServerInstalledSnapshot,
  )
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
    }
  }, [])

  async function install() {
    setMsg('')
    if (PLAY_STORE_URL) {
      window.open(PLAY_STORE_URL, '_blank')
    } else if (deferred) {
      deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
    } else {
      setMsg('Follow the steps below to add Mr. Rent to your home screen.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'Segoe UI, system-ui, sans-serif', color: '#ffffff' }}>
      <div style={{ background: '#111318', borderBottom: '0.5px solid #222', padding: '0 1.5rem', height: 54, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ color: '#cccccc', fontSize: 20, textDecoration: 'none' }} aria-label="Back to home">←</Link>
        <span style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 15 }}>Mr. Rent</span>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#cccccc', fontSize: 13 }}>Download</span>
      </div>

      <main style={{ maxWidth: 520, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }} aria-hidden="true">📱</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Download the Mr. Rent app</h1>
          <p style={{ color: '#cccccc', fontSize: 17, lineHeight: 1.6 }}>
            Search houses for rent, land and shortlets across Nigeria, right from your phone.
          </p>
        </div>

        {installed ? (
          <div style={{ ...card, textAlign: 'center', background: '#0e1c19', border: '0.5px solid #0ef6cc33' }}>
            <div style={{ color: '#0ef6cc', fontWeight: 700, marginBottom: 6 }}>✅ Mr. Rent is installed</div>
            <Link href="/browse" style={{ color: '#0ef6cc', fontWeight: 600 }}>Browse properties →</Link>
          </div>
        ) : (
          <>
            <button
              onClick={install}
              style={{
                width: '100%', padding: '16px', background: '#0ef6cc', color: '#080a0f',
                border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 17, cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              Download app
            </button>
            {msg && <p role="status" style={{ color: '#f5b942', fontSize: 14, textAlign: 'center', marginBottom: 12 }}>{msg}</p>}
          </>
        )}

        <div style={card}>
          <h2 style={{ fontSize: 16, marginBottom: 10 }}>On Android (Chrome)</h2>
          <ol style={{ margin: 0, paddingLeft: 20, color: '#cccccc', fontSize: 15, lineHeight: 1.8 }}>
            <li>Tap the menu (three dots) at the top right.</li>
            <li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li>
            <li>Tap <b>Install</b>. Mr. Rent appears on your home screen.</li>
          </ol>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, marginBottom: 10 }}>On iPhone (Safari)</h2>
          <ol style={{ margin: 0, paddingLeft: 20, color: '#cccccc', fontSize: 15, lineHeight: 1.8 }}>
            <li>Tap the Share button at the bottom.</li>
            <li>Tap <b>Add to Home Screen</b>.</li>
            <li>Tap <b>Add</b>.</li>
          </ol>
        </div>

        <p style={{ fontSize: 13, color: '#aaaaaa', textAlign: 'center', lineHeight: 1.7 }}>
          Free to install. No account needed to start browsing.
        </p>
      </main>
    </div>
  )
}