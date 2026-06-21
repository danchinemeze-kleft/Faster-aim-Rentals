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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // --- Tenant subscription ---
    if (metadata.payment_type === 'tenant_subscription') {
      const tenantId = metadata.tenant_id
      if (!tenantId || !paystackRef) {
        console.error('Tenant subscription webhook: missing tenant_id or reference')
        return Response.json({ received: true })
      }

      const { data: existingTenantSub } = await supabase
        .from('Tenant_subscription')
        .select('id')
        .eq('paystack_reference', paystackRef)
        .maybeSingle()

      if (existingTenantSub) {
        return Response.json({ received: true, already_activated: true })
      }

      // Extend from current active sub, otherwise start from today
      const { data: activeTenantSub } = await supabase
        .from('Tenant_subscription')
        .select('expiry_date')
        .eq('user_id', tenantId)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString())
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      const tenantBase = activeTenantSub?.expiry_date && new Date(activeTenantSub.expiry_date) > new Date()
        ? new Date(activeTenantSub.expiry_date)
        : new Date()

      const tenantExpiry = new Date(tenantBase)
      tenantExpiry.setDate(tenantExpiry.getDate() + 30)

      const { error: tenantSubErr } = await supabase.from('Tenant_subscription').insert({
        user_id: tenantId,
        plan_type: 'monthly',
        status: 'active',
        start_date: new Date().toISOString(),
        expiry_date: tenantExpiry.toISOString(),
        paystack_reference: paystackRef,
        amount: 25000,
      })

      if (tenantSubErr) {
        console.error('Tenant subscription webhook: insert failed', tenantSubErr)
        return Response.json({ received: true, error: tenantSubErr.message })
      }

      console.log(`Tenant subscription webhook: activated for tenant ${tenantId}, expires ${tenantExpiry.toISOString()}`)
      return Response.json({ received: true, activated: true })
    }

    // --- Landlord subscription ---
    if (metadata.payment_type !== 'landlord_listing') {
      return Response.json({ received: true })
    }

    const landlordId = metadata.tenant_id
    if (!landlordId || !paystackRef) {
      console.error('Subscription webhook: missing landlord_id or reference', { landlordId, paystackRef })
      return Response.json({ received: true })
    }

    // Idempotency check — the browser path (/api/verify-subscription) may have
    // already activated this reference. Do nothing if it exists.
    const { data: existing } = await supabase
      .from('Subscription')
      .select('id, expiry_date')
      .eq('paystack_reference', paystackRef)
      .maybeSingle()

    if (existing) {
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
      return Response.json({ received: true, error: subErr.message })
    }

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
