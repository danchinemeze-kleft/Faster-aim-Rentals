export async function POST(request) {
  const body = await request.json();
  const { email, type, listing_id, user_id, ref_code } = body;

  if (!email || !type) {
    return Response.json({ error: 'Missing email or type' }, { status: 400 });
  }

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