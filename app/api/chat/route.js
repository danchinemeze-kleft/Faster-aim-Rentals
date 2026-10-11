import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

// ── System prompt (server-side only) ──────────────────────

const SYSTEM_PROMPT = `You are Mr. Rent, the AI property assistant for Mr. Rent (rent.fasteraim.com) by Faster Aim Technology Limited. You help Nigerians find, rent and buy property of every kind quickly and safely, and you answer their real estate questions.

Tone: Warm, sharp, trustworthy Nigerian English. Occasionally use a mild expression like "no wahala" or "sharp sharp" but keep it professional.

Respect: Treat every user like a valued, high-class client who deserves respect. Be courteous, gracious and attentive, the way a top concierge or private property consultant would be. Use polite forms such as "please" and "kindly", and "sir" or "ma" only when the user's gender is clear, otherwise use warm neutral address. Never be casual to the point of disrespect, never mock or argue with a user, and stay calm and gracious even when a user is rude, impatient or testing you. Make people feel important and well looked after, without sounding servile or over-flattering.

Scope: Mr. Rent covers ALL property types in Nigeria, for rent or for sale: flats, self-contains, duplexes, bungalows, land and plots, shops, offices, warehouses, event centers and other commercial spaces. Never tell a user that we only handle residential properties or only rentals. If a user asks for a type we have no listing for right now, say there is no matching listing at the moment, suggest the closest alternatives, and invite them to check back soon.

Answering questions: Answer every real estate question the user asks, whether it is about our listings, searching for a property, renting, buying, land documents, fees, inspections, tenancy, landlords, building, or property in general. Give a clear, useful answer first. Do not deflect a genuine property question or say it is outside your scope. Only politely and graciously redirect questions that have nothing to do with property or housing.

Legal and money questions: For land titles, tenancy disputes, contracts and similar matters, give helpful general information and explain that rules can differ by state and by situation, then recommend confirming with a qualified lawyer, a licensed surveyor or the relevant land registry. For price questions, give typical ranges as guidance only, never as exact or guaranteed figures, and never as investment advice.

Nigerian property knowledge:
- Rental costs: agency fee (commonly 5-10% of annual rent), caution/security deposit, agreement or legal fee. Rent is usually paid annually or bi-annually upfront. Exact amounts vary by area and agent.
- Buying: commonly involves agency commission and legal fees, and the buyer should always verify the title documents, such as the Certificate of Occupancy, Governor's Consent, survey plan and deed of assignment, with a lawyer before paying.
- Typical annual rents for guidance only: self-contain roughly 80k to 400k naira, 1-bed flat 150k to 800k, 2-bed 250k to 2M, 3-bed 400k to 5M and above, duplex 600k to 10M and above. Lagos and Abuja cost more than the Southeast. Do not quote price ranges for land or commercial property unless a listing gives the figure; say prices vary widely by location and size.
- Key areas: Awka (GRA, Unizik axis, Amawbia), Onitsha (GRA, Fegge, Woliwo), Enugu (GRA, Independence Layout, Trans-Ekulu), Abakaliki, Owerri (New Owerri, World Bank), Asaba (GRA), Port Harcourt (GRA, Rumuola), Lagos (Lekki, VI, Ikeja, Yaba), Abuja (Maitama, Wuse, Garki, Gwarinpa).

How to handle searches:
1. Confirm what you understood (location, property type, bedrooms, budget, rent or buy) in one sentence.
2. If the SEARCH RESULT note at the end of these instructions says listings were found, tell the user matching listings appear as cards below. If it says none were found, follow the NO LISTINGS FOUND rules below instead.
3. If the budget seems low for the area, mention realistic ranges.
4. If a search request is vague, ask ONE focused follow-up, starting with location.
Vary how you phrase this so you never sound scripted.

Listing cards: Listings from our platform appear below your reply only when the SEARCH RESULT note says some were found. Never invent property details, prices, addresses or phone numbers. If the cards shown do not match what the user wants, say so honestly.

NO LISTINGS FOUND: When the SEARCH RESULT note says no matching listings were found, never say or imply that cards will appear below. Say honestly and briefly that you couldn't find that kind of property in the city or area, and that such listings may not be active there at the moment. For example: "I couldn't find any hotels in Awka right now, as such listings may not be active in that area at the moment." Then offer one next step: you can check the nearest matching areas or a similar property type, or the user can browse all available properties at https://rent.fasteraim.com/browse . Keep it to 2-3 short sentences, do not over-apologize, do not invent alternatives, and ask at most one follow-up question.

Market information: When a PRICE DATA note appears at the end of these instructions, it comes from real listings on our platform. Use those figures as the price guidance, say they are based on current listings on Mr. Rent, and never present them as guaranteed. For questions about local news, trends, weather, security or what is happening in an area, you may use Google Search to get current information, keep it brief, and say it is recent public information. If you have no PRICE DATA and no search result, say prices vary by area and never invent figures, news or weather.

Contact reveal: Seekers pay a one-time fee of 5,000 naira to unlock a landlord's or owner's phone number directly on the platform, with no street-agent middlemen.

Conversation memory: Remember everything the user has already told you. Never ask again for a location, budget or property type they already gave. Ask only for what is still missing, one question at a time.

Trust: Say that listings are reviewed by our team. Do not promise that every landlord or owner is verified. Always remind the user to inspect a property and confirm documents before paying anything.

Scam warnings (share when relevant): Never pay before inspection. Insist on a written agreement. Be wary of agents charging "form fees". For land, verify ownership documents independently.

Style: Vary your openings and closings. Use at most one light Nigerian expression per reply.

Rules: For searches and simple questions keep replies to 3-5 sentences. For questions that need explanation, such as fees, documents or the buying process, you may use up to about 8 sentences. Always finish your thought completely and never cut off mid-sentence. No markdown headers or bullet lists in chat replies; write in natural flowing sentences. Never make up listings.`

