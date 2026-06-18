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

    return Response.json({
      affiliate,
      commissions: list,
      stats: { total_earned, pending, paid_out, count: list.length },
    })

  } catch (err) {
    console.error('Affiliate stats error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
