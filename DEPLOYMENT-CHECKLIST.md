# Deployment Checklist
**Veryland System + Page Fixes**

---

## ✅ PRE-DEPLOYMENT

### Code Review
- [x] All files committed to git
- [x] No console.error() calls left unhandled
- [x] All API routes have proper error responses
- [x] All RLS policies configured in migration

### Testing (Manual)
- [ ] Identity verification endpoint works (mock or real Youverify)
- [ ] Document analysis returns JSON from Gemini
- [ ] Chain validation logic tested recursively
- [ ] Admin approval changes badge on listing
- [ ] Browse page displays correctly
- [ ] Affiliate pages load without errors

### Environment Variables
- [ ] `YOUVERIFY_API_KEY` set on Vercel
- [ ] `YOUVERIFY_CLIENT_ID` set on Vercel
- [ ] `GEMINI_API_KEY` set on Vercel (confirm gemini-3.7-flash)
- [ ] `AWS_REGION=af-south-1` set on Vercel
- [ ] `AWS_ACCESS_KEY_ID` set on Vercel
- [ ] `AWS_SECRET_ACCESS_KEY` set on Vercel

---

## 🗄️ DATABASE DEPLOYMENT

```bash
# 1. Backup current schema
supabase db pull

# 2. Apply Veryland migration
supabase migration up

# 3. Verify migration applied
supabase db pull  # Should show new tables

# 4. Check RLS policies
# Log into Supabase dashboard → Check policies on:
#   - verifications
#   - documents
#   - title_chain
#   - admin_logs
```

### Migration File Location
`supabase/migrations/002_veryland_schema.sql`

### Tables Created
- verifications
- documents
- title_chain
- admin_logs

### Columns Added
- Profiles: kyc_verified, kyc_name, veryland_verified, veryland_badge
- Listings: veryland_badge, verification_id

---

## 🚀 CODE DEPLOYMENT

```bash
# 1. Stage changes
git add -A

# 2. Review staged changes
git status

# 3. Commit
git commit -m "feat: Add Veryland verification system + fix page audit issues

- Phase 1-4 Veryland APIs (identity, document, chain, admin)
- Admin console (/admin/veryland) with KYC/document review
- User verification flow (/veryland/verify) with 5 phases
- Fixed Supabase client usage in browse, affiliate, search pages
- Fixed race condition in list/page.jsx
- Added error handling to my-account and affiliate pages
- Created /api/submit-listing route (was missing)

Fixes:
- 3 CRITICAL: Supabase client imports
- 3 HIGH: Race conditions, error handling, RLS validation
- 4 MEDIUM: Error handling, column consistency

Database:
- New migration: 002_veryland_schema.sql
- 4 new tables + 13 RLS policies
- Column additions to Profiles and Listings

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# 4. Push to GitHub
git push origin main

# 5. Vercel auto-deploys (or manually trigger if needed)
```

---

## 🧪 POST-DEPLOYMENT TESTS

### Identity Verification
```bash
# 1. Navigate to /veryland/verify
# 2. Select state (required)
# 3. Enter test NIN/BVN (if available)
# 4. Capture/upload selfie
# 5. Click "Verify Identity"
# Expected: Verification stored in DB
```

### Admin Console
```bash
# 1. Create test verification (above)
# 2. Navigate to /admin/veryland
# 3. Verify submission appears in list
# 4. Click submission details
# 5. Test approval buttons (Blue/Deep Green)
# 6. Verify Profiles table updated with badge
```

### Listings Page
```bash
# 1. Login as landlord
# 2. Navigate to /list
# 3. Create new listing via /api/submit-listing
# 4. Verify listing appears in listings table
# 5. Check status = 'pending'
```

### Browse Page
```bash
# 1. Navigate to /browse
# 2. Verify listings load without errors
# 3. Check Veryland badges display (if assigned)
# 4. Test filters work
# 5. Test "Reveal Contact" flow
```

---

## 🔍 MONITORING

### Logs to Watch
- Vercel function logs (any 5xx errors?)
- Supabase audit logs (RLS policy violations?)
- Browser console (any JS errors?)

### Metrics
- Time to verify identity: ~2-5s (Youverify)
- Time to analyze document: ~3-10s (Gemini)
- Admin approval latency: <100ms

### Alerts
- If verification approval fails: Check YOUVERIFY_API_KEY
- If document analysis fails: Check GEMINI_API_KEY
- If admin console fails: Check role policies

---

## 🚨 ROLLBACK PLAN

If critical issue found:

```bash
# 1. Revert code
git revert <commit-hash>
git push origin main

# 2. Drop migration (if needed)
supabase db reset  # WARNING: Resets entire DB
# OR
# Use Supabase dashboard to delete tables manually

# 3. Verify previous version works
```

---

## 📞 SUPPORT CONTACTS

### Services
- **Youverify:** API support @ youverify.co
- **Gemini:** API support @ Google Cloud Console
- **AWS S3:** Support @ AWS Console (af-south-1)

### Internal
- **Supabase Project ID:** ojkhpishuqyeiwaopaty
- **GitHub Repo:** danchinemeze-kleft/Faster-aim-Rentals
- **Vercel Project:** faster-aim-rentals

---

## ✅ FINAL SIGN-OFF

- [ ] All changes reviewed by Daniel
- [ ] All env vars configured on Vercel
- [ ] Migration tested on staging
- [ ] Manual testing passed
- [ ] Ready for production deployment

**Deployed By:** _______________  
**Date:** _______________  
**Version:** 2026-09-20

---

**Status:** Ready for deployment ✅
