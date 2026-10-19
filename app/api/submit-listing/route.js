import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PHONE_OK = /^\+?[0-9]{10,14}$/
const FREE_MONTHLY_LIMIT = 2

export async function POST(request) {
  try {
    const { listing } = await request.json()

    if (!listing) {
      return Response.json({ error: 'Listing data required' }, { status: 400 })
    }

    // Validate required fields
    const required = ['title', 'description', 'location', 'state', 'price', 'price_period', 'property_type', 'images']
    for (const field of required) {
      if (!listing[field]) {
        return Response.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate price is a positive number
    const price = parseInt(listing.price)
    if (isNaN(price) || price <= 0) {
      return Response.json({ error: 'Price must be a valid number' }, { status: 400 })
    }

    // Validate images array
    if (!Array.isArray(listing.images) || listing.images.length === 0) {
      return Response.json({ error: 'At least one image is required' }, { status: 400 })
    }

    if (listing.images.length > 10) {
      return Response.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
    }

    // A property video is required (the form already enforces this)
    if (!listing.video_url) {
      return Response.json({ error: 'A property video is required' }, { status: 400 })
    }

    // Create Supabase server client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // 1. Who is calling? getUser() verifies the session with Supabase.
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return Response.json(
        { error: 'Please log in to continue.', code: 'not_logged_in' },
        { status: 401 }
      )
    }

    // 2. Role + profile completeness
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role, full_name, phone')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'landlord') {
      return Response.json({ error: 'Only landlords can list properties' }, { status: 403 })
    }

    const phone = (profile?.phone || '').replace(/\s+/g, '')
    if (!profile?.full_name?.trim() || !PHONE_OK.test(phone)) {
      return Response.json(
        {
          error: 'Please complete your profile (name and phone number) before listing a property.',
          code: 'profile_incomplete',
        },
        { status: 403 }
      )
    }

    // 3. Free-tier limit, enforced on the server for NEW listings only
    if (!listing.id) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const [{ data: sub }, { count }] = await Promise.all([
        supabase
          .from('Subscription')
          .select('expiry_date')
          .eq('landlord_id', user.id)
          .gte('expiry_date', now.toISOString())
          .limit(1)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('landlord_id', user.id)
          .gte('created_at', startOfMonth.toISOString()),
      ])

      if (!sub && (count || 0) >= FREE_MONTHLY_LIMIT) {
        return Response.json(
          {
            error: 'You have reached your free listing limit for this month. Subscribe to list more properties.',
            code: 'free_limit_reached',
          },
          { status: 403 }
        )
      }
    }

    // Insert listing (will be created with status: pending)
    const payload = {
      landlord_id: user.id,
      title: listing.title,
      property_number: listing.property_number || null,
      description: listing.description,
      location: listing.location,
      city: listing.city || null,
      state: listing.state,
      price,
      price_period: listing.price_period,
      property_type: listing.property_type,
      bedrooms: listing.bedrooms || null,
      bathrooms: listing.bathrooms || null,
      size: listing.size || null,
      amenities: listing.amenities || [],
      available: listing.available !== false,
      is_available: listing.available !== false,
      video_url: listing.video_url,
      images: listing.images,
      status: 'pending',
    }

    // Update if editing, insert if new
    let result
    if (listing.id) {
      result = await supabase
        .from('listings')
        .update(payload)
        .eq('id', listing.id)
        .eq('landlord_id', user.id)
        .select()
    } else {
      result = await supabase
        .from('listings')
        .insert([payload])
        .select()
    }

    const { data, error } = result

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (listing.id && (!data || data.length === 0)) {
      return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      listing: data?.[0],
      message: listing.id ? 'Listing updated successfully' : 'Listing submitted for approval'
    })

  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}