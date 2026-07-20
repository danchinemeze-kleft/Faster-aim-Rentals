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

export async function POST(req) {
  try {
    const { password, action, payload } = await req.json();

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin password not configured.' }, { status: 500 });
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const handler = ACTIONS[action];
    if (!handler) {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server.' }, { status: 500 });
    }

    // Service role key bypasses RLS — safe here because this route is
    // password-gated and only exposes the whitelisted actions above.
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);

    const { error, data } = await handler(supabase, payload || {});
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}