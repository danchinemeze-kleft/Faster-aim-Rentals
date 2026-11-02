import { createClient } from '@supabase/supabase-js'

function userClient(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  if (!token) return null
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function GET(request) {
  try {
    const sb = userClient(request)
    if (!sb) return Response.json({ error: 'Not authenticated' }, { status: 401 })
    const { data: { user }, error } = await sb.auth.getUser()
    if (error || !user) return Response.json({ error: 'Invalid session' }, { status: 401 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: affiliate } = await admin
      .from('affiliates')
      .select('id, full_name, bank_name, account_number, account_name, status')
      .eq('id', user.id)
      .maybeSingle()
    if (!affiliate) return Response.json({ affiliate: null })

    const { data: comms } = await admin
      .from('affiliate_commissions')
      .select('id, transaction_type, commission_amount, status, payout_id, created_at')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })

    const { data: payouts } = await admin
      .from('payout_requests')
      .select('id, amount, status, admin_note, created_at, processed_at')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })

    const list = comms || []
    const sum = (arr) => arr.reduce((s, c) => s + Number(c.commission_amount), 0)

    return Response.json({
      affiliate,
      min_payout: 5000,
      available: sum(list.filter((c) => c.status === 'pending' && !c.payout_id)),
      processing: sum(list.filter((c) => c.status === 'pending' && c.payout_id)),
      paid: sum(list.filter((c) => c.status === 'paid')),
      earnings: list,
      payouts: payouts || [],
    })
  } catch (err) {
    console.error('Wallet GET error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sb = userClient(request)
    if (!sb) return Response.json({ error: 'Not authenticated' }, { status: 401 })
    const { data, error } = await sb.rpc('request_payout')
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true, payout_id: data })
  } catch (err) {
    console.error('Wallet POST error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}