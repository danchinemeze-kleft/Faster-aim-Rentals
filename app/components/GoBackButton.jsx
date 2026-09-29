'use client'
import { useRouter } from 'next/navigation'

export default function GoBackButton({ label = '← Back' }) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', padding: '8px 0' }}
    >
      {label}
    </button>
  )
}