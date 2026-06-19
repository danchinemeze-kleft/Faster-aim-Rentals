import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

// ── System prompt (server-side only) ──────────────────────

const SYSTEM_PROMPT = `You are Mr. Rent, the AI property assistant for Mr. Rent (rent.fasteraim.com) by Faster Aim Technology Limited. You help Nigerians find verified rental properties quickly and safely.

Tone: Warm, sharp, trustworthy Nigerian English. Occasionally use mild expressions like "no wahala" or "sharp sharp" but keep it professional and concise.

Nigerian rental knowledge:
- Fees: agency fee (5–10% of annual rent), caution/security deposit (1–3 months), agreement fee (₦10k–₦50k). Rents are mostly paid annually or bi-annually upfront.
- Typical annual rents: self-contain ₦80k–₦400k, 1-bed flat ₦150k–₦800k, 2-bed ₦250k–₦2M, 3-bed ₦400k–₦5M+, duplex ₦600k–₦10M+. Lagos and Abuja cost more than Southeast Nigeria.
- Key areas: Awka (GRA, Unizik axis, Amawbia), Onitsha (GRA, Fegge, Woliwo), Enugu (GRA, Independence Layout, Trans-Ekulu), Owerri (New Owerri, World Bank), Asaba (GRA), Port Harcourt (GRA, Rumuola), Lagos (Lekki, VI, Ikeja, Yaba), Abuja (Maitama, Wuse, Garki, Gwarinpa).

How to handle searches:
1. Confirm what you understood (location, type, bedrooms, budget) in one sentence.
2. Tell the user matching listings will appear as cards below.
3. If budget seems low for the area, mention realistic price ranges.
4. If the message is vague, ask ONE focused follow-up — ask for location first.

Example: "Got it! You're looking for a 2-bed flat in Awka around ₦300k/year — check the cards below. Tap Reveal Contact for just ₦5,000 to get the landlord's number directly."

Listing cards: Real verified listings appear automatically below your reply. Never invent property details, prices, addresses, or phone numbers.

Contact reveal: Tenants pay ₦5,000 to unlock a verified landlord phone number — safer than street agents, no middlemen.

Scam warnings (share when relevant): Never pay before inspection. Insist on a written agreement. Be wary of agents charging "form fees". On Mr. Rent, landlords are verified.

Rules: Keep replies to 3–5 sentences. No markdown headers or bullet lists in chat replies — write in natural flowing sentences. Never make up listings. If asked something unrelated to property, politely redirect.`

// ── Intent extraction ──────────────────────────────────────

const STATE_KEYWORDS = {
  Lagos: ['lagos', 'lekki', 'victoria island', ' vi ', 'ikoyi', 'ikeja', 'surulere', 'yaba', 'ajah', 'festac', 'gbagada', 'magodo'],
  Abuja: ['abuja', 'fct', 'gwarinpa', 'wuse', 'maitama', 'garki', 'asokoro', 'kubwa'],
  Anambra: ['anambra', 'awka', 'onitsha', 'nnewi'],
  Enugu: ['enugu'],
  Rivers: ['rivers', 'port harcourt', ' ph '],
  Delta: ['delta', 'warri', 'asaba'],
  Imo: ['imo', 'owerri'],
  Ogun: ['ogun', 'abeokuta', 'sagamu'],
  Kano: ['kano'],
}

const TYPE_KEYWORDS = {
  flat: ['flat', 'apartment'],
  self_contain: ['self contain', 'selfcontain', 'self-contain'],
  duplex: ['duplex'],
  bungalow: ['bungalow'],
  mansion: ['mansion'],
  room_and_parlour: ['room and parlour', 'room & parlour', 'single room'],
  shop: ['shop', 'office'],
  land: ['land', 'plot'],
}

