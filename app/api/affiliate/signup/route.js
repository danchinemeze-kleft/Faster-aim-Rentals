import { createClient } from '@supabase/supabase-js'

function generateRefCode(name) {
  const prefix = (name || 'MRR')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return prefix + suffix
}

export async function POST(request) {
  try {
    const { full_name, phone, bank_name, account_number, account_name, access_token } = await request.json()

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

    // Check if already an affiliate
    const { data: existing } = await serviceSupabase
      .from('affiliates')
      .select('ref_code')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      return Response.json({ success: true, ref_code: existing.ref_code, already_exists: true })
    }

    // Generate unique ref code
    let ref_code = generateRefCode(full_name)
    let attempts = 0
    while (attempts < 10) {
      const { data: clash } = await serviceSupabase
        .from('affiliates').select('id').eq('ref_code', ref_code).maybeSingle()
      if (!clash) break
      ref_code = generateRefCode(full_name)
      attempts++
    }

    const { error: insertErr } = await serviceSupabase.from('affiliates').insert({
      id: user.id,
      ref_code,
      full_name: full_name || null,
      email: user.email,
      phone: phone || null,
      bank_name: bank_name || null,
      account_number: account_number || null,
      account_name: account_name || null,
      status: 'active',
    })

    if (insertErr) {
      console.error('Affiliate insert error:', insertErr)
      return Response.json({ error: 'Failed to create affiliate account' }, { status: 500 })
    }

    return Response.json({ success: true, ref_code })

  } catch (err) {
    console.error('Affiliate signup error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
