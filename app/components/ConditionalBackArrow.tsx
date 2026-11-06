'use client'

import { usePathname } from 'next/navigation'
import BackArrow from 
'./BackArrow'
export default function ConditionalBackArrow() {
  const pathname = usePathname()

  // Hide on homepage only
  if (pathname === '/') return null

  return <BackArrow />
}