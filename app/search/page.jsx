'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from '../components/Breadcrumb'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const SYSTEM_PROMPT = `You are Mr. Rent — the AI rental assistant for Mr. Rent (rent.fasteraim.com), Nigeria's smartest property rental platform. You help Nigerians find verified rental properties quickly and safely.

## Your Identity
- Name: Mr. Rent
- Platform: Mr. Rent by Faster Aim Technology Limited
- Tone: Warm, sharp, trustworthy — like a knowledgeable friend who knows the Nigerian property market inside out
- Language: Clear, professional Nigerian English. You may use mild familiar phrases like "no wahala", "we go sort it" or "sharp sharp" sparingly to sound relatable — but never overdo it. Always be easy to understand.

## What You Know About Nigerian Rentals

### Fees tenants should expect
- **Agency fee**: Usually 5–10% of annual rent, paid to the agent
- **Caution/security deposit**: Usually 1–3 months rent, refundable at end of tenancy
- **Agreement fee**: ₦10,000–₦50,000 for the tenancy agreement document
- **Legal fee**: Sometimes charged separately for agreement drafting
- Rents in Nigeria are mostly paid **annually or bi-annually upfront** — monthly payment is rare and usually costs more

### Typical price ranges (annual rent)
- Self-contain (single room + parlour): ₦80,000–₦400,000 depending on state
- 1-bedroom flat: ₦150,000–₦800,000
- 2-bedroom flat: ₦250,000–₦2,000,000
- 3-bedroom flat: ₦400,000–₦5,000,000+
- Duplex: ₦600,000–₦10,000,000+
- Lagos and Abuja are significantly more expensive than Southeast Nigeria
- Southeast Nigeria (Anambra, Enugu, Imo, Abia) offers good value — this is our primary coverage area

### Key cities and neighborhoods we cover
- **Anambra**: Awka (GRA, Unizik axis, Amawbia), Onitsha (GRA, Fegge, Woliwo, Bridge Head), Nnewi
- **Enugu**: GRA, Independence Layout, Trans-Ekulu, Achara Layout, Emene
- **Imo**: Owerri (New Owerri, World Bank, Ikenegbu, Orji)
- **Abia**: Umuahia, Aba (Ariaria axis)
- **Delta**: Asaba (GRA, Okpanam Road), Warri
- **Rivers**: Port Harcourt (GRA, Rumuola, Rumuokoro, Trans-Amadi)
- **Lagos**: Lekki, Victoria Island, Ikeja, Surulere, Yaba, Ajah, Gbagada
- **Abuja**: Maitama, Wuse, Garki, Gwarinpa, Asokoro, Kubwa

## How to Handle Searches

When a user describes what they want, do the following:
1. **Confirm** what you understood — mention the location, property type, number of bedrooms, and budget if provided
2. **Let them know** matching listings will appear below your reply as cards they can tap
3. **If their budget seems low** for their requested area, gently mention typical price ranges and suggest adjusting
4. **If their message is vague** (e.g. "I need a house"), ask one focused follow-up question to narrow it down — ask for location first, then type, then budget. Don't ask multiple questions at once.

Example of a good search confirmation:
"Got it! You're looking for a 2-bedroom flat in Awka around ₦300k/year. That's very doable in areas like Amawbia or the Unizik axis. Let me pull up the best matches for you — check the cards below 👇"

## Listing Cards
Real verified listings from our database will appear automatically as cards below your response when there's a match. **You must never invent or describe specific properties** — prices, addresses, bedroom counts, landlord names, or phone numbers. The cards handle all of that.

After confirming the search, simply say something like: "Tap any card below to see full details, or click **Reveal Contact** to get the landlord's number directly — just ₦5,000."

## The Contact Reveal System
- Tenants pay **₦5,000** to unlock a landlord's verified phone number directly on the platform
- This is safer than street agents — no fake listings, no middlemen running away with money
- If a user asks how to contact a landlord, explain this naturally and positively

## Nigerian Rental Scam Warnings (share when relevant)
- Never pay rent or caution fee before physically inspecting a property
- Be wary of agents asking for "form fees" or "inspection fees" upfront
- Insist on a written tenancy agreement before any payment
- Verify the landlord actually owns the property
- On Mr. Rent, landlords are verified — tenants deal directly after paying the small ₦5k reveal fee

## What You Can Help With Beyond Search
- Explain any Nigerian rental term or process
- Advise on what's fair to negotiate (e.g. reducing caution deposit)
- Help a user understand what to check during a property inspection
- Clarify tenant rights under Nigerian law (e.g. landlord must give notice before eviction)
- Help landlords understand how the platform works

