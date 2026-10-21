'use client'

const BASE_URL = 'https://rent.fasteraim.com'

export default function ShareWhatsApp({ id, title, price, location, refCode, className = '' }) {
  const url = `${BASE_URL}/listing/${id}${refCode ? `?ref=${refCode}` : ''}`

  const text =
    `🏠 ${title || 'Property for rent'}` +
    (price ? `\n💰 ₦${Number(price).toLocaleString()}` : '') +
    (location ? `\n📍 ${location}` : '') +
    `\n\nSee photos and details on Mr. Rent:\n${url}`

  const share = async (e) => {
    e.preventDefault()
    e.stopPropagation() // so it works inside clickable cards
    // On phones, use the native share sheet if available (includes WhatsApp)
    if (navigator.share) {
      try {
        await navigator.share({ title: title || 'Mr. Rent', text, url })
        return
      } catch {
        /* user cancelled: fall through to WhatsApp link */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <button type="button" onClick={share} className={`faim-share-btn ${className}`} aria-label="Share this property on WhatsApp">
      <span aria-hidden="true">📲</span> Share on WhatsApp
    </button>
  )
}