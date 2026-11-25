import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Whitelist of allowed actions -> how to perform them.
// Keeping this as an explicit map (instead of letting the client send
// arbitrary table/column names) is what makes it safe to use the
// service role key here.
const ACTIONS = {
  updateListingStatus: async (supabase, { id, status }) => {
    return supabase.from('listings').update({ status }).eq('id', id);
  },
  deleteListing: async (supabase, { id }) => {
    return supabase.from('listings').delete().eq('id', id);
  },
  approveVeryland: async (supabase, { id, level, listingId }) => {
    const newStatus = level === 'yellow' ? 'approved_partial' : 'approved_full';
    const res = await supabase
      .from('veryland_submissions')
      .update({ status: newStatus, badge_level: level, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (!res.error && listingId) {
      await supabase.from('listings').update({ veryland_badge: level }).eq('id', listingId);
    }
    return res;
  },
  rejectVeryland: async (supabase, { id, notes }) => {
    return supabase
      .from('veryland_submissions')
      .update({ status: 'rejected', admin_notes: notes || '', reviewed_at: new Date().toISOString() })
      .eq('id', id);
  },
  approveSaleListing: async (supabase, { id }) => {
    return supabase.from('property_sales').update({ status: 'approved' }).eq('id', id);
  },
  rejectSaleListing: async (supabase, { id, reason }) => {
    return supabase.from('property_sales').update({ status: 'rejected', admin_notes: reason || '' }).eq('id', id);
  },
};

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

    // Service role key bypasses RLS — safe here because this route verifies
    // the caller's Supabase JWT, checks admin_users, logs to admin_audit_log,
    // and only exposes the whitelisted actions above.
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json().catch(() => ({}));
    const { action, payload, accessToken } = body || {};

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : accessToken
        ? String(accessToken).trim()
        : '';

    const actionName = action ? `admin_action:${action}` : 'admin_action:unknown';

    if (!token) {
      await supabase.from('admin_audit_log').insert({
        user_id: null,
        email: null,
        ip,
        action: actionName,
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
        action: actionName,
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
        action: actionName,
        success: false,
      });
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const handler = ACTIONS[action];
    if (!handler) {
      await supabase.from('admin_audit_log').insert({
        user_id: user.id,
        email: user.email || null,
        ip,
        action: actionName,
        success: false,
      });
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const { error, data } = await handler(supabase, payload || {});
    if (error) {
      await supabase.from('admin_audit_log').insert({
        user_id: user.id,
        email: user.email || null,
        ip,
        action: actionName,
        success: false,
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('admin_audit_log').insert({
      user_id: user.id,
      email: user.email || null,
      ip,
      action: actionName,
      success: true,
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}