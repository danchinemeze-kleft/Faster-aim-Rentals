import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return Response.json({ success: false, error: 'No reference provided' }, { status: 400 })
    }

    // Verify with Paystack — this IS the authorization for the reveal
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      }
    })

    const paystackData = await paystackRes.json()

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return Response.json({ success: false, error: 'Payment not successful' })
    }

    const metadata = paystackData.data.metadata
    const listingId = metadata?.listing_id
    const tenantId = metadata?.tenant_id

    if (!listingId || !tenantId) {
      return Response.json({ success: false, error: 'Missing payment metadata' })
    }

    // Use service role key — bypasses RLS for all server-side DB operations.
    // The Paystack verification above is the authorization proof; no client JWT needed.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Check for duplicate reveal (prevents double-charging)
    const { data: existing } = await supabase
      .from('Contact_reveals')
      .select('id, landlord_phone, landlord_email, landlord_id')
      .eq('tenant_id', tenantId)
      .eq('listing_id', listingId)
      .maybeSingle()

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return Response.json({ success: false, error: 'Listing not found' })
    }

    // Get landlord profile (service role key bypasses RLS to read another user's row)
    const { data: landlord } = await supabase
      .from('Profiles')
      .select('full_name, phone, email')
      .eq('id', listing.landlord_id)
      .single()

    // Save reveal record if first time — service role key allows insert regardless of JWT
    if (!existing) {
      await supabase.from('Contact_reveals').insert({
        tenant_id: tenantId,
        landlord_id: listing.landlord_id,
        listing_id: listingId,
        paystack_reference: reference,
        tenant_email: paystackData.data.customer?.email || null,
        landlord_phone: landlord?.phone || null,
        landlord_email: landlord?.email || null,
      })

      // Credit affiliate commission if a ref_code was attached
      const refCode = metadata?.ref_code
      if (refCode) {
        const { data: affiliate } = await supabase
          .from('affiliates').select('id').eq('ref_code', refCode).eq('status', 'active').maybeSingle()
        // Prevent self-referral
        if (affiliate && affiliate.id !== tenantId) {
          await supabase.from('affiliate_commissions').insert({
            affiliate_id: affiliate.id,
            ref_code: refCode,
            transaction_type: 'reveal',
            transaction_amount: 5000,
            commission_amount: 500,
            paystack_reference: reference,
            referred_user_id: tenantId,
            status: 'pending',
          })
        }
      }
    }

    const contactPhone = landlord?.phone || existing?.landlord_phone || null
    const contactEmail = landlord?.email || existing?.landlord_email || null
    const contactName = landlord?.full_name || null

    return Response.json({
      success: true,
      listing: {
        title: listing.title,
        location: listing.location,
        state: listing.state,
        price: listing.price,
        price_period: listing.price_period,
      },
      contact: {
        full_name: contactName,
        phone: contactPhone,
        email: contactEmail,
        whatsapp: contactPhone,
      }
    })

  } catch (error) {
    console.error('Verify payment error:', error)
    return Response.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
