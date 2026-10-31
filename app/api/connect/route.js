import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

export async function POST(request) {
  let b = {};
  try { b = await request.json(); } catch {}

  if (b.website) return NextResponse.json({ ok: true }); // bot trap

  const type = b.type === 'partnership' ? 'partnership' : b.type === 'support' ? 'support' : null;
  const name = clean(b.name, 100);
  const email = clean(b.email, 200).toLowerCase();
  const phone = clean(b.phone, 30);
  const business = clean(b.business_name, 150);
  const message = clean(b.message, 2000);
  const source = clean(b.source, 30) || 'direct';

  if (!type) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!message) return NextResponse.json({ error: 'Please write your message.' }, { status: 400 });
  if (!email && !phone) {
    return NextResponse.json({ error: 'Add an email or phone number so we can reply.' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (type === 'partnership' && !business) {
    return NextResponse.json({ error: 'Please enter your business name.' }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { error } = await admin.from('connect_requests').insert({
    type, name, email: email || null, phone: phone || null,
    business_name: business || null, message, source,
  });

  if (error) {
    console.error('connect insert failed', error);
    return NextResponse.json({ error: 'Could not send. Please try again.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}