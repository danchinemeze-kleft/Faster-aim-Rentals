import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return Response.json({ success: false, error: 'No reference provided' }, { status: 400 })
    }

    // Verify with Paystack
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
      return Response.json({ success: false, error: 'Missing metadata' })
    }

    // Service role client bypasses RLS — required for reading another user's profile
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey
    )

    // User JWT client — used only for the authenticated INSERT into Contact_reveals
    const authHeader = request.headers.get('Authorization') || ''
    const accessToken = authHeader.replace('Bearer ', '').trim()
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
      }
    )

    // Check for duplicate reveal (use admin to avoid RLS blocking the check)
    const { data: existing } = await supabaseAdmin
      .from('Contact_reveals')
      .select('id, landlord_phone, landlord_email')
      .eq('tenant_id', tenantId)
      .eq('listing_id', listingId)
      .maybeSingle()

    // Get listing details
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return Response.json({ success: false, error: 'Listing not found' })
    }

    // Get landlord profile (admin key bypasses RLS to read another user's row)
    const { data: landlord } = await supabaseAdmin
      .from('Profiles')
      .select('full_name, phone, email')
      .eq('id', listing.landlord_id)
      .single()

    // Save contact reveal if this is the first time
    if (!existing) {
      await supabaseUser.from('Contact_reveals').insert({
        tenant_id: tenantId,
        landlord_id: listing.landlord_id,
        listing_id: listingId,
        paystack_reference: reference,
        tenant_email: paystackData.data.customer?.email || null,
        landlord_phone: landlord?.phone || null,
        landlord_email: landlord?.email || null,
      })
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
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        property_type: listing.property_type,
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
