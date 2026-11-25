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

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : body?.accessToken
        ? String(body.accessToken).trim()
        : '';

    if (!token) {
      await supabase.from('admin_audit_log').insert({
        user_id: null,
        email: null,
        ip,
        action: 'admin_login_check',
        success: false,
      });
      return NextResponse.json({ error: 'Missing authentication token.' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      await supabase.from('admin_audit_log').insert({
        user_id: null,
        email: null,
        ip,
        action: 'admin_login_check',
        success: false,
      });
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

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
        action: 'admin_login_check',
        success: false,
      });
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    await supabase.from('admin_audit_log').insert({
      user_id: user.id,
      email: user.email || null,
      ip,
      action: 'admin_login_check',
      success: true,
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}