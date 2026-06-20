import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// Paystack retries if it doesn't receive a 200 within 5s.
// This route must return 200 fast even on non-actionable events.
export async function POST(request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature') || ''

    // Verify the request is genuinely from Paystack
    const expectedSig = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')

    if (expectedSig !== signature) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Only act on successful charges — ignore all other event types
    if (event.event !== 'charge.success') {
      return Response.json({ received: true })
    }

    const data = event.data
    const metadata = data?.metadata || {}
    const paystackRef = data?.reference

    // Only handle landlord subscription payments
    if (metadata.payment_type !== 'landlord_listing') {
      return Response.json({ received: true })
    }

    const landlordId = metadata.tenant_id
    if (!landlordId || !paystackRef) {
      console.error('Subscription webhook: missing landlord_id or reference', { landlordId, paystackRef })
      return Response.json({ received: true })
    }

    // Use service role key — no user JWT available in a webhook context
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Idempotency check — the browser path (/api/verify-subscription) may have
    // already activated this reference. Do nothing if it exists.
    const { data: existing } = await supabase
      .from('Subscription')
      .select('id, expiry_date')
      .eq('paystack_reference', paystackRef)
      .maybeSingle()

    if (existing) {
      // Already activated — nothing to do, but still return 200
      return Response.json({ received: true, already_activated: true })
    }

    // Extend from current active sub if one exists, otherwise start from today
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

    // Insert subscription row
    const { error: subErr } = await supabase.from('Subscription').insert({
      landlord_id: landlordId,
      status: 'active',
      start_date: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(),
      paystack_reference: paystackRef,
      amount: 10000,
    })

    if (subErr) {
      console.error('Subscription webhook: insert failed', subErr)
      // Return 200 anyway so Paystack doesn't retry — log the error for manual fix
      return Response.json({ received: true, error: subErr.message })
    }

    // Mark the landlord as subscribed in their Profile
    await supabase
      .from('Profiles')
      .update({ subscribed: true })
      .eq('id', landlordId)

    console.log(`Subscription webhook: activated for landlord ${landlordId}, expires ${expiryDate.toISOString()}`)
    return Response.json({ received: true, activated: true })

  } catch (err) {
    console.error('Subscription webhook error:', err)
    // Always return 200 to prevent Paystack from retrying a broken event
    return Response.json({ received: true, error: err.message })
  }
}
