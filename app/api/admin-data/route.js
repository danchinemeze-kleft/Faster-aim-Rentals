import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req) {
  const ip = getClientIp(req);

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Supabase server environment variables not configured.' },
        { status: 500 }
      );
    }

    // Service role key bypasses all RLS — admin use only, never expose to client
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Read Bearer token from Authorization header (or JSON body fallback)
    const authHeader = req.headers.get('authorization') || '';
    let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      try {
        const body = await req.json();
        if (body?.accessToken) {
          token = String(body.accessToken).trim();
        }
      } catch {
        // Empty or non-JSON body is fine when no token is provided
      }
    }

    if (!token) {
      await supabase.from('admin_audit_log').insert({
        user_id: null,
        email: null,
        ip,
        action: 'admin_hub_fetch',
        success: false,
      });
      return NextResponse.json({ error: 'Missing authentication token.' }, { status: 401 });
    }

    // Verify the user's Supabase JWT access token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      await supabase.from('admin_audit_log').insert({
        user_id: null,
        email: null,
        ip,
        action: 'admin_hub_fetch',
        success: false,
      });
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    // Verify user_id exists in admin_users
    const { data: adminRecord, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      await supabase.from('admin_audit_log').insert({
        user_id: user.id,
        email: user.email || null,
        ip,
        action: 'admin_hub_fetch',
        success: false,
      });
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    // Log successful admin access
    await supabase.from('admin_audit_log').insert({
      user_id: user.id,
      email: user.email || null,
      ip,
      action: 'admin_hub_fetch',
      success: true,
    });

    const [
      { data: listingData, error: listingErr },
      { data: profileData, error: profileErr },
      { data: subData, error: subErr },
      { data: vData, error: vErr },
      { data: saleData, error: saleErr },
    ] = await Promise.all([
      supabase.from('listings').select('*').order('created_at', { ascending: false }),
      supabase.from('Profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('Subscription').select('*').order('expiry_date', { ascending: false }),
      supabase.from('veryland_submissions').select('*').order('submitted_at', { ascending: false }),
      supabase
        .from('property_sales')
        .select('*, seller:Profiles!seller_id(full_name, email, phone)')
        .order('created_at', { ascending: false }),
    ]);

    const firstQueryError = listingErr || profileErr || subErr || vErr || saleErr;
    if (firstQueryError) {
      return NextResponse.json({ error: firstQueryError.message }, { status: 500 });
    }

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