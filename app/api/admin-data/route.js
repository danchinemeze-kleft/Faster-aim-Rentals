import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin password not configured.' }, { status: 500 });
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server.' }, { status: 500 });
    }

    // Service role key bypasses all RLS — admin use only, never expose to client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey
    );

    const [
      { data: listingData },
      { data: profileData },
      { data: subData },
      { data: vData },
      { data: saleData },
    ] = await Promise.all([
      supabase.from('listings').select('*').order('created_at', { ascending: false }),
      supabase.from('Profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('Subscription').select('*').order('expiry_date', { ascending: false }),
      supabase.from('veryland_submissions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('property_sales').select('*, seller:Profiles!seller_id(full_name, email, phone)').order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      listings: listingData || [],
      profiles: profileData || [],
      subscriptions: subData || [],
      verylandSubmissions: vData || [],
      saleListings: saleData || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
