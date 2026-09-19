# Affiliate Program — Implementation Status

## ✅ COMPLETED

### Database & API Foundation
- ✅ **Payment routes already have affiliate logic**
  - `/api/init-payment/route.js` — accepts `ref_code` in request body
  - `/api/verify-payment/route.js` — creates commission records automatically
  - Commission table: `affiliate_commissions` (lines 96-107 of verify-payment)
  - Prevents self-referral (line 95)

### New Files Created
- ✅ **SQL Setup** — `AFFILIATE_SETUP.sql` (ready to run in Supabase)
  - Creates `affiliates` table
  - Creates `affiliate_commissions` table
  - Sets up RLS policies
  - Creates indexes
  
- ✅ **API Route** — `/api/affiliate/signup/route.js`
  - Signup validation
  - Unique ref code generation (format: `MRENT` + 8 random hex chars)
  - Duplicate check (one account per user)
  - Bank details storage
  
- ✅ **Dashboard** — `/app/affiliate/dashboard/page.jsx`
  - Earnings summary (total, pending, paid)
  - Referral performance stats (reveals vs subscriptions)
  - Referral link with copy button
  - Recent commissions table
  - Bank account info display
  - Real-time data from Supabase

### Ref Tracking (Affiliate Link Flow)
- ✅ **Homepage** (`/app/page.js`)
  - Captures `?ref=CODE` from URL
  - Stores in `localStorage` as `mrRentAffiliate`
  
- ✅ **Browse Page** (`/app/browse/page.js`)
  - Also captures `?ref=` parameter
  - Passes ref to payment init
  - Comment: "Capture affiliate ref parameter from URL"

### Payment Integration
- ✅ **Init Payment** (`/api/init-payment/route.js`)
  - Already accepts `ref_code` in request body (line 45)
  - Passes to Paystack metadata
  
- ✅ **Browse Payment Handler**
  - Modified `initiatePayment()` function
  - Reads `mrRentAffiliate` from localStorage
  - Sends `ref_code` to API

---

## 🟡 STILL NEEDS SETUP (Your Action)

### 1. Run Supabase SQL
**Status**: SQL file ready at `AFFILIATE_SETUP.sql`

**Action**:
```
1. Open Supabase Dashboard
2. Go to SQL Editor → New Query
3. Copy entire AFFILIATE_SETUP.sql
4. Paste into SQL editor
5. Click Run
```

**What it creates**:
- `affiliates` table (stores affiliate profiles)
- `affiliate_commissions` table (tracks earnings)
- Row-level security policies
- Performance indexes

### 2. Verify Environment Variables
**Status**: All needed vars already exist in Vercel

**Check these are set**:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (for backend operations)

If `SUPABASE_SERVICE_ROLE_KEY` is missing:
```
1. Supabase → Settings → API
2. Copy "service_role" key
3. Vercel → Project Settings → Environment Variables
4. Add: SUPABASE_SERVICE_ROLE_KEY = [paste key]
5. Redeploy
```

### 3. Deploy to Vercel
**Status**: Code ready, awaiting deployment

**Action**:
```bash
git add .
git commit -m "feat: Complete affiliate program system"
git push origin main
```

Vercel will auto-deploy. Check logs if needed.

---

## 📋 System Architecture Overview

```
User clicks affiliate link
    ↓
?ref=MRENT12345678 captured in localStorage
    ↓
User browses, finds listing, clicks "Meet Landlord"
    ↓
Browse page reads mrRentAffiliate from localStorage
    ↓
Sends to /api/init-payment with ref_code
    ↓
/api/init-payment passes to Paystack metadata
    ↓
User pays ₦5,000 via Paystack
    ↓
/api/verify-payment validates payment
    ↓
Looks up affiliate by ref_code
    ↓
Creates entry in affiliate_commissions table
    ↓
✨ Commission recorded (status: pending)
    ↓
Affiliate sees ₦500 in /affiliate/dashboard
    ↓
Admin transfers money → marks status: paid
```

---

## 🔍 Key Implementation Details

### Ref Code Format
- **Pattern**: `MRENT` + 8 random hex characters
- **Example**: `MRENT1a2b3c4d`
- **Guaranteed unique**: Generated with collision check loop

### Commission Amounts
- **Contact reveal**: ₦500 (from ₦5,000 payment)
- **Landlord subscription**: ₦2,000 (from ₦10,000 payment)
- **No earnings cap**: Unlimited potential

### Security
- **RLS policies**: Affiliates can only see their own commissions
- **Self-referral prevention**: Can't earn from own purchases (line 95 of verify-payment)
- **Service role key**: Backend uses elevated permissions for audit trail

### Database Relationships
```
affiliates (user profiles)
    ↓ id (FK)
affiliate_commissions (earnings records)
    ↓ affiliate_id
Back to affiliates for dashboard queries
```

---

## 🧪 Quick Test Checklist

Once Supabase tables are created:

### 1. Test Signup
```
URL: https://rent.fasteraim.com/affiliate
Action:
  - Click "Create Account / Login" if not logged in
  - Fill: Name, Phone, Bank, Account #, Account Name
  - Click "Get My Referral Link"
  - Should see: "Welcome to the Mr. Rent Affiliate Program! 🎉"
  - Should see: Referral link like "rent.fasteraim.com?ref=MRENT..."
```

### 2. Test Ref Tracking
```
Browser Console:
  localStorage.getItem('mrRentAffiliate')
  Should return: null (before clicking link) or "MRENT..." (after)
```

### 3. Test Payment Integration
```
URL: https://rent.fasteraim.com?ref=MRENT[affiliate's code]
Action:
  - Go to /browse
  - Find any listing
  - Click "Meet Landlord • ₦5k"
  - Complete Paystack test payment
  - Check Supabase: affiliate_commissions table
  - Should see new row with status: "pending"
```

### 4. Test Dashboard
```
URL: https://rent.fasteraim.com/affiliate/dashboard
Should see:
  - Total earnings (sum of commissions)
  - Pending amount
  - Recent transactions table
  - Your referral link
  - Bank details
```

---

## 📊 Files & Changes Summary

### Created (3 files)
1. `AFFILIATE_SETUP.sql` — 56 lines, Supabase schema
2. `/app/api/affiliate/signup/route.js` — 69 lines, API endpoint
3. `/app/affiliate/dashboard/page.jsx` — 300+ lines, React component

### Modified (2 files)
1. `/app/page.js` — +10 lines, ref parameter capture
2. `/app/browse/page.js` — +12 lines, ref passing to payments

### Already Supporting (2 files, no changes needed)
1. `/app/api/init-payment/route.js` — line 45 already accepts ref_code
2. `/app/api/verify-payment/route.js` — lines 89-107 handle commissions

**Total: ~450 lines of new code + setup**

---

## 🚀 One-Line Deployment

After Supabase SQL is done:
```bash
git add -A && git commit -m "feat: Complete affiliate program (₦500/reveal, ₦2,000/sub)" && git push
```

Vercel deploys automatically. Done! 🎉

---

## 🛑 Blocker Prevention

### If Supabase SQL fails:
- **Error**: "relation affiliates does not exist"
  → SQL didn't run. Re-run AFFILIATE_SETUP.sql
- **Error**: "permission denied"
  → RLS policy issue. Check Supabase SQL editor logs

### If affiliate signup fails:
- **Error**: "500 Server error"
  → Check Vercel logs for SUPABASE_SERVICE_ROLE_KEY issue
- **Error**: "Unauthorized"
  → Auth token expired. Try logging out/in

### If commissions don't appear:
- **Check 1**: Payment succeeded in Paystack
- **Check 2**: ref_code was passed to /api/init-payment
- **Check 3**: ref_code matches actual affiliate's code
- **Check 4**: Database row exists in affiliate_commissions

---

## Next Phase (After Verified Working)

1. **Tell affiliates** about program (email, WhatsApp, social)
2. **Create landing page** highlighting top earners
3. **Add payout automation** (weekly transfers via Paystack)
4. **Tier system** (5% → 10% → 15% commission)
5. **Fraud detection** (flag suspicious ref patterns)

---

**You're ready! Just run the SQL and deploy.** ✨
