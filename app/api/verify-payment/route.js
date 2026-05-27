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

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    // Get listing details
    const { data: listing } = await supabase
      .from('listings')
      .select('*, Profiles(full_name, phone, email)')
      .eq('id', listingId)
      .single()

    if (!listing) {
      return Response.json({ success: false, error: 'Listing not found' })
    }

    // Save contact reveal record
    await supabase.from('Contact_reveals').upsert({
      tenant_id: tenantId,
      landlord_id: listing.landlord_id,
      listing_id: listingId,
      paystack_reference: reference,
      landlord_phone: listing.Profiles?.phone,
      landlord_email: listing.Profiles?.email,
    }, { onConflict: 'tenant_id,listing_id' })

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
        full_name: listing.Profiles?.full_name,
        phone: listing.Profiles?.phone,
        email: listing.Profiles?.email,
        whatsapp: listing.Profiles?.phone,
      }
    })

  } catch (error) {
    console.error('Verify payment error:', error)
    return Response.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
