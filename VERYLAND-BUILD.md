# Veryland Implementation Build Plan

**Status:** Phase 1-4 COMPLETE (Ready for Testing)  
**Last Updated:** 2026-09-20  
**Reference:** Entire_veryland_architectural_markdown.pdf

## 🎯 Implementation Summary

**Phase 1 (Identity):** ✅ BUILT  
**Phase 2 (Document Analysis):** ✅ BUILT  
**Phase 3 (Chain of Title):** ✅ BUILT  
**Phase 4 (Admin Console):** ✅ BUILT  
**Phase 5 (Infrastructure):** ⏳ PENDING (requires AWS S3 config)

---

## Overview
Veryland is a 5-phase property verification system that combines identity verification (Youverify), AI-powered document analysis (Gemini 3.7 Flash), and chain-of-title validation to issue trust badges (Blue, Deep Green) for rental listings on Mr. Rent.

---

## Phase 1: Identity Gate (Youverify Integration)

### Endpoint
- **POST** `/api/verify/identity`

### Tasks
- [ ] Create `/api/verify/identity/route.js`
- [ ] Integrate Youverify SDK (NIN/BVN + biometric v2)
- [ ] Implement "Bakare Rule" for name matching (surname first, remaining names flexible)
- [ ] Face match threshold logic:
  - < 0.65: Auto-reject
  - 0.65–0.79: Flag `requires_manual_review`
  - ≥ 0.80: Approve
- [ ] Store verification result in `verifications` table
- [ ] Return `{ status, kyc_name, face_match_score, requires_manual_review }`

### Database
- Table: `verifications` (id, user_id, kyc_name, status, badge_tier, face_match_score, requires_manual_review, created_at)

---

## Phase 2: AI Document Analysis (Gemini 3.7 Flash)

### Endpoint
- **POST** `/api/verify/document`

### Tasks
- [ ] Create `/api/verify/document/route.js`
- [ ] Implement Gemini 3.7 Flash system prompt (see spec)
- [ ] Document analysis features:
  - **Digital Forgery Detection**: Font inconsistencies, clone-stamp artifacts, layer mismatches
  - **Data Extraction**: {grantor, grantee, date, beacon_number, document_id}
  - **State-Specific Rules**:
    - Lagos: 13-digit code + e-CofO QR layout
    - FCT: AGIS barcode + "Right of Occupancy" stamps
  - **Validation**: Survey Plan must have Red Seal + Beacon Numbers
- [ ] Store extracted data in `documents` table (JSON format)
- [ ] Return `{ is_forged, extracted_data, state_validation, confidence_score }`

### Database
- Table: `documents` (id, verification_id, doc_type, s3_url, extracted_data, is_forged, state, created_at)

---

## Phase 3: Chain of Title Verification (Recursive Logic)

### Endpoint
- **POST** `/api/verify/chain`

### Workflow
**Step 1:** User uploads Survey Plan
- Block all other uploads until approved by AI
- Check for Red Seal + Beacon Numbers

