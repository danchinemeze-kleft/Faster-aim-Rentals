# Mr. Rent Affiliate Program — Complete Setup Guide

## What's Been Built

✅ **Complete affiliate system with:**
- Affiliate signup & registration
- Unique referral link generation (format: `rent.fasteraim.com?ref=MRENT12345678`)
- Real-time earnings tracking (₦500 per contact reveal, ₦2,000 per landlord subscription)
- Full affiliate dashboard with earnings stats and commission history
- Automatic affiliate commission recording when payments happen
- No earnings cap

---

## STEP 1: Run Supabase SQL Setup

1. Go to **Supabase Dashboard** → Your project → **SQL Editor**
2. Create a **New Query**
3. Copy-paste the entire contents of `AFFILIATE_SETUP.sql` file
4. Click **Run** (be patient, it may take a few seconds)

**What this does:**
- Creates `affiliates` table (stores affiliate profiles)
- Creates `affiliate_commissions` table (tracks all earnings)
- Sets up Row-Level Security (RLS) permissions
- Creates indexes for performance

---

## STEP 2: Environment Variables (Vercel)

No new env vars needed! The system uses existing ones:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## STEP 3: Deploy to Vercel

1. Push changes to GitHub: `git push origin main`
2. Go to **Vercel Dashboard** → **faster-aim-rentals** project
3. Wait for auto-deployment (or manually trigger)
4. Test at: https://rent.fasteraim.com/affiliate

---

## How It Works (User Journey)

### For Affiliates (Revenue Partners)

1. **Sign up**: Go to `/affiliate` → fill form (name, phone, bank details)
2. **Get link**: Receives unique code like `MRENT12345678`
3. **Share link**: `https://rent.fasteraim.com?ref=MRENT12345678`
   - Via WhatsApp, Twitter, Facebook, blogs, etc.
4. **Earn**:
   - ₦500 when someone clicks link → pays ₦5,000 for contact reveal
   - ₦2,000 when someone clicks link → subscribes (₦10,000/month landlord plan)
5. **Track**: `/affiliate/dashboard` shows real-time earnings, pending balance, paid amount

### For Tenants/Landlords (Referred Users)

1. Click affiliate's link: `https://rent.fasteraim.com?ref=MRENT12345678`
2. Ref code stored in `localStorage` automatically
3. Browse, find listings, make payments as normal
4. Affiliate earns automatically (ref code passed through payment metadata)

### Payment Flow

When payment happens:
1. User clicks "Meet Landlord • ₦5k" or subscribes
2. System reads `mrRentAffiliate` from localStorage
3. Passes `ref_code` to Paystack payment metadata
4. Payment verified → commission recorded in `affiliate_commissions` table
5. Affiliate sees new earning in dashboard (status: "Pending")
6. Admin marks as "Paid" via dashboard (manual payout)

---

## Database Schema

### `affiliates` table
```
id              (UUID) — user's Supabase auth ID
ref_code        (TEXT) — unique code like "MRENT12345678"
full_name       (TEXT)
phone           (TEXT) — WhatsApp for contact
bank_name       (TEXT) — e.g. "Access Bank"
account_number  (TEXT) — for bank transfers
account_name    (TEXT) — name on account
status          (VARCHAR) — "active" or "inactive"
created_at      (TIMESTAMP)
```

### `affiliate_commissions` table
```
id                  (UUID)
affiliate_id        (UUID) — foreign key to affiliates
ref_code            (TEXT) — for quick lookup
transaction_type    (VARCHAR) — "reveal" or "landlord_subscription"
transaction_amount  (INTEGER) — e.g. 5000 or 10000
commission_amount   (INTEGER) — e.g. 500 or 2000
paystack_reference  (TEXT) — payment reference
referred_user_id    (UUID) — the tenant/landlord who paid
status              (VARCHAR) — "pending" or "paid"
created_at          (TIMESTAMP)
```

---

## Key Features

### Affiliate Signup (`/api/affiliate/signup`)
- Validates bank details
- Generates unique, collision-free ref code
- Prevents duplicate signups (one person = one affiliate account)

### Ref Tracking
- `/app/page.js` — captures `?ref=` on homepage
- `/app/browse/page.js` — captures `?ref=` on browse page
- Stored in `localStorage` as `mrRentAffiliate`
- Persists across pages and payment flow

