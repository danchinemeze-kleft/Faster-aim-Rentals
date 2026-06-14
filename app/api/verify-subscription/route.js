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
    if (metadata?.payment_type !== 'landlord_listing') {
      return Response.json({ success: false, error: 'Invalid payment type' })
    }

    const landlordId = metadata?.tenant_id
    if (!landlordId) {
      return Response.json({ success: false, error: 'Missing landlord ID in payment metadata' })
    }

    // Authenticate Supabase using the user's access token passed from the client.
    // This satisfies the RLS policy: auth.uid() = landlord_id
    const authHeader = request.headers.get('Authorization') || ''
    const accessToken = authHeader.replace('Bearer ', '').trim()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
      }
    )

    // Prevent duplicate activations for the same Paystack reference
    const { data: duplicate } = await supabase
      .from('Subscription')
      .select('id, expiry_date')
      .eq('paystack_reference', reference)
      .maybeSingle()

    if (duplicate) {
      return Response.json({ success: true, expiry_date: duplicate.expiry_date, already_activated: true })
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

    const { error: subError } = await supabase.from('Subscription').insert({
      landlord_id: landlordId,
      status: 'active',
      start_date: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(),
      paystack_reference: reference,
      amount: 10000,
    })

    if (subError) {
      console.error('Subscription insert error:', subError)
      return Response.json({ success: false, error: 'Failed to save subscription: ' + subError.message }, { status: 500 })
    }

    return Response.json({ success: true, expiry_date: expiryDate.toISOString() })

  } catch (error) {
    console.error('Verify subscription error:', error)
    return Response.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 })
  }
}