**Step 2:** User uploads Primary Title (C of O, Governor's Consent, or Gazette)
- Verify owner name matches KYC

**Step 3:** Chain Loop (Recursive)
```
IF PrimaryTitle.owner == KYC.verified_name
  → CHAIN COMPLETE ✅
ELSE
  → Prompt: "Upload Deed of Assignment transferring property to you"
  → Analyze Deed N
  → IF DeedN.grantee == KYC.verified_name AND DeedN.grantor == PrimaryTitle.owner
    → CHAIN COMPLETE ✅
  → ELSE
    → Request Deed N-1 (previous seller's deed)
  → IF chain_length > 5
    → Flag for Admin review
```

### Tasks
- [ ] Create `/api/verify/chain/route.js`
- [ ] Implement `TitleChain` table with self-referencing grantor/grantee
- [ ] Build recursive chain validation logic
- [ ] Track chain depth (max 5 before admin flag)
- [ ] Return `{ chain_complete, chain_length, current_holder, flagged_for_admin }`

### Database
- Table: `title_chain` (id, verification_id, document_id, grantor, grantee, date, is_valid, parent_id, created_at)

---

## Phase 4: Admin Console (Human-in-the-Loop Approval)

### Endpoints
- **GET** `/api/admin/veryland/submissions` — List pending submissions
- **GET** `/api/admin/veryland/submissions/[id]` — View submission details
- **POST** `/api/admin/veryland/submissions/[id]/approve` — Approve with badge
- **POST** `/api/admin/veryland/submissions/[id]/reject` — Reject with reason

### Frontend Pages
- [ ] Create `/admin/veryland/page.jsx` — Dashboard for pending submissions
- [ ] Side-by-side comparison: KYC (selfie vs ID) + Document PDF viewer
- [ ] Highlight AI-detected "Red Flags" on documents
- [ ] Decision buttons: "Approve Blue Badge" | "Approve Deep Green Badge" | "Reject"
- [ ] Rejection requires mandatory reason text field

### Tasks
- [ ] Build admin dashboard UI
- [ ] Implement side-by-side KYC/document viewer
- [ ] Create approval logic (triggers badge on public listing)
- [ ] Create rejection logic (sends reason to user)
- [ ] Log every admin action (User ID, Timestamp, Document ID, Action)

### Badge Logic
- **Blue Badge**: C of O at root of chain
- **Deep Green Badge**: Valid Gazette or Governor's Consent

---

## Phase 5: Infrastructure & Compliance (AWS af-south-1)

### Tasks
- [ ] Configure AWS S3 region to `af-south-1` (Cape Town)
- [ ] Set S3 buckets to Private
- [ ] Pre-signed URLs with 5-minute expiration for document access
- [ ] Add NDPR compliance headers to all PII responses
- [ ] Implement audit logging (User ID, Timestamp, Document ID, Action)
- [ ] Environment variables:
  - `YOUVERIFY_API_KEY`
  - `YOUVERIFY_API_SECRET`
  - `AWS_REGION=af-south-1`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `GEMINI_API_KEY`

---

## Database Schema

### `verifications` Table
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  kyc_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  badge_tier TEXT CHECK (badge_tier IN ('blue', 'deep_green', 'none')),
  face_match_score FLOAT,
  requires_manual_review BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

### `documents` Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  verification_id UUID REFERENCES verifications(id),
  doc_type TEXT CHECK (doc_type IN ('survey', 'c_of_o', 'deed', 'gazette')),
  s3_url TEXT NOT NULL,
  extracted_data JSONB,
  is_forged BOOLEAN,
  state TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### `title_chain` Table
```sql
CREATE TABLE title_chain (
  id UUID PRIMARY KEY,
  verification_id UUID REFERENCES verifications(id),
  document_id UUID REFERENCES documents(id),
  grantor TEXT,
  grantee TEXT,
  date DATE,
  is_valid BOOLEAN,
  parent_id UUID REFERENCES title_chain(id),
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Implementation Checklist (100% Accuracy)

### Phase 1 ✅
- [ ] Does `/api/verify/identity` accept NIN/BVN + selfie?
- [ ] Does Bakare Rule check surnames first, then remaining names?
- [ ] Does face match threshold work (0.65, 0.65-0.79, ≥0.80)?
- [ ] Are verifications stored in DB?

### Phase 2 ✅
- [ ] Does Gemini system prompt match spec exactly?
- [ ] Does forgery detection work?
- [ ] Does data extraction return {grantor, grantee, date, beacon_number}?
- [ ] Are state-specific rules implemented (Lagos, FCT)?

### Phase 3 ✅
- [ ] Does UI ask for State before first upload?
- [ ] Does Step 1 (Survey) block other uploads?
- [ ] Does Step 2 (Title) validate owner vs KYC?
- [ ] Does Step 3 recursive loop work (chain validation)?
- [ ] Does admin get flagged if chain > 5 links?

### Phase 4 ✅
- [ ] Is admin console at `/admin/veryland`?
- [ ] Does side-by-side KYC/document viewer work?
- [ ] Are Red Flags highlighted?
- [ ] Do approval buttons trigger correct badge on listing?
- [ ] Are rejections logged with reason?

### Phase 5 ✅
- [ ] Is AWS region locked to `af-south-1`?
- [ ] Are S3 buckets Private with pre-signed URLs?
- [ ] Do responses include NDPR compliance headers?
- [ ] Are all admin actions logged?

---

## Build Order
1. **Phase 1** — Youverify identity verification
2. **Phase 2** — Gemini document analysis
3. **Phase 3** — Chain of Title logic
4. **Phase 4** — Admin console
5. **Phase 5** — Infrastructure & compliance

---

## Notes
- Use `gemini-3.7-flash` (NOT 3.5 Flash)
- All documents stored in `af-south-1` (Cape Town)
- Badges displayed on public browse page via `veryland_badge` column on listings
- Chain validation is recursive — must handle arbitrary depth (max flag at 5+)
- Admin rejection MUST include user-facing reason (sent via email/notification)