### Commission Tracking
- **Automatic**: When payment verified, commission inserted
- **Prevents self-referral**: Can't earn if ref_code matches your own user ID
- **Dual earning**: Earn from both reveals (₦500) and subscriptions (₦2,000)

### Dashboard Features
- **Total earnings**: Sum of all commissions
- **Pending balance**: Unpaid commissions
- **Paid balance**: Already transferred
- **Recent transactions**: Full history with dates and statuses
- **Referral stats**: Count of reveals vs subscriptions
- **Bank details**: View/confirm payout info

---

## Admin Payout Process

**Note**: Payouts are currently manual (not automated).

Steps:
1. Go to Supabase → `affiliate_commissions` table
2. Filter for `status = 'pending'`
3. Sum total per affiliate
4. Transfer money to their bank account (received during signup)
5. Update status to `'paid'` in database

**Automated webhook** (future improvement): Can add Paystack webhook to auto-update on failed/cancelled subscriptions.

---

## Testing Checklist

### Test Affiliate Signup
- [ ] Go to `/affiliate`
- [ ] Fill form with test details
- [ ] See "Welcome to Mr. Rent Affiliate Program! 🎉"
- [ ] Ref code displayed (format: MRENT + 8 chars)

### Test Referral Link
- [ ] Click "Copy" button
- [ ] Link format: `rent.fasteraim.com?ref=MRENT...`
- [ ] Paste in another browser tab / incognito
- [ ] See "Welcome to Mr. Rent" page (ref stored in localStorage)

### Test Payment Tracking
- [ ] Click affiliate's referral link
- [ ] Go to browse
- [ ] Make test payment for reveal (₦5,000)
- [ ] Check Paystack webhook (ref_code in metadata)
- [ ] Check `/affiliate/dashboard` — commission shows "Pending"

### Test Dashboard
- [ ] Login as affiliate
- [ ] Go to `/affiliate/dashboard`
- [ ] See stats (total, pending, paid)
- [ ] See recent commissions table
- [ ] See bank details section

---

## Troubleshooting

### "Already registered as affiliate"
- User tried to sign up twice
- Check `affiliates` table for their user ID
- Delete if needed, then re-signup

### No commissions showing up
1. Check Paystack payment succeeded (status: 'success')
2. Check `ref_code` in payment metadata matches affiliate's `ref_code`
3. Check `affiliate_commissions` table for the record
4. If missing: payment didn't include ref_code (user didn't click affiliate link)

### Ref code not being passed to payment
1. Check `localStorage.getItem('mrRentAffiliate')` in browser console
2. Verify ref was captured when landing on page with `?ref=`
3. Check `/api/init-payment` includes `ref_code` in request body

### RLS Permission Denied
- Ensure user is logged in with valid JWT
- Check Supabase policies allow SELECT on affiliates table
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set on Vercel

---

## Revenue Notes

### Per Affiliate
- Min commission: ₦500 per reveal
- Max: Unlimited (no cap)
- Expected earnings: 1 reveal/day = ₦500/day = ₦15,000/month

### For Mr. Rent
- Contact reveal: ₦5,000 (affiliate earns ₦500 = 10% commission)
- Landlord subscription: ₦10,000/month (affiliate earns ₦2,000 = 20% commission)
- Affiliate program grows organic user base

---

## Files Modified / Created

### Created:
- `/app/api/affiliate/signup/route.js` — Affiliate registration API
- `/app/affiliate/dashboard/page.jsx` — Earnings dashboard
- `/AFFILIATE_SETUP.sql` — Supabase table setup

### Modified:
- `/app/page.js` — Added ref parameter capture
- `/app/browse/page.js` — Added ref tracking + pass to payments
- `/app/api/init-payment/route.js` — Already supports ref_code
- `/app/api/verify-payment/route.js` — Already supports commission tracking

---

## Next Steps (Optional Enhancements)

1. **Payout automation**: Add Paystack webhook to auto-mark as "paid"
2. **Top affiliates**: Show leaderboard on homepage
3. **Affiliate tiers**: Different commission rates (5%, 10%, 15%)
4. **Invite tracking**: Track not just payments but clicks/signups
5. **Weekly payouts**: Auto-transfer pending balance once a week
6. **Fraud detection**: Flag unusual referral patterns

---

## Support

If something breaks:
1. Check Supabase SQL query ran successfully
2. Check Vercel deployment logs
3. Check browser console for JS errors
4. Check network tab for API errors
5. DM Daniel on WhatsApp if still stuck

Good luck! 🚀
