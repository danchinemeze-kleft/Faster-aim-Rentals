import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// Paystack retries if it doesn't receive a 200 within 5s.
// This route must always return 200 fast, even on non-actionable events.
export async function POST(request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature') || ''

    // 1. Verify the request is genuinely from Paystack via HMAC SHA512
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set')
      return Response.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const expectedSig = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex')

    if (expectedSig !== signature) {
      console.warn('Paystack webhook: Invalid signature')
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event
    const data = event.data || {}

    // Service role client bypasses RLS for authoritative server updates
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // =========================================================================
    // EVENT: charge.success
    // =========================================================================
    if (eventType === 'charge.success') {
      const metadata = data.metadata || {}
      const paystackRef = data.reference
      const paymentType = metadata.payment_type
      const customerEmail = data.customer?.email || null

      console.log(`Paystack webhook charge.success: ref=${paystackRef}, type=${paymentType}`)

      // --- Helper: Credit Affiliate Commission safely and idempotently ---
      async function creditAffiliate(refCode, payerId, transType, transAmount, commissionAmount) {
        if (!refCode || !paystackRef) return
        try {
          const { data: affiliate } = await supabase
            .from('affiliates')
            .select('id')
            .eq('ref_code', refCode)
            .eq('status', 'active')
            .maybeSingle()

          // Prevent self-referral and check for existing commission on this reference
          if (affiliate && affiliate.id !== payerId) {
            const { data: existingComm } = await supabase
              .from('affiliate_commissions')
              .select('id')
              .eq('paystack_reference', paystackRef)
              .maybeSingle()

            if (!existingComm) {
              await supabase.from('affiliate_commissions').insert({
                affiliate_id: affiliate.id,
                ref_code: refCode,
                transaction_type: transType,
                transaction_amount: transAmount,
                commission_amount: commissionAmount,
                paystack_reference: paystackRef,
                referred_user_id: payerId,
                status: 'pending',
              })
              console.log(`Affiliate commission credited: ₦${commissionAmount} to ${affiliate.id} (ref=${refCode})`)
            }
          }
        } catch (commErr) {
          console.error('Error crediting affiliate commission in webhook:', commErr)
        }
      }

      // -----------------------------------------------------------------------
      // A. TENANT SUBSCRIPTION (₦25,000 / 30 days)
      // -----------------------------------------------------------------------
      if (paymentType === 'tenant_subscription') {
        const tenantId = metadata.tenant_id
        if (!tenantId || !paystackRef) {
          console.error('Tenant subscription webhook: missing tenant_id or reference')
          return Response.json({ received: true })
        }

        // Idempotency: Check if already activated
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

        // Credit affiliate if referral code was passed
        if (metadata.ref_code) {
          await creditAffiliate(metadata.ref_code, tenantId, 'tenant_subscription', 25000, 2000)
        }

        console.log(`Tenant subscription activated for ${tenantId}, expires ${tenantExpiry.toISOString()}`)
        return Response.json({ received: true, activated: true })
      }

      // -----------------------------------------------------------------------
      // B. LANDLORD SUBSCRIPTION (₦10,000 / 30 days)
      // -----------------------------------------------------------------------
      if (paymentType === 'landlord_listing' || paymentType === 'landlord') {
        const landlordId = metadata.tenant_id
        if (!landlordId || !paystackRef) {
          console.error('Subscription webhook: missing landlord_id or reference', { landlordId, paystackRef })
          return Response.json({ received: true })
        }

        // Idempotency: Check if already activated
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

        // Update Profile
        await supabase
          .from('Profiles')
          .update({ subscribed: true })
          .eq('id', landlordId)

        // Credit affiliate if referral code was passed
        if (metadata.ref_code) {
          await creditAffiliate(metadata.ref_code, landlordId, 'subscription', 10000, 2000)
        }

        console.log(`Landlord subscription activated for ${landlordId}, expires ${expiryDate.toISOString()}`)
        return Response.json({ received: true, activated: true })
      }

      // -----------------------------------------------------------------------
      // C. ONE-TIME CONTACT REVEAL (₦5,000)
      // -----------------------------------------------------------------------
      if (paymentType === 'reveal' || paymentType === 'reveal_single') {
        const listingId = metadata.listing_id
        const tenantId = metadata.tenant_id

        if (!listingId || !tenantId) {
          console.error('Reveal webhook: missing listing_id or tenant_id', { listingId, tenantId })
          return Response.json({ received: true })
        }

        // Idempotency: Check if already revealed
        const { data: existingReveal } = await supabase
          .from('Contact_reveals')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('listing_id', listingId)
          .maybeSingle()

        if (!existingReveal) {
          // Fetch listing details to obtain landlord_id
          const { data: listing } = await supabase
            .from('listings')
            .select('id, landlord_id')
            .eq('id', listingId)
            .maybeSingle()

          let landlordPhone = null
          let landlordEmail = null

          if (listing?.landlord_id) {
            const { data: landlordProfile } = await supabase
              .from('Profiles')
              .select('phone, email')
              .eq('id', listing.landlord_id)
              .maybeSingle()

            landlordPhone = landlordProfile?.phone || null
            landlordEmail = landlordProfile?.email || null
          }

          const { error: revealErr } = await supabase.from('Contact_reveals').insert({
            tenant_id: tenantId,
            landlord_id: listing?.landlord_id || null,
            listing_id: listingId,
            paystack_reference: paystackRef,
            tenant_email: customerEmail,
            landlord_phone: landlordPhone,
            landlord_email: landlordEmail,
          })

          if (revealErr) {
            console.error('Reveal webhook: insert failed', revealErr)
          } else {
            console.log(`Contact revealed via webhook for tenant ${tenantId}, listing ${listingId}`)
          }

          // Credit affiliate commission for contact reveal
          if (metadata.ref_code) {
            await creditAffiliate(metadata.ref_code, tenantId, 'reveal', 5000, 500)
          }
        }

        return Response.json({ received: true, revealed: true })
      }

      // -----------------------------------------------------------------------
      // D. PROPERTY SALE ACTIVATION (₦15,000)
      // -----------------------------------------------------------------------
      if (paymentType === 'sale_activation' || paymentType === 'sale_listing') {
        const listingId = metadata.listing_id
        if (listingId) {
          await supabase
            .from('property_sales')
            .update({ listing_fee_paid: true, listing_fee_reference: paystackRef, status: 'active' })
            .eq('id', listingId)
          console.log(`Property sale listing activated via webhook: ${listingId}`)
        }
        return Response.json({ received: true, activated: true })
      }

      // Unrecognized charge.success payment_type — still acknowledge 200
      return Response.json({ received: true, unhandled_payment_type: paymentType })
    }

    // =========================================================================
    // EVENT: subscription.disable / subscription.not_renew
    // =========================================================================
    if (eventType === 'subscription.disable' || eventType === 'subscription.not_renew') {
      const subCode = data.subscription_code
      const customerEmail = data.customer?.email

      console.log(`Subscription disabled/cancelled event: code=${subCode}, email=${customerEmail}`)

      // Look up user by email or subscription code in Subscription or Tenant_subscription
      if (customerEmail) {
        const { data: userProfile } = await supabase
          .from('Profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle()

        if (userProfile) {
          // Update landlord subscription
          await supabase
            .from('Subscription')
            .update({ status: 'cancelled' })
            .eq('landlord_id', userProfile.id)
            .eq('status', 'active')

          // Update tenant subscription
          await supabase
            .from('Tenant_subscription')
            .update({ status: 'cancelled' })
            .eq('user_id', userProfile.id)
            .eq('status', 'active')

          console.log(`Marked active subscriptions as cancelled for user ${userProfile.id}`)
        }
      }

      return Response.json({ received: true, cancelled: true })
    }

    // =========================================================================
    // EVENT: invoice.payment_failed
    // =========================================================================
    if (eventType === 'invoice.payment_failed') {
      const customerEmail = data.customer?.email
      console.warn(`Invoice payment failed for customer: ${customerEmail}`)

      if (customerEmail) {
        const { data: userProfile } = await supabase
          .from('Profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle()

        if (userProfile) {
          await supabase
            .from('Subscription')
            .update({ status: 'past_due' })
            .eq('landlord_id', userProfile.id)
            .eq('status', 'active')

          await supabase
            .from('Tenant_subscription')
            .update({ status: 'past_due' })
            .eq('user_id', userProfile.id)
            .eq('status', 'active')
        }
      }

      return Response.json({ received: true, payment_failed: true })
    }

    // Acknowledge all other unhandled events safely
    return Response.json({ received: true })

  } catch (err) {
    console.error('Subscription webhook error:', err)
    // Always return 200 to prevent Paystack from endlessly retrying
    return Response.json({ received: true, error: err.message })
  }
}
