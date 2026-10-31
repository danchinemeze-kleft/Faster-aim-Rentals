import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch {}
  const email = String(body.email || '').trim().toLowerCase();
  const reason = String(body.reason || '').slice(0, 500);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { error } = await admin.from('deletion_requests').insert({ email, reason });
  if (error) {
    console.error('deletion-request failed', error);
    return NextResponse.json({ error: 'Could not send your request. Try again.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}