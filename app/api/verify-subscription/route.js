import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { reference } = await request.json()
    if (!reference) {
      return Response.json({ success: false, error: 'No reference provided' }, { status: 400 })
    }

    // Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })
    const paystackData = await paystackRes.json()

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return Response.json({ success: false, error: 'Payment not successful' })
    }

    const metadata = paystackData.data.metadata
    if (metadata?.payment_type !== 'landlord_listing') {
      return Response.json({ success: false, error: 'Invalid payment type' })
    }

    const landlordId = metadata?.tenant_id
    if (!landlordId) {
      return Response.json({ success: false, error: 'Missing landlord ID in payment metadata' })
    }

    // Use service role key if available, otherwise use session-authenticated client
    const cookieStore = await cookies()
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          }
        }
      }
    )

    // Prevent duplicate activations for the same Paystack reference
    const { data: duplicate } = await supabase
      .from('Subscription')
      .select('id')
      .eq('paystack_reference', reference)
      .maybeSingle()

    if (duplicate) {
      // Already activated — return success with existing expiry
      const { data: existing } = await supabase
        .from('Subscription')
        .select('expiry_date')
        .eq('paystack_reference', reference)
        .maybeSingle()
      return Response.json({ success: true, expiry_date: existing?.expiry_date, already_activated: true })
    }

    // Check for existing active subscription to extend from
    const { data: activeSub } = await supabase
      .from('Subscription')
      .select('expiry_date')
      .eq('landlord_id', landlordId)
      .gte('expiry_date', new Date().toISOString())
      .order('expiry_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const baseDate = activeSub?.expiry_date && new Date(activeSub.expiry_date) > new Date()
      ? new Date(activeSub.expiry_date)
      : new Date()

    const expiryDate = new Date(baseDate)
    expiryDate.setDate(expiryDate.getDate() + 30)

    const now = new Date().toISOString()

    const { error: subError } = await supabase.from('Subscription').insert({
      landlord_id: landlordId,
      status: 'active',
      start_date: now,
      expiry_date: expiryDate.toISOString(),
      paystack_reference: reference,
      amount: 10000,
    })

    if (subError) {
      console.error('Subscription insert error:', subError)
      return Response.json({ success: false, error: 'Failed to save subscription: ' + subError.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      expiry_date: expiryDate.toISOString(),
    })
  } catch (error) {
    console.error('Verify subscription error:', error)
    return Response.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 })
  }
}
