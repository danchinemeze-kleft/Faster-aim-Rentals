import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function generateRefCode() {
  return 'MRENT' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8)
}

export async function POST(request) {
  try {
    const { full_name, phone, bank_name, account_number, account_name, access_token } = await request.json()

    if (!full_name || !phone || !bank_name || !account_number || !account_name || !access_token) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token)
    if (userError || !user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is already an affiliate
    const { data: existing } = await supabase
      .from('affiliates')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      return Response.json({ success: false, error: 'Already registered as affiliate' }, { status: 400 })
    }

    // Generate unique ref code
    let ref_code
    let codeExists = true
    while (codeExists) {
      ref_code = generateRefCode()
      const { data } = await supabase
        .from('affiliates')
        .select('id', { count: 'exact', head: true })
        .eq('ref_code', ref_code)
      codeExists = data && data.length > 0
    }

    // Insert affiliate
    const { error: insertError } = await supabase
      .from('affiliates')
      .insert({
        id: user.id,
        ref_code,
        full_name: full_name.trim(),
        phone: phone.trim(),
        bank_name: bank_name.trim(),
        account_number: account_number.trim(),
        account_name: account_name.trim(),
        status: 'active',
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return Response.json({ success: false, error: 'Failed to create affiliate account' }, { status: 500 })
    }

    return Response.json({
      success: true,
      ref_code,
      message: `Welcome to Mr. Rent Affiliate Program! Your ref code: ${ref_code}`,
    })

  } catch (error) {
    console.error('Affiliate signup error:', error)
    return Response.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
