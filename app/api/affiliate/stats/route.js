import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization') || ''
    const access_token = authHeader.replace('Bearer ', '').trim()
    if (!access_token) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${access_token}` } } }
    )

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return Response.json({ error: 'Invalid session' }, { status: 401 })

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: affiliate } = await serviceSupabase
      .from('affiliates')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!affiliate) return Response.json({ affiliate: null })

    const { data: commissions } = await serviceSupabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })

    const list = commissions || []
    const total_earned = list.reduce((s, c) => s + c.commission_amount, 0)
    const pending = list.filter(c => c.status === 'pending').reduce((s, c) => s + c.commission_amount, 0)
    const paid_out = list.filter(c => c.status === 'paid').reduce((s, c) => s + c.commission_amount, 0)

    // 1. Calculate total invites (signups) from the referrals table
    let total_invites = 0
    let referredUserIds = []
    try {
      const { data: refs, error: refErr } = await serviceSupabase
        .from('referrals')
        .select('referred_user_id')
        .eq('affiliate_id', affiliate.id)
      
      if (!refErr && refs) {
        total_invites = refs.length
        referredUserIds = refs.map(r => r.referred_user_id).filter(Boolean)
      }
    } catch (e) {
      console.error('Error fetching invites:', e)
    }

    // 2. Calculate total successful (referred users who went on to make a payment)
    let total_successful = 0
    if (referredUserIds.length > 0) {
      const paidUserIds = new Set()

      // Check from already fetched commissions list
      list.forEach(c => {
        const payer = c.payer_id || c.user_id || c.buyer_id || c.referred_user_id
        if (payer) {
          paidUserIds.add(payer)
        }
      })

      // Query Subscription table for any of these user_ids
      try {
        const { data: subs } = await serviceSupabase
          .from('Subscription')
          .select('user_id')
          .in('user_id', referredUserIds)
        if (subs) {
          subs.forEach(s => {
            if (s.user_id) paidUserIds.add(s.user_id)
          })
        }
      } catch (e) {
        console.error('Error querying Subscription:', e)
      }

      // Query Tenant_subscription table for any of these user_ids
      try {
        const { data: tenantSubs } = await serviceSupabase
          .from('Tenant_subscription')
          .select('user_id')
          .in('user_id', referredUserIds)
        if (tenantSubs) {
          tenantSubs.forEach(ts => {
            if (ts.user_id) paidUserIds.add(ts.user_id)
          })
        }
      } catch (e) {
        console.error('Error querying Tenant_subscription:', e)
      }

      total_successful = referredUserIds.filter(id => paidUserIds.has(id)).length
    }

    return Response.json({
      affiliate,
      commissions: list,
      stats: { 
        total_earned, 
        pending, 
        paid_out, 
        count: list.length,
        total_invites,
        total_successful
      },
    })

  } catch (err) {
    console.error('Affiliate stats error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
