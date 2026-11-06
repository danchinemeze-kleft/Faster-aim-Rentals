'use client'

import { useRouter } from 'next/navigation'

export default function BackArrow() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      title="Go back"
      style={{
        position: 'fixed',
        left: 16,
        bottom: 80,
        zIndex: 9999,
        width: 46,
        height: 46,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid var(--border-2)',
        borderRadius: '50%',
        background: 'var(--card-bg)',
        color: 'var(--text-1)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    </button>
  )
}
