'use client'

import { useSyncExternalStore } from 'react'

// Subscribe to changes of the <html> class list (where "light-mode" lives)
function subscribe(callback) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

const getSnapshot = () => document.documentElement.classList.contains('light-mode')
const getServerSnapshot = () => false

export default function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = () => {
    const next = !light
    document.documentElement.classList.toggle('light-mode', next)
    try {
      localStorage.setItem('mr-rent-theme', next ? 'light' : 'dark')
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
      title={light ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {light ? '🌙' : '☀️'}
    </button>
  )
}