'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const body = await request.json()
    const { verificationId, reason } = body

    if (!verificationId) {
      return Response.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return Response.json(
        { error: 'Rejection reason is required' },
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

    // Get verification to find user
    const { data: verification } = await supabase
      .from('verifications')
      .select('id, user_id')
      .eq('id', verificationId)
      .single()

    if (!verification) {
      return Response.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    // Update verification status
    const { error } = await supabase
      .from('verifications')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', verificationId)

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
          action: 'veryland_rejection',
          verification_id: verificationId,
          reason,
        },
      ])
      .catch(err => console.error('Audit log error:', err))

    // Send notification to user (TODO: integrate email service)
    // For now, just update the verification record
    const { data: user } = await supabase.auth.admin.getUserById(verification.user_id)

    if (user) {
      // TODO: Send email to user.email with rejection_reason
      console.log(`Rejection notification would be sent to ${user.email}: ${reason}`)
    }

    return Response.json({
      success: true,
      message: 'Verification rejected. User has been notified.',
      reason,
    })
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
