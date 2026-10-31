import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch {}
  if (body.confirm !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm.' }, { status: 400 });
  }

  const token = (request.headers.get('authorization') || '').replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Please log in first.' }, { status: 401 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: { user }, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !user) {
    return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
  }

  const uid = user.id;
  const emails = [...new Set([user.email, (user.email || '').toLowerCase()].filter(Boolean))];

  // Safety: admin accounts cannot be deleted from this page
  const { data: prof } = await admin.from('Profiles').select('role').eq('id', uid).maybeSingle();
  if (prof?.role === 'admin') {
    return NextResponse.json({ error: 'Admin accounts cannot be deleted here.' }, { status: 403 });
  }

  const step = async (table, column, value) => {
    if (Array.isArray(value) && value.length === 0) return;
    let q = admin.from(table).delete();
    q = Array.isArray(value) ? q.in(column, value) : q.eq(column, value);
    const { error } = await q;
    if (error) throw { table, error };
  };

  const ids = async (table, column, value) => {
    let q = admin.from(table).select('id');
    q = Array.isArray(value) ? q.in(column, value) : q.eq(column, value);
    const { data, error } = await q;
    if (error) throw { table, error };
    return (data || []).map((r) => r.id);
  };

  try {
    const listingIds = await ids('listings', 'landlord_id', uid);
    const verificationIds = await ids('verifications', 'user_id', uid);
    const professionalIds = await ids('professionals', 'user_id', uid);
    const affiliateIds = await ids('affiliates', 'email', emails);

    // Professionals
    await step('professional_documents', 'professional_id', professionalIds);
    await step('professionals', 'user_id', uid);

    // Veryland / verification data
    await step('title_chain', 'verification_id', verificationIds);
    await step('documents', 'verification_id', verificationIds);
    await step('admin_logs', 'verification_id', verificationIds);
    await step('veryland_submissions', 'user_id', uid);
    await step('veryland_submissions', 'listing_id', listingIds);

    // Reveals and activity (also removes other tenants' reveal records for this user's listings)
    await step('Contact_reveals', 'tenant_id', uid);
    await step('Contact_reveals', 'landlord_id', uid);
    await step('Contact_reveals', 'listing_id', listingIds);
    await step('user_activity', 'user_id', uid);
    await step('user_activity', 'listing_id', listingIds);

    // Listings, sales, verifications
    await step('listings', 'landlord_id', uid);
    await step('property_sales', 'seller_id', uid);
    await step('verifications', 'user_id', uid);

    // Chat, feedback, comments
    await step('Feedback', 'user_id', uid);
    await step('homepage_comments', 'user_id', uid);
    await step('ai_facts', 'user_id', uid);
    await step('ai_memory', 'user_id', uid);

    // Rewards (Fastcoin)
    await step('fc_referrals', 'referrer_id', uid);
    await step('fc_referrals', 'invitee_id', uid);
    await step('fc_redemptions', 'user_id', uid);
    await step('fc_ledger', 'user_id', uid);
    await step('fc_balances', 'user_id', uid);

    // Payment records (remove these two lines if you prefer to keep them)
    await step('Subscription', 'landlord_id', uid);
    await step('Tenant_subscription', 'user_id', uid);

    // Affiliate data
    await step('affiliate_commissions', 'referred_user_id', uid);
    await step('referrals', 'referred_user_id', uid);
    await step('affiliate_commissions', 'affiliate_id', affiliateIds);
    await step('referrals', 'affiliate_id', affiliateIds);
    await step('affiliates', 'email', emails);

    // Messages sent by this email
    await step('contact_messages', 'email', emails);
    await step('support_messages', 'email', emails);
    await step('Feedback', 'email', emails);

    // Profile last
    await step('Profiles', 'id', uid);
  } catch (e) {
    console.error('delete-account failed', e);
    const where = e?.table ? ` at "${e.table}"` : '';
    return NextResponse.json(
      { error: `Deletion stopped${where}. Please contact support.` },
      { status: 500 }
    );
  }

  await admin.from('deleted_accounts_log').insert({ user_id: uid });

  const { error: delErr } = await admin.auth.admin.deleteUser(uid);
  if (delErr) {
    console.error('deleteUser failed', delErr);
    return NextResponse.json({ error: 'Could not remove your login. Please contact support.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}