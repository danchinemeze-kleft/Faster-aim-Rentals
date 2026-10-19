import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const PHONE_OK = /^\+?[0-9]{10,14}$/;

export async function POST(request) {
  const body = await request.json();
  const { type, listing_id, ref_code } = body;

  if (!type) {
    return Response.json({ error: 'Missing type' }, { status: 400 });
  }

  // 1. Who is really calling? Read the logged-in user from the session cookie,
  //    never from the request body.
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json(
      { error: 'Please log in to continue.', code: 'not_logged_in' },
      { status: 401 }
    );
  }

  // 2. Is the profile complete (name + valid phone)?
  const { data: profile } = await supabase
    .from('Profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .maybeSingle();

  const phone = (profile?.phone || '').replace(/\s+/g, '');
  if (!profile?.full_name?.trim() || !PHONE_OK.test(phone)) {
    return Response.json(
      {
        error: 'Please complete your profile (name and phone number) before making a payment.',
        code: 'profile_incomplete',
      },
      { status: 403 }
    );
  }

  // 3. Trusted values from here on
  const email = user.email;
  const user_id = user.id;

  let amount, payment_type, callback_url;

  if (type === 'reveal') {
    amount = 500000;
    payment_type = 'reveal_single';
    callback_url = `https://rent.fasteraim.com/reveal-success?listing_id=${listing_id}&user_id=${encodeURIComponent(user_id)}`;
  } else if (type === 'landlord') {
    amount = 1000000;
    payment_type = 'landlord_listing';
    callback_url = `https://rent.fasteraim.com/pay-success?user_id=${encodeURIComponent(user_id)}`;
  } else if (type === 'tenant_subscription') {
    amount = 2500000;
    payment_type = 'tenant_subscription';
    callback_url = `https://rent.fasteraim.com/tenant-sub-success?user_id=${encodeURIComponent(user_id)}`;
  } else if (type === 'sale_activation') {
    amount = 1500000; // ₦15,000 activation fee — charged only after admin approval
    payment_type = 'sale_activation';
    callback_url = `https://rent.fasteraim.com/sale-success?listing_id=${listing_id}&user_id=${encodeURIComponent(user_id)}`;
  } else {
    return Response.json({ error: 'Invalid payment type' }, { status: 400 });
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount,
      callback_url,
      metadata: {
        payment_type,
        listing_id,
        tenant_id: user_id,
        ref_code: ref_code || null,
      },
    }),
  });

  const data = await response.json();

  if (!data.status) {
    return Response.json({ error: data.message || 'Paystack error' }, { status: 500 });
  }

  return Response.json({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
  });
}