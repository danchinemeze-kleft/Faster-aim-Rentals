'use client'
import { useRouter } from 'next/navigation'

export default function BackArrow() {
  const router = useRouter()
  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }
  return (
    <button type="button" onClick={goBack} className="faim-nf-back" aria-label="Go back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}