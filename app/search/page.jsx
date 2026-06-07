'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const SYSTEM_PROMPT = `You are Mr. Rent, a friendly and knowledgeable Nigerian property rental assistant for the FasterAIM Rentals platform. You help people find rental properties across Nigeria.

Your personality:
- Warm, professional, and helpful
- Knowledgeable about Nigerian cities, neighborhoods, and property markets
- You understand Nigerian rental culture (agent fees, caution fees, yearly payments, etc.)

Your capabilities:
- Help users search for properties by location, budget, and type
- Explain Nigerian rental terms (caution fee, agency fee, agreement fee)
- Give advice on renting in Nigerian cities
- When a user describes what they want, extract: location, property type, budget, bedrooms
- Always encourage users to browse listings or create an account

When users describe what they want, respond helpfully and suggest they check the listings. Keep responses concise and conversational. Never make up specific property listings - instead guide them to browse.

Important: Always end your response with a helpful next step like "Would you like to browse available listings?" or "You can check our listings page for options in that area."`

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
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

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
          systemPrompt: SYSTEM_PROMPT
        })
      })

      const data = await response.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
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

  const Avatar = ({ size = 40, fontSize = '1.2rem' }) => (
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
      <img
        src="/mr-rent-avatar.png"
        alt="Mr. Rent"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )

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
        {messages.map((msg, i) => (
          <div key={i} className={`faim-message-row faim-message-row--${msg.role}`}>
            {msg.role === 'assistant' && <Avatar size={32} />}
            <div className={`faim-bubble faim-bubble--${msg.role}`}>
              {formatMessage(msg.content)}
            </div>
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
          onChange={e => setInput(e.target.value)}
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
          /* ✅ FIX: explicit text and background colors for legibility */
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

        @media (max-width: 480px) {
          .faim-bubble { max-width: 85%; }
        }
      `}</style>
    </div>
  )
}