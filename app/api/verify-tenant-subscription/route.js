import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { reference } = await request.json()
    if (!reference) {
      return Response.json({ success: false, error: 'No reference provided' }, { status: 400 })
    }

    // Verify with Paystack first (always server-side with secret key)
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })
    const paystackData = await paystackRes.json()

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return Response.json({ success: false, error: 'Payment not successful' })
    }

    const metadata = paystackData.data.metadata
    if (metadata?.payment_type !== 'tenant_subscription') {
      return Response.json({ success: false, error: 'Invalid payment type' })
    }

    const tenantId = metadata?.tenant_id
    if (!tenantId) {
      return Response.json({ success: false, error: 'Missing tenant ID in payment metadata' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Idempotency — webhook may have already activated this
    const { data: duplicate } = await supabase
      .from('Tenant_subscription')
      .select('id, expiry_date')
      .eq('paystack_reference', reference)
      .maybeSingle()

    if (duplicate) {
      return Response.json({ success: true, expiry_date: duplicate.expiry_date, already_activated: true })
    }

    // Extend from current active sub, otherwise start from today
    const { data: activeSub } = await supabase
      .from('Tenant_subscription')
      .select('expiry_date')
      .eq('user_id', tenantId)
      .eq('status', 'active')
      .gte('expiry_date', new Date().toISOString())
      .order('expiry_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const baseDate = activeSub?.expiry_date && new Date(activeSub.expiry_date) > new Date()
      ? new Date(activeSub.expiry_date)
      : new Date()

    const expiryDate = new Date(baseDate)
    expiryDate.setDate(expiryDate.getDate() + 30)

    const { error: subError } = await supabase.from('Tenant_subscription').insert({
      user_id: tenantId,
      plan_type: 'monthly',
      status: 'active',
      start_date: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(),
      paystack_reference: reference,
      amount: 25000,
    })

    if (subError) {
      console.error('Verify tenant subscription error:', subError)
      return Response.json({ success: false, error: 'Failed to activate subscription: ' + subError.message }, { status: 500 })
    }

    return Response.json({ success: true, expiry_date: expiryDate.toISOString() })

  } catch (error) {
    console.error('Verify tenant subscription error:', error)
    return Response.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 })
  }
}