## Strict Rules
- **Never invent listings, phone numbers, addresses, landlord names, or prices**
- **Never quote a specific listing price** unless it comes from a card shown to the user
- If someone asks something completely unrelated to property or Nigerian living, politely redirect: "I'm best at helping with rentals — let me know what kind of property you're looking for!"
- Keep all responses **concise** — 3 to 6 sentences max unless the user asks for detailed advice
- Do not use markdown headers or bullet lists in your chat replies — write in natural flowing sentences`

function Avatar({ size = 40 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      border: '2px solid #ff2d78',
      outline: '1.5px solid #0ef6cc',
      outlineOffset: '1px',
    }}>
      <Image
        src="/mr-rent-avatar.png"
        alt="Mr. Rent"
        width={size}
        height={size}
        style={{ objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

function ListingCard({ listing: l, revealLoading, onReveal }) {
  return (
    <div className="faim-listing-card">
      <div className="faim-lcard-img">
        {l.images?.[0]
          ? <Image src={l.images[0]} alt={l.title} fill style={{ objectFit: 'cover' }} />
          : <span style={{ fontSize: '1.8rem' }}>🏠</span>
        }
      </div>
      <div className="faim-lcard-body">
        <div className="faim-lcard-price">
          ₦{Number(l.price).toLocaleString('en-NG')}
          <span>/{l.price_period || 'yr'}</span>
        </div>
        <div className="faim-lcard-title">{l.title}</div>
        <div className="faim-lcard-loc">📍 {l.location}, {l.state}</div>
        {(l.bedrooms || l.property_type) && (
          <div className="faim-lcard-meta">
            {l.bedrooms ? `${l.bedrooms} bed` : ''}{l.bedrooms && l.property_type ? ' · ' : ''}{l.property_type || ''}
          </div>
        )}
        <button
          className="faim-lcard-reveal-btn"
          disabled={revealLoading === l.id}
          onClick={() => onReveal(l)}
        >
          {revealLoading === l.id ? 'Please wait...' : 'Reveal Contact • ₦5k'}
        </button>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Mr. Rent, your personal property assistant. 🏠\n\nI can help you find the perfect rental in Nigeria. Tell me — what kind of property are you looking for, and in which city or area?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [revealLoading, setRevealLoading] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Proactive: show trending listings on first load
  useEffect(() => {
    let cancelled = false
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proactive: true }),
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.listings?.length) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Here are some recently listed properties — take a look:',
            listings: data.listings,
          }])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: SYSTEM_PROMPT,
          userId: user?.id,
        })
      })

      const data = await response.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, listings: data.listings || [] }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble right now. Please try again in a moment." }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleReveal = async (listing) => {
    if (!user) {
      window.location.href = '/account#signup'
      return
    }
    setRevealLoading(listing.id)
    try {
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'reveal',
          listing_id: listing.id,
          user_id: user.id,
        }),
      })
      const data = await res.json()
      if (data.authorization_url) window.location.href = data.authorization_url
    } catch {
      // payment init failed silently; user can retry
    }
    setRevealLoading(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>{line}{i < text.split('\n').length - 1 && <br />}</span>
    ))
  }

  const quickPrompts = [
    "2 bedroom flat in Lekki under ₦500k/year",
    "Self-contain in Awka or Onitsha",
    "3 bedroom duplex in Abuja",
    "What is caution fee?",
  ]

  return (
    <div className="faim-search-page">
      {/* Header */}
      <div className="faim-search-header">
        <a href="/browse" className="faim-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </a>
        <div className="faim-header-info">
          <Avatar size={40} />
          <div>
            <p className="faim-header-name">Mr. Rent</p>
            <p className="faim-header-status">Property Assistant • Online</p>
          </div>
        </div>
        <a href="/browse" className="faim-browse-btn">Browse Listings</a>
      </div>

      {/* Messages */}
      <div className="faim-messages">
        <div style={{ padding: '4px 0 8px' }}>
          <Breadcrumb theme="dark" items={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/browse' }, { label: 'Mr. Rent AI', href: '/search' }]} />
        </div>
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`faim-message-row faim-message-row--${msg.role}`}>
              {msg.role === 'assistant' && <Avatar size={32} />}
              <div className={`faim-bubble faim-bubble--${msg.role}`}>
                {formatMessage(msg.content)}
              </div>
            </div>
            {msg.listings?.length > 0 && (
              <div className="faim-listing-cards">
                {msg.listings.map(l => (
                  <ListingCard key={l.id} listing={l} revealLoading={revealLoading} onReveal={handleReveal} />
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="faim-message-row faim-message-row--assistant">
            <Avatar size={32} />
            <div className="faim-bubble faim-bubble--assistant faim-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only show at start */}
      {messages.length === 1 && (
        <div className="faim-quick-prompts">
          {quickPrompts.map((prompt, i) => (
            <button key={i} className="faim-quick-btn"
              onClick={() => { setInput(prompt); inputRef.current?.focus() }}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="faim-input-bar">
        <textarea
          ref={inputRef}
          className="faim-input"
          placeholder="Describe the property you're looking for..."
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="faim-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .faim-search-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f0ede8;
          font-family: 'Segoe UI', system-ui, sans-serif;
          max-width: 720px;
          margin: 0 auto;
        }

        /* ── Header ── */
        .faim-search-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #080a0f;
          color: white;
          position: sticky;
          top: 0;
          z-index: 10;
          border-bottom: 2px solid #ff2d78;
          outline: 1.5px solid #0ef6cc;
          outline-offset: -4px;
        }

        .faim-back-btn {
          color: white;
          display: flex;
          align-items: center;
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.15s;
        }
        .faim-back-btn:hover { opacity: 1; }

        .faim-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .faim-header-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #0ef6cc;
        }

        .faim-header-status {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .faim-browse-btn {
          background: #ff2d78;
          color: white;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .faim-browse-btn:hover { background: #e0205f; }

        /* ── Messages ── */
        .faim-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faim-message-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .faim-message-row--user {
          flex-direction: row-reverse;
        }

        .faim-bubble {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .faim-bubble--assistant {
          background: #ffffff;
          color: #1a1a2e;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }

        .faim-bubble--user {
          background: #080a0f;
          color: #0ef6cc;
          border-bottom-right-radius: 4px;
          border: 1.5px solid #ff2d78;
        }

        .faim-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 14px 18px;
        }

        .faim-typing span {
          width: 7px;
          height: 7px;
          background: #aaa;
          border-radius: 50%;
          animation: faim-bounce 1.2s infinite;
        }

        .faim-typing span:nth-child(2) { animation-delay: 0.2s; }
        .faim-typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes faim-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        /* ── Quick Prompts ── */
        .faim-quick-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 16px 12px;
        }

        .faim-quick-btn {
          background: white;
          border: 1.5px solid #e0ddd8;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 0.8rem;
          color: #444;
          cursor: pointer;
          transition: all 0.15s;
        }
        .faim-quick-btn:hover {
          border-color: #ff2d78;
          color: #ff2d78;
          background: #fff8fa;
        }

        /* ── Input bar — double border brand detail ── */
        .faim-input-bar {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 10px 14px;
          background: #080a0f;
          border-top: 2.5px solid #ff2d78;
          outline: 1.5px solid #0ef6cc;
          outline-offset: -5px;
        }

        .faim-input {
          flex: 1;
          border: 1.5px solid #0ef6cc;
          border-radius: 22px;
          padding: 10px 16px;
          font-size: 0.9rem;
          font-family: inherit;
          resize: none;
          outline: none;
          max-height: 120px;
          line-height: 1.4;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: #1a1d26;
          color: #ffffff;
        }
        .faim-input::placeholder {
          color: #6b7280;
        }
        .faim-input:focus {
          border-color: #ff2d78;
          box-shadow: 0 0 0 2px rgba(255, 45, 120, 0.15);
        }

        .faim-send-btn {
          width: 42px;
          height: 42px;
          background: #ff2d78;
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .faim-send-btn:hover { background: #e0205f; }
        .faim-send-btn:active { transform: scale(0.95); }
        .faim-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* ── Listing Cards in Chat ── */
        .faim-listing-cards {
          display: flex;
          gap: 10px;
          padding: 6px 0 4px 40px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .faim-listing-cards::-webkit-scrollbar { display: none; }

        .faim-listing-card {
          background: white;
          border: 1.5px solid #e8e8e8;
          border-radius: 12px;
          overflow: hidden;
          min-width: 160px;
          max-width: 180px;
          flex-shrink: 0;
          text-decoration: none;
          display: block;
          transition: border-color 0.15s, transform 0.1s;
        }
        .faim-listing-card:hover {
          border-color: #ff2d78;
          transform: translateY(-2px);
        }

        .faim-lcard-img {
          position: relative;
          height: 90px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .faim-lcard-body { padding: 8px 10px; }

        .faim-lcard-price {
          font-size: 0.82rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 2px;
        }
        .faim-lcard-price span { font-size: 0.7rem; font-weight: 400; color: #999; }

        .faim-lcard-title {
          font-size: 0.78rem;
          font-weight: 600;
          color: #222;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }

        .faim-lcard-loc { font-size: 0.7rem; color: #888; margin-bottom: 4px; }

        .faim-lcard-meta {
          font-size: 0.68rem;
          color: #aaa;
          text-transform: capitalize;
          margin-bottom: 8px;
        }

        .faim-lcard-reveal-btn {
          width: 100%;
          padding: 7px 6px;
          background: #ff2d78;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .faim-lcard-reveal-btn:hover { background: #e0205f; }
        .faim-lcard-reveal-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 480px) {
          .faim-bubble { max-width: 85%; }
          .faim-listing-cards { padding-left: 8px; }
        }
      `}</style>
    </div>
  )
}