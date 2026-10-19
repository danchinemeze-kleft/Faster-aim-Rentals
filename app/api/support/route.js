import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TO_EMAIL = 'info@fasteraim.com'

export async function POST(request) {
  try {
    const body = await request.json()

    // Honeypot: bots fill this hidden field. Pretend it worked and drop it.
    if (body.website) return Response.json({ success: true })

    const name = String(body.name || '').trim().slice(0, 100)
    const email = String(body.email || '').trim().slice(0, 150)
    const phone = String(body.phone || '').trim().slice(0, 20)
    const topic = String(body.topic || 'Other').trim().slice(0, 100)
    const message = String(body.message || '').trim().slice(0, 3000)

    if (!name) return Response.json({ error: 'Please enter your name.' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    if (message.length < 10) return Response.json({ error: 'Please describe your issue in a little more detail.' }, { status: 400 })

    // Save to Supabase (service role, so no public insert policy is needed)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase
      .from('support_messages')
      .insert([{ name, email, phone: phone || null, topic, message }])

    if (error) {
      console.error('Support insert error:', error)
      return Response.json({ error: 'Could not save your message.' }, { status: 500 })
    }

    // Optional: also email the team if Resend is configured. Never fails the request.
    if (process.env.RESEND_API_KEY && process.env.SUPPORT_FROM_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.SUPPORT_FROM_EMAIL,
            to: [TO_EMAIL],
            reply_to: email,
            subject: `[Mr. Rent Support] ${topic}`,
            text: `From: ${name} <${email}>\nPhone: ${phone || 'not given'}\nTopic: ${topic}\n\n${message}`,
          }),
        })
      } catch (mailErr) {
        console.error('Support email failed:', mailErr)
      }
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Support API error:', err)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}