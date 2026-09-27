'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from './components/Breadcrumb'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const useSupabase = () => {
  return useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])
}

export default function Home() {
  const router = useRouter()
  const supabase = useSupabase()
  const [listingCount, setListingCount] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [user, setUser] = useState(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Fetch user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: