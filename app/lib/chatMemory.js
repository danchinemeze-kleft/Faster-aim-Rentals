const KEY = 'mrrent_chat_v1'
const TTL = 3 * 24 * 60 * 60 * 1000 // 3 days since last activity
const MAX_MSGS = 14

const empty = () => ({ updatedAt: Date.now(), messages: [], prefs: {} })

export function loadChat() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const s = JSON.parse(raw)
    if (Date.now() - s.updatedAt > TTL) {
      localStorage.removeItem(KEY)
      return empty()
    }
    return s
  } catch {
    return empty()
  }
}

export function saveChat({ messages, prefs }) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        updatedAt: Date.now(), // each save restarts the 3-day window
        prefs,
        messages: messages.slice(-MAX_MSGS).map(m => ({
          role: m.role,
          content: (m.content || '').slice(0, 1000),
          listingIds: m.listings?.length ? m.listings.map(l => l.id) : (m.listingIds || []),
        })),
      })
    )
  } catch {}
}

export const clearChat = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}