// ── Intent extraction ──────────────────────────────────────

const STATE_KEYWORDS = {
  Lagos: ['lagos', 'lekki', 'victoria island', 'vi', 'ikoyi', 'ikeja', 'surulere', 'yaba', 'ajah', 'festac', 'gbagada', 'magodo'],
  Abuja: ['abuja', 'fct', 'gwarinpa', 'wuse', 'maitama', 'garki', 'asokoro', 'kubwa'],
  Anambra: ['anambra', 'awka', 'onitsha', 'nnewi'],
  Enugu: ['enugu'],
  Rivers: ['rivers', 'port harcourt', 'ph'],
  Delta: ['delta', 'warri', 'asaba'],
  Imo: ['imo', 'owerri'],
  Ogun: ['ogun', 'abeokuta', 'sagamu'],
  Kano: ['kano'],
}

// The keys here must match the property_type values saved in the listings table
// (and by the list-a-property form). Types with no listings yet simply return no cards.
// Order matters: specific types come before general ones.
const TYPE_KEYWORDS = {
  self_contain: ['self contain', 'selfcontain', 'self-contain', 'mini flat'],
  room_and_parlour: ['room and parlour', 'room & parlour', 'single room', 'room and palour'],
  studio: ['studio'],
  penthouse: ['penthouse'],
  boys_quarters: ['boys quarters', "boys' quarters", 'bq'],
  duplex: ['duplex', 'terrace', 'terraced', 'semi detached', 'semi-detached'],
  flat: ['flat', 'apartment'],
  hotel: ['hotel', 'guest house', 'guesthouse', 'lodge', 'motel'],
  hostel: ['hostel', 'student hostel'],
  house: ['house', 'bungalow', 'mansion', 'villa', 'home'],
  event_center: ['event center', 'event centre', 'event hall', 'banquet hall', 'hall'],
  warehouse: ['warehouse', 'store house', 'storehouse'],
  factory: ['factory', 'industrial'],
  office: ['office', 'office space', 'co-working', 'coworking'],
  shop: ['shop', 'store', 'stall', 'plaza', 'mall'],
  school: ['school'],
  farm: ['farm', 'farmland', 'farm land'],
  land: ['land', 'plot'],
}

const NO_BEDROOM_TYPES = ['land', 'farm', 'shop', 'office', 'warehouse', 'factory', 'event_center', 'school', 'hotel', 'hostel']

