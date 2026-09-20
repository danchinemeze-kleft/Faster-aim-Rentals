'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // Validate price is a number
    if (isNaN(parseInt(listing.price))) {
      return Response.json({ error: 'Price must be a valid number' }, { status: 400 })
    }

    // Validate images array
    if (!Array.isArray(listing.images) || listing.images.length === 0) {
      return Response.json({ error: 'At least one image is required' }, { status: 400 })
    }

    if (listing.images.length > 10) {
      return Response.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
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

    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify landlord role
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'landlord') {
      return Response.json({ error: 'Only landlords can list properties' }, { status: 403 })
    }

    // Insert listing (will be created with status: pending)
    const payload = {
      landlord_id: session.user.id,
      title: listing.title,
      property_number: listing.property_number || null,
      description: listing.description,
      location: listing.location,
      city: listing.city || null,
      state: listing.state,
      price: parseInt(listing.price),
      price_period: listing.price_period,
      property_type: listing.property_type,
      bedrooms: listing.bedrooms || null,
      bathrooms: listing.bathrooms || null,
      size: listing.size || null,
      amenities: listing.amenities || [],
      available: listing.available !== false,
      is_available: listing.available !== false,
      video_url: listing.video_url || null,
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
        .eq('landlord_id', session.user.id)
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
