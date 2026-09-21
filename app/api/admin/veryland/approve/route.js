'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const body = await request.json()
    const { verificationId, badgeTier } = body

    if (!verificationId) {
      return Response.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      )
    }

    if (!['blue', 'deep_green'].includes(badgeTier)) {
      return Response.json(
        { error: 'Invalid badge tier' },
        { status: 400 }
      )
    }

    // Get authenticated admin
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Update verification with badge tier and approved status
    const { data: verification, error } = await supabase
      .from('verifications')
      .update({
        status: 'approved',
        badge_tier: badgeTier,
      })
      .eq('id', verificationId)
      .select()

    if (error) {
      console.error('DB error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Log admin action
    await supabase
      .from('admin_logs')
      .insert([
        {
          admin_id: session.user.id,
          action: 'veryland_approval',
          verification_id: verificationId,
          badge_tier: badgeTier,
        },
      ])
      .catch(err => console.error('Audit log error:', err))

    // Update user's Profiles to mark as veryland_verified
    if (verification[0]) {
      const userId = verification[0].user_id
      await supabase
        .from('Profiles')
        .update({
          veryland_verified: true,
          veryland_badge: badgeTier,
        })
        .eq('id', userId)

      // Also update landlord's listings so badge appears publicly on browse and listing pages
      await supabase
        .from('listings')
        .update({
          veryland_badge: badgeTier,
          verification_id: verificationId,
        })
        .eq('landlord_id', userId)
    }

    return Response.json({
      success: true,
      verification: verification[0],
      message: `Verification approved with ${badgeTier} badge`,
    })
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