// Rent, sale or shortlet (saved in the listing_type column)
const MODE_KEYWORDS = {
  shortlet: ['shortlet', 'short let', 'short-let', 'short stay', 'per night', 'nightly', 'airbnb', 'vacation rental', 'holiday rental'],
  sale: ['for sale', 'sale', 'buy', 'purchase', 'to buy'],
  rent: ['rent', 'rental', 'lease', 'to let'],
}
const LISTING_TYPES = ['rent', 'sale', 'shortlet']

// Whole-word match (also allows a plural "s"), so "landlord" no longer counts as "land"
function matchKeyword(lower, kw) {
  const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${esc}s?\\b`).test(lower)
}

function titleCase(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function extractIntent(text) {
  const lower = String(text || '').toLowerCase()

  let state = null
  let place = null
  for (const [s, keywords] of Object.entries(STATE_KEYWORDS)) {
    const hit = keywords.find(kw => matchKeyword(lower, kw))
    if (hit) {
      state = s
      place = hit.toLowerCase() === s.toLowerCase() ? null : titleCase(hit)
      break
    }
  }

  let propertyType = null
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(kw => matchKeyword(lower, kw))) { propertyType = type; break }
  }

  let listingType = null
  for (const [mode, keywords] of Object.entries(MODE_KEYWORDS)) {
    if (keywords.some(kw => matchKeyword(lower, kw))) { listingType = mode; break }
  }

  const mBed = lower.match(/(\d+)\s*(?:bed(?:room)?s?|br\b)/)
  const bedrooms = mBed ? parseInt(mBed[1]) : null

  let maxPrice = null
  const mM = lower.match(/[₦n]?\s*(\d+(?:\.\d+)?)\s*(?:m|million)\b/)
  const mK = lower.match(/[₦n]?\s*(\d+(?:\.\d+)?)\s*k\b/)
  if (mM) maxPrice = Math.round(parseFloat(mM[1]) * 1_000_000)
  else if (mK) maxPrice = Math.round(parseFloat(mK[1]) * 1_000)

  return { state, place, propertyType, listingType, bedrooms, maxPrice }
}

// ── Saved conversation preferences ─────────────────────────

// Prefs come from the browser, so only accept known, well-formed values
function sanitizePrefs(raw) {
  const out = {}
  if (!raw || typeof raw !== 'object') return out
  if (typeof raw.state === 'string' && STATE_KEYWORDS[raw.state]) out.state = raw.state
  if (typeof raw.place === 'string') {
    const p = raw.place.replace(/[^\w\s&'-]/g, '').slice(0, 40).trim()
    if (p) out.place = p
  }
  if (typeof raw.propertyType === 'string' && TYPE_KEYWORDS[raw.propertyType]) out.propertyType = raw.propertyType
  if (typeof raw.listingType === 'string' && LISTING_TYPES.includes(raw.listingType)) out.listingType = raw.listingType
  const b = Number(raw.bedrooms)
  if (Number.isInteger(b) && b >= 1 && b <= 20) out.bedrooms = b
  const p = Number(raw.maxPrice)
  if (Number.isFinite(p) && p > 0 && p <= 10_000_000_000) out.maxPrice = Math.round(p)
  return out
}

// New details from the latest message override old ones; everything else is kept
function mergePrefs(old, intent) {
  const merged = { ...old }
  for (const k of ['state', 'place', 'propertyType', 'listingType', 'bedrooms', 'maxPrice']) {
    if (intent[k] != null) merged[k] = intent[k]
  }
  if (intent.state && !intent.place) delete merged.place
  if (intent.propertyType && NO_BEDROOM_TYPES.includes(intent.propertyType) && intent.bedrooms == null) {
    delete merged.bedrooms
  }
  return merged
}

function describePrefs(p) {
  const parts = []
  if (p.place && p.state) parts.push(`location: ${p.place}, ${p.state} State`)
  else if (p.state) parts.push(`location: ${p.state}`)
  else if (p.place) parts.push(`location: ${p.place}`)
  if (p.propertyType) parts.push(`property type: ${p.propertyType.replace(/_/g, ' ')}`)
  if (p.listingType) parts.push(`looking to: ${p.listingType === 'sale' ? 'buy' : p.listingType === 'shortlet' ? 'book a shortlet' : 'rent'}`)
  if (p.bedrooms) parts.push(`bedrooms: ${p.bedrooms}`)
  if (p.maxPrice) parts.push(`budget: up to ₦${p.maxPrice.toLocaleString('en-NG')}`)
  if (!parts.length) return ''
  return `\n\nKNOWN USER DETAILS from earlier in this conversation: ${parts.join('; ')}. Treat these as already given. Do not ask for them again. If the user changes any of them, follow the new detail.`
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

async function fetchListings(supabase, intent, userPrefs) {
  const { state, propertyType, listingType, bedrooms, maxPrice } = intent
  if (!state && !propertyType && !listingType && !bedrooms && !maxPrice) return []

  let query = supabase
    .from('listings')
    .select('id, title, location, city, state, price, price_period, property_type, listing_type, bedrooms, images')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  if (state) query = query.eq('state', state)
  if (propertyType) query = query.eq('property_type', propertyType)
  if (listingType) query = query.eq('listing_type', listingType)
  if (maxPrice) query = query.lte('price', maxPrice)
  if (bedrooms) query = query.eq('bedrooms', String(bedrooms))

  const { data } = await query
  if (!data?.length) return []

  const ranked = data.map(l => ({
    ...l,
    _score: (userPrefs.preferredStates.includes(l.state) ? 2 : 0) +
            (userPrefs.preferredTypes.includes(l.property_type) ? 1 : 0),
  }))

  return ranked.sort((a, b) => b._score - a._score).slice(0, 3)
}

// ── Market helpers ─────────────────────────────────────────

const MARKET_WORDS = /\b(price|prices|cost|costs|how much|average|cheap|expensive|worth|rate|rates|going for)\b/i
const LIVE_INFO_WORDS = /\b(news|trend|trends|trending|weather|rain|flood|flooding|security|update|updates|latest|current|currently|happening|market|demand|today|this week|this month)\b/i

function median(nums) {
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

const naira = n => '₦' + Number(n).toLocaleString('en-NG')

// Real price figures from approved listings, so the bot never invents prices
async function getPriceStats(supabase, p) {
  if (!p.state) return ''
  try {
    let query = supabase
      .from('listings')
      .select('price, city, location, price_period')
      .eq('status', 'approved')
      .eq('state', p.state)
      .gt('price', 0)
      .limit(200)
    if (p.propertyType) query = query.eq('property_type', p.propertyType)
    if (p.listingType) query = query.eq('listing_type', p.listingType)
    if (p.bedrooms) query = query.eq('bedrooms', String(p.bedrooms))

    const { data } = await query
    let rows = data || []

    // Narrow to the specific town/area when we know it and enough listings exist
    if (p.place) {
      const key = p.place.toLowerCase()
      const local = rows.filter(r =>
        (r.city || '').toLowerCase().includes(key) || (r.location || '').toLowerCase().includes(key))
      if (local.length >= 3) rows = local
    }

    // Too few listings makes the figures misleading
    if (rows.length < 3) return ''

    const prices = rows.map(r => Number(r.price)).filter(n => n > 0)
    const area = p.place ? `${p.place}, ${p.state}` : p.state
    const what = [p.bedrooms ? `${p.bedrooms}-bedroom` : '', p.propertyType ? p.propertyType.replace(/_/g, ' ') : 'property']
      .filter(Boolean).join(' ')

    return `\n\nPRICE DATA from ${prices.length} current listings on Mr. Rent for ${what} in ${area}: lowest ${naira(Math.min(...prices))}, typical (median) ${naira(median(prices))}, highest ${naira(Math.max(...prices))}. Share this as guidance based on our current listings, not as a guarantee.`
  } catch (err) {
    console.error('Price stats error:', err?.message)
    return ''
  }
}

// ── Trending listings (proactive mode) ────────────────────

async function fetchTrending(supabase) {
  const { data } = await supabase
    .from('listings')
    .select('id, title, location, city, state, price, price_period, property_type, listing_type, bedrooms, images')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3)
  return data || []
}


// ── Route handler ──────────────────────────────────────────

export const maxDuration = 30 // seconds — overrides Vercel's default 10s limit

export async function POST(request) {
  try {
    const { messages, userId, proactive, prefs } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    if (proactive) {
      const listings = await fetchTrending(supabase)
      return Response.json({ listings })
    }

    const lastMessage = messages[messages.length - 1].content
    const encoder = new TextEncoder()

    // What the user just said, merged with what they told us earlier
    const intentNow = extractIntent(lastMessage)
    const mergedPrefs = mergePrefs(sanitizePrefs(prefs), intentNow)

    // Run the search BEFORE calling Gemini, so the bot knows if cards will show.
    // Only search when the latest message carries a search detail, so a general
    // question like "what is caution fee?" doesn't pop up unrelated cards.
    const hasNewIntent = ['state', 'propertyType', 'listingType', 'bedrooms', 'maxPrice'].some(k => intentNow[k] != null)
    let listings = null // null = no search was run
    if (hasNewIntent) {
      try {
        const userPrefs = await getUserPreferences(supabase, userId)
        listings = await fetchListings(supabase, mergedPrefs, userPrefs)
      } catch (err) {
        console.error('Listings error:', err?.message)
      }
    }

    let searchNote
    if (listings && listings.length) {
      searchNote = `\n\nSEARCH RESULT: ${listings.length} matching listing(s) were found and will appear as cards below your reply.`
    } else if (listings) {
      searchNote = `\n\nSEARCH RESULT: NO matching listings were found for this request. Do not mention cards appearing below. Follow the NO LISTINGS FOUND rules.`
    } else {
      searchNote = `\n\nSEARCH RESULT: No search was run for this message. Do not mention cards.`
    }

    // Real price figures (only when the user is asking about price or cost)
const wantsPrice = MARKET_WORDS.test(lastMessage)
const priceNote = wantsPrice ? await getPriceStats(supabase, mergedPrefs) : ''

// Turn on Google Search only for news, trends, weather or market questions
const useSearch = LIVE_INFO_WORDS.test(lastMessage) || (wantsPrice && !priceNote)

const systemInstruction = SYSTEM_PROMPT + describePrefs(mergedPrefs) + searchNote + priceNote

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

        try {
          const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

          const history = messages
            .slice(0, -1)
            .filter((m, i) => !(i === 0 && m.role === 'assistant'))
            .filter(m => typeof m.content === 'string' && m.content.trim())
            .slice(-9)
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }))
          while (history.length && history[0].role === 'model') history.shift()

          // Spread attempts across models, with growing waits, for Google 503s
          const attempts = [
            'gemini-3.8-flash',
            'gemini-3.7-flash',
            'gemini-2.5-flash',
            'gemini-3.1-flash-lite',
            'gemini-2.5-flash-lite',
          ]
          let gotText = false

          for (let i = 0; i < attempts.length; i++) {
            const model = attempts[i]
            try {
              const result = await genAI.models.generateContentStream({
                model,
                contents: [
                  ...history,
                  { role: 'user', parts: [{ text: lastMessage }] },
                ],
                config: { systemInstruction, maxOutputTokens: 2048, ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}) },
              })
              for await (const chunk of result) {
                if (chunk.text) {
                  gotText = true
                  send({ t: 'chunk', v: chunk.text })
                }
              }
              if (gotText) break
              console.error('Gemini returned no text:', model)
            } catch (err) {
              console.error('Gemini error:', model, err?.status, err?.message)
              if (gotText) break // never retry after text has started streaming
            }
            if (i < attempts.length - 1) {
              await new Promise(r => setTimeout(r, 800 * (i + 1)))
            }
          }

          if (!gotText) send({ t: 'error' })
        } catch (err) {
          console.error('Gemini setup error:', err?.message)
          send({ t: 'error' })
        }

        // Cards were already searched before the AI replied; just send them
        if (listings) send({ t: 'listings', v: listings })

        // Send the updated details back so the page can save them
        send({ t: 'prefs', v: mergedPrefs })

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Failed to get response' }, { status: 500 })
  }
}