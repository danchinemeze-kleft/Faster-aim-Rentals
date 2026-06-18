'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function RefCapture() {
  const searchParams = useSearchParams()
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && /^[A-Z0-9]{6,12}$/.test(ref)) {
      document.cookie = `mrrent_ref=${ref};max-age=${30 * 24 * 60 * 60};path=/;SameSite=Lax`
    }
  }, [searchParams])
  return null
}
