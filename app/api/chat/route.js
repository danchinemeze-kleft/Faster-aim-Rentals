import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

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

async function callDeepSeek(messages, systemPrompt) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
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
    const { messages, systemPrompt, userId, proactive } = await request.json()

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
        config: { systemInstruction: systemPrompt },
      })

      reply = result.text
    } catch {
      reply = await callDeepSeek(messages, systemPrompt)
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