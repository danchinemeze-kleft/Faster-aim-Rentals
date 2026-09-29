'use client'
import { useRouter } from 'next/navigation'

export default function GoBackButton({ label = '← Back' }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', padding: '8px 0' }}
    >
      {label}
    </button>
  )
}