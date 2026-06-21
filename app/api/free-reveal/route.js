import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { listing_id } = await request.json()

    if (!listing_id) {
      return Response.json({ success: false, error: 'Missing listing_id' }, { status: 400 })
    }

    // Get authenticated user from session cookie
    const cookieStore = cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value },
        },
      }
    )

    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return Response.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Service role key for all DB writes — bypasses RLS safely on the server
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Server-side subscription check — cannot be faked by the client
    const { data: sub } = await supabase
      .from('Tenant_subscription')
      .select('id, plan_type, expiry_date')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('expiry_date', new Date().toISOString())
      .order('expiry_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!sub) {
      return Response.json({ success: false, error: 'No active subscription' }, { status: 403 })
    }

    // Skip insert if already revealed for this listing
    const { data: existing } = await supabase
      .from('Contact_reveals')
      .select('landlord_phone, landlord_email')
      .eq('tenant_id', user.id)
      .eq('listing_id', listing_id)
      .maybeSingle()

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, title, location, state, price, price_period, landlord_id')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return Response.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }

    // Get landlord contact
    const { data: landlord } = await supabase
      .from('Profiles')
      .select('full_name, phone, email')
      .eq('id', listing.landlord_id)
      .single()

    if (!existing) {
      await supabase.from('Contact_reveals').insert({
        tenant_id: user.id,
        landlord_id: listing.landlord_id,
        listing_id,
        paystack_reference: `sub_${sub.id}_${Date.now()}`,
        tenant_email: user.email || null,
        landlord_phone: landlord?.phone || null,
        landlord_email: landlord?.email || null,
      })
    }

    const contactPhone = landlord?.phone || existing?.landlord_phone || null
    const contactEmail = landlord?.email || existing?.landlord_email || null

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
        full_name: landlord?.full_name || null,
        phone: contactPhone,
        email: contactEmail,
        whatsapp: contactPhone,
      },
    })

  } catch (error) {
    console.error('Free reveal error:', error)
    return Response.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
