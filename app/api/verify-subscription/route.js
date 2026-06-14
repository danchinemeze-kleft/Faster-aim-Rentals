import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

    // Check for existing active subscription to extend from
    const { data: existing } = await supabase
      .from('Subscription')
      .select('expiry_date')
      .eq('landlord_id', landlordId)
      .eq('status', 'active')
      .order('expiry_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const baseDate = existing?.expiry_date && new Date(existing.expiry_date) > new Date()
      ? new Date(existing.expiry_date)
      : new Date()

    const expiryDate = new Date(baseDate)
    expiryDate.setDate(expiryDate.getDate() + 30)

    const now = new Date().toISOString()

    // Insert new subscription row with all fields
    const { error: subError } = await supabase.from('Subscription').insert({
      landlord_id: landlordId,
      status: 'active',
      start_date: now,
      expiry_date: expiryDate.toISOString(),
      paystack_reference: reference,
      amount: 10000,
    })
    if (subError) throw subError

    return Response.json({
      success: true,
      expiry_date: expiryDate.toISOString(),
    })
  } catch (error) {
    console.error('Verify subscription error:', error)
    return Response.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