function extractIntent(text) {
  const lower = text.toLowerCase()

  let state = null
  for (const [s, keywords] of Object.entries(STATE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) { state = s; break }
  }

  let propertyType = null
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) { propertyType = type; break }
  }

  const mBed = lower.match(/(\d+)\s*(?:bed(?:room)?s?|br\b)/)
  const bedrooms = mBed ? parseInt(mBed[1]) : null

  let maxPrice = null
  const mM = lower.match(/(?:under\s+)?[₦n]?\s*(\d+(?:\.\d+)?)\s*m\b/)
  const mK = lower.match(/(?:under\s+)?[₦n]?\s*(\d+(?:\.\d+)?)\s*k\b/)
  if (mM) maxPrice = Math.round(parseFloat(mM[1]) * 1_000_000)
  else if (mK) maxPrice = Math.round(parseFloat(mK[1]) * 1_000)

  return { state, propertyType, bedrooms, maxPrice }
}

// ── User preferences from activity history ─────────────────

async function getUserPreferences(supabase, userId) {
  if (!userId) return { preferredStates: [], preferredTypes: [] }

  const { data: activity } = await supabase
    .from('user_activity')
    .select('listing_id')
    .eq('user_id', userId)
    .limit(40)

  if (!activity?.length) return { preferredStates: [], preferredTypes: [] }

  const ids = [...new Set(activity.map(a => a.listing_id))]
  const { data: visited } = await supabase
    .from('listings')
    .select('state, property_type')
    .in('id', ids)

  const stateCount = {}, typeCount = {}
  for (const l of visited || []) {
    if (l.state) stateCount[l.state] = (stateCount[l.state] || 0) + 1
    if (l.property_type) typeCount[l.property_type] = (typeCount[l.property_type] || 0) + 1
  }

  return {
    preferredStates: Object.entries(stateCount).sort((a, b) => b[1] - a[1]).map(([s]) => s).slice(0, 3),
    preferredTypes: Object.entries(typeCount).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 2),
  }
}

// ── Fetch and rank listings ────────────────────────────────

async function fetchListings(supabase, intent, prefs) {
  const { state, propertyType, bedrooms, maxPrice } = intent
  if (!state && !propertyType && !bedrooms && !maxPrice) return []

  let query = supabase
    .from('listings')
    .select('id, title, location, city, state, price, price_period, property_type, bedrooms, images')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  if (state) query = query.eq('state', state)
  if (propertyType) query = query.eq('property_type', propertyType)
  if (maxPrice) query = query.lte('price', maxPrice)
  if (bedrooms) query = query.eq('bedrooms', String(bedrooms))

  const { data } = await query
  if (!data?.length) return []

  const ranked = data.map(l => ({
    ...l,
    _score: (prefs.preferredStates.includes(l.state) ? 2 : 0) +
            (prefs.preferredTypes.includes(l.property_type) ? 1 : 0),
  }))

  return ranked.sort((a, b) => b._score - a._score).slice(0, 3)
}

// ── Trending listings (proactive mode) ────────────────────

async function fetchTrending(supabase) {
  const { data } = await supabase
    .from('listings')
    .select('id, title, location, city, state, price, price_period, property_type, bedrooms, images')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3)
  return data || []
}

// ── DeepSeek fallback ──────────────────────────────────────

async function callDeepSeek(messages, SYSTEM_PROMPT) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      ],
      max_tokens: 500,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || "Sorry, I'm having trouble right now. Please try again."
}

// ── Route handler ──────────────────────────────────────────

export async function POST(request) {
  try {
    const { messages, userId, proactive } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    if (proactive) {
      const listings = await fetchTrending(supabase)
      return Response.json({ listings })
    }

    let reply
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

      const history = messages
        .slice(0, -1)
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))

      const result = await genAI.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: messages[messages.length - 1].content }] },
        ],
        config: { systemInstruction: SYSTEM_PROMPT, maxOutputTokens: 300 },
      })

      reply = result.text
    } catch {
      reply = await callDeepSeek(messages, SYSTEM_PROMPT)
    }

    const intent = extractIntent(messages[messages.length - 1].content)
    const prefs = await getUserPreferences(supabase, userId)
    const listings = await fetchListings(supabase, intent, prefs)

    return Response.json({ reply, listings })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Failed to get response' }, { status: 500 })
  }
}