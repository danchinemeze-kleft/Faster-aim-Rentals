import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { listing_id } = await req.json();
    if (!listing_id) return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);

    const { data: sale } = await supabase
      .from('property_sales')
      .select('status, seller_id')
      .eq('id', listing_id)
      .single();

    if (!sale || sale.status !== 'active') {
      return NextResponse.json({ error: 'Contact not available for unverified listings' }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from('Profiles')
      .select('full_name, phone, email')
      .eq('id', sale.seller_id)
      .single();

    return NextResponse.json({ seller: profile || null });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
