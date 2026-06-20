'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import Breadcrumb from '../components/Breadcrumb'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


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
        <a
          href={`/listing/${l.id}`}
          className="faim-lcard-view-btn"
        >
          View Details →
        </a>
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

    let hasReply = false

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?.id,
        }),
      })

      if (!response.ok || !response.body) throw new Error()

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') continue

          try {
            const event = JSON.parse(raw)

            if (event.t === 'chunk' && event.v) {
              if (!hasReply) {
                hasReply = true
                setLoading(false)
                setMessages(prev => [...prev, { role: 'assistant', content: event.v, listings: [] }])
              } else {
                setMessages(prev => {
                  const updated = [...prev]
                  const last = { ...updated[updated.length - 1] }
                  last.content += event.v
                  updated[updated.length - 1] = last
                  return updated
                })
              }
            } else if (event.t === 'listings') {
              setMessages(prev => {
                const updated = [...prev]
                const last = { ...updated[updated.length - 1] }
                last.listings = event.v || []
                updated[updated.length - 1] = last
                return updated
              })
            } else if (event.t === 'error' && !hasReply) {
              hasReply = true
              setMessages(prev => [...prev, { role: 'assistant', content: "No wahala — I just need a moment. Please send your message again! 🏠" }])
            }
          } catch {}
        }
      }

      if (!hasReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: "No wahala — I just need a moment. Please send your message again! 🏠" }])
      }
    } catch {
      if (!hasReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong on my end. Please try again." }])
      }
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

      {/* Styles now defined in globals.css with dark/light mode support */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  )
}