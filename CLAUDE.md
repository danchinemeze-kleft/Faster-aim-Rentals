@AGENTS.md
# CLAUDE.md — Mr. Rent / Faster Aim Technology Limited
# Read this entire file before touching any code.

---

## Who You Are Working With

**Daniel Chinaemere Igboke**
- Founder & CEO, Faster Aim Technology Limited (CAC-registered)
- Based in Awka/Onitsha corridor, Anambra State, Southeast Nigeria
- Works on Windows with VS Code + PowerShell terminal
- HP ProBook laptop, MTN 4G LTE router (intermittent connectivity)
- Solo full-stack operator — needs complete, ready-to-paste code, never partial snippets
- ALWAYS use PowerShell-compatible commands. NEVER use bash heredoc `<< 'EOF'`
- For file creation use `Out-File -Encoding utf8NoBOM`

---

## The Company

**Faster Aim Technology Limited**
- CAC-registered AI education and technology company
- IPON trademarks filed: Classes 36, 41, 42
- Two live platforms: fasteraim.com (EdTech) and rent.fasteraim.com (PropTech)
- Pitch narrative: "One Company. Two Platforms."
- $150K seed ask: $50K EdTech + $50K PropTech + $50K ops
- iDICE Vester rating received (45% — being improved)

---

## Platform: Mr. Rent (rent.fasteraim.com)

### Vision
Nigeria's first AI-powered rental marketplace. Solves the fragmented, scam-ridden Nigerian rental market by combining:
- Airbnb-style property browsing
- Social algorithm ranking (trending, recently updated, high-engagement listings)
- Conversational AI layer (Gemini primary, DeepSeek fallback) that extracts tenant intent and surfaces the best listings
- Contact reveal payment system (tenants pay ₦5,000 to unlock landlord phone number via Paystack)

### Target Market
Starting with Southeast Nigeria (Anambra, Enugu, Imo, Abia, Delta), expanding nationally across all 36 states.

### Monetization (Dual Revenue)
1. **Tenant pays ₦5,000** per contact reveal (Paystack one-time payment) — LIVE
2. **Landlord pays ₦10,000/month** subscription to list unlimited properties — LIVE
3. **Featured/promoted listings** — planned for later phase once traffic builds

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) |
| Deployment | Vercel (Hobby plan) |
| Database | Supabase (Postgres) |
| Auth | Supabase SSR auth |
| Payments | Paystack |
| AI Primary | Gemini 3.5 Flash — API string `gemini-3.5-flash` |
| AI Fallback | DeepSeek |
| Styling | Inline styles (no Tailwind, no CSS modules) |
| Brand Colors | Cyan #0ef6cc, Pink #ff2d78, Dark #080a0f / #050510 |
| Fonts | Segoe UI / system-ui |

---

## GitHub & Vercel

- **GitHub repo:** `danchinemeze-kleft/Faster-aim-Rentals`
- **Vercel project:** `faster-aim-rentals`
- **Branch:** `main`
- **Live URL:** https://rent.fasteraim.com

---

## Supabase

- **Project ID:** `ojkhpishuqyeiwaopaty`
- **Tables:**
  - `listings` — columns: `id`, `title`, `location`, `state`, `price`, `price_period`, `property_type`, `bedrooms`, `bathrooms`, `images`, `video_url`, `description`, `amenities`, `status`, `available`, `landlord_id`, `created_at`
  - `Profiles` — (capital P, case-sensitive) columns: `id`, `full_name`, `email`, `phone`, `role`, `subscribed`, `created_at`
  - `Subscription` — columns: `id`, `landlord_id`, `expiry_date`, `created_at`
  - `Contact_reveals` — columns: `id`, `landlord_id`, `tenant_id`, `listing_id`, `created_at`
  - `Tenant_subscription` — columns: `id`, `user_id`, `plan_type`, `status` (pending/active/expired/cancelled), `start_date`, `expiry_date`, `paystack_reference`, `amount`, `created_at`
  - `user_activity` — tenant behavior tracking

- **Env vars on Vercel:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `PAYSTACK_SECRET_KEY`
  - `GEMINI_API_KEY`
  - `ADMIN_PASSWORD` (server-only, no NEXT_PUBLIC prefix)

---

## File Structure (app directory)

