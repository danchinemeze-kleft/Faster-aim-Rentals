import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    const body = await req.json()

    // Honeypot: bots fill this hidden field, people never see it
    if (body.company) return NextResponse.json({ ok: true })

    const name = String(body.name || '').trim().slice(0, 100)
    const email = String(body.email || '').trim().slice(0, 200)
    const phone = String(body.phone || '').trim().slice(0, 40)
    const topic = String(body.topic || '').trim().slice(0, 60)
    const message = String(body.message || '').trim().slice(0, 1500)

    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || message.length < 10) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, phone, topic, message })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('contact route error', e)
    return NextResponse.json({ error: 'Could not send' }, { status: 500 })
  }
}