'use client'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function RefCapture() {
  const searchParams = useSearchParams()
  
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && /^[A-Z0-9]{6,12}$/.test(ref)) {
      document.cookie = `mrrent_ref=${ref};max-age=${30 * 24 * 60 * 60};path=/;SameSite=Lax`
    }
  }, [searchParams])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Try to get ref code from URL first, then fall back to cookie
        const urlParams = new URLSearchParams(window.location.search)
        let refCode = urlParams.get('ref')
        if (!refCode || !/^[A-Z0-9]{6,12}$/.test(refCode)) {
          const match = document.cookie.match(new RegExp('(^| )mrrent_ref=([^;]+)'))
          refCode = match ? match[2] : null
        }

        if (refCode) {
          try {
            // 1. Find the affiliate with this ref_code
            const { data: affiliate } = await supabase
              .from('affiliates')
              .select('id')
              .eq('ref_code', refCode)
              .maybeSingle()

            if (affiliate) {
              // 2. Check if a referral record already exists to prevent duplicates
              const { data: existing } = await supabase
                .from('referrals')
                .select('id')
                .eq('referred_user_id', session.user.id)
                .maybeSingle()

              if (!existing) {
                // 3. Insert the referral link
                await supabase
                  .from('referrals')
                  .insert({
                    affiliate_id: affiliate.id,
                    referred_user_id: session.user.id
                  })
              }
            }
          } catch (err) {
            console.error('Error recording referral signup:', err)
          }
        }
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  return null
}