```
app/
  page.js                  ← Homepage (Next.js, live)
  layout.js                ← Root layout
  globals.css
  browse/page.js           ← Browse listings (live)
  search/page.js           ← AI Chat (PROBLEM: WordPress still intercepting)
  list/page.js             ← List property form (PROBLEM: WordPress intercepting)
  account/page.js          ← Auth page (PROBLEM: WordPress intercepting)
  listing/[id]/page.jsx    ← Property detail page (live — photos, amenities, Reveal Contact)
  subscribe/page.jsx       ← Landlord subscription checkout via Paystack (live)
  about/page.jsx           ← About page (live)
  contact/page.jsx         ← Contact page (live)
  affiliate/page.jsx       ← Affiliate page (live)
  veryland/page.jsx        ← Veryland page (live)
  dashboard/page.jsx       ← Landlord dashboard (live, auth-protected)
  my-account/              ← Exists
  reveal-success/          ← Exists
  pay-success/             ← Exists
  privacy-policy/          ← Live
  terms-of-service/        ← Live
  refund-policy/           ← Live
  admin/page.js            ← Admin panel (live, password-protected)
  callback/route.js        ← Supabase auth handler — DO NOT MODIFY FOR AI WORK
  api/
    chat/route.js          ← Gemini AI chat (live)
    init-payment/route.js  ← Paystack init (live)
    verify-payment/route.js← Paystack verify (live)
    admin-auth/route.js    ← Admin password check (live)
    submit-listing/route.js← Listing form backend — uploads images, inserts to Supabase (live)
    free-reveal/route.js   ← Subscription reveal — verifies active Tenant_subscription, inserts Contact_reveals, returns contact (no payment)
```

---

## CSS / JS Conventions

- CSS class prefix: `faim-`
- JS/PHP function prefix: `faim_`
- WordPress REST routes prefix: `mrrent`
- Always use inline styles in Next.js components (no external CSS files)
- Brand: cyan `#0ef6cc` + pink `#ff2d78` on dark obsidian `#080a0f`

---

## Critical Rules

1. **NEVER modify `app/callback/route.js`** — it is the Supabase auth handler
2. **NEVER use `NEXT_PUBLIC_` prefix for sensitive values** (passwords, secret keys)
3. Always provide **complete, ready-to-paste code** — Daniel cannot work with partial snippets
4. The browse page is always called the **browse page** — never "listings page"
5. `/api/chat/route.js` is the ONLY file that should handle Gemini AI
6. Use `createBrowserClient` from `@supabase/ssr` for client components
7. Use `createServerClient` from `@supabase/ssr` for server components/API routes
8. Landlord-to-listing matching uses `listings.landlord_id = Profiles.id`

---

## What Is Built and Working

- [x] Homepage (Next.js, branded, live)
- [x] Browse page (live)
- [x] AI Chat API route (Gemini + DeepSeek, intent extraction, Supabase fetch)
- [x] Paystack init + verify payment routes
- [x] Contact reveal flow (₦5,000, Paystack → reveal-success)
- [x] Landlord dashboard (overview, listings, subscription, profile tabs)
- [x] Admin panel (password-protected, listing approval, landlord management)
- [x] Supabase auth (signup, login, session, callback)
- [x] Privacy policy / Terms of Service / Refund Policy pages
- [x] Sitemap + robots.ts (SEO — 12 pages indexed in Google)
- [x] `/listing/[id]` — Property detail page with photos, amenities, Reveal Contact button
- [x] `/api/submit-listing` — Listing form backend (image upload to Supabase Storage, DB insert)
- [x] `/subscribe` — Landlord subscription checkout via Paystack
- [x] `/about`, `/contact`, `/affiliate`, `/veryland` pages

---

## What Is Missing / Broken (Priority Order)

### Priority 1 — Revenue protection
- [ ] Tenant reveal limit enforcement — no logic currently prevents unlimited free reveals
- [ ] `/api/subscription-webhook` — Paystack webhook to auto-update Subscription table on renewal/cancellation/failure
- [ ] Fix routing: `/search`, `/list`, `/account` are still intercepted by old WordPress. Next.js versions exist but WordPress wins the route. Needs DNS/hosting fix on Hostinger side.

### Priority 2 — Growth
- [ ] Featured/promoted listings — paid placement for landlords once traffic builds
- [ ] Listing search/filter on browse page (by state, price, bedrooms, property type)

---

## The WordPress Situation

The old WordPress site is still installed and active on the same domain. Some routes (/search, /list, /account) are intercepted by WordPress before Vercel can serve them. The fix is on the Hostinger DNS/hosting side — WordPress needs to be disabled or those routes need to be fully redirected to Vercel. Do not try to fix this from within the Next.js codebase.

---

## The Bigger Picture

fasteraim.com (the EdTech platform) runs separately on WordPress/Hostinger with:
- 16 courses across 4 learning tracks (TutorLMS + WooCommerce + Paystack)
- Course prices ₦3,000–₦65,000, All Access Bundle ₦200,000
- "Mr. Rembow" instructor persona
- smallbusiness.fasteraim.com blog targeting African entrepreneurs

Mr. Rent and fasteraim.com are both owned by Faster Aim Technology Limited and pitched together to investors as a dual-platform AI company.

---

## Contact & Identity

- **Email:** info@fasteraim.com / hello@fasteraim.com
- **Address:** 13 Barr Nso Street, Awada-Obosi, Onitsha, Anambra State
- **Company:** Faster Aim Technology Limited
- **Year:** 2026

---

*This file was generated from Daniel's full session history with Claude (claude.ai). Keep it updated as new features are built.*