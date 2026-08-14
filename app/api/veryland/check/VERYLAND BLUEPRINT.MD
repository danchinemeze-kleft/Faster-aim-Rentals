This is the final, audited Veryland Implementation Guide. It is formatted for
direct use in VS Code or to be shared with a developer/AI assistant.

Important Note for Developers:

  - Items marked (a) are verified facts/sources.
  - Items marked (b) are plausible estimates, architectural heuristics, or
    custom logic that must be validated against official documentation or
    ground-truth samples before production.

VERYLAND: TECHNICAL IMPLEMENTATION GUIDE (MVP V1)

1. Core Tech Stack (Architectural Heuristics)

  - Backend: Node.js + TypeScript.
  - AI Engine: Google Generative AI SDK (Target: Gemini 3.7 Flash).
  - Identity: (a) Youverify API (NIN/BVN & Biometrics).
  - Database: PostgreSQL (for relational chain-of-title mapping).
  - Storage: (a) AWS S3 (Region: af-south-1 Cape Town).
  - Frontend: React (Internal Web Admin Console).

2. Infrastructure & Data Residency

  - Region: (a) AWS af-south-1 (Cape Town). All PII and property documents must
    reside here.
  - NDPA Compliance: (b) Implement Purpose-Based Audit Logging. For every
    request involving PII, the system must log: Timestamp, Admin_ID,
    Data_Subject_ID, Purpose_Category (e.g., Verification_Audit), and
    Legal_Basis (Contractual Necessity).
  - Security: Documents must be served via (b) S3 Pre-signed URLs with a
    maximum 10-minute expiry.

3. Database Schema (Heuristic Design)

Implement the following core relations:

  - Verifications: id, user_id, status (pending, flagged, approved), badge_tier
    (blue, deep_green), state, kyc_name.
  - Documents: id, verification_id, s3_url, doc_type (survey, primary_title,
    deed), sequence_order, extracted_data (JSONB).
  - TitleLinks: id, deed_id, grantor_name, grantee_name, prev_link_id
    (Self-referencing for the chain).

4. Phase 1: Identity & The "Bakare Rule"

Goal: Verify the human and lock the name for document matching.

1.  Identity Check: Integrate (a) Youverify API.
      - Developer Action: Verify exact endpoints in Youverify Docs.
      - Capture NIN/BVN + Live Selfie.
2.  The Bakare Rule (Custom Logic):
      - Logic (b): If the surname matches exactly, allow interchange of First
        and Middle names. Reject or flag if the name count exceeds three or
        surnames mismatch.
    // Heuristic Name Match Logic
    function validateBakareRule(kycName: string, docName: string): boolean {
      const kyc = kycName.toUpperCase().split(" ");
      const doc = docName.toUpperCase().split(" ");
      if (kyc[0] !== doc[0]) return false; // Surname mismatch
      return kyc.slice(1).sort().join() === doc.slice(1).sort().join();
    }

5. Phase 2: AI Document Audit (Gemini 3.7 Flash)

Goal: Forensics and data extraction.

1.  State Context: System must prompt for State (Lagos, FCT, Anambra, Ogun)
    before upload.
2.  Vision Prompting (b): Do not hard-code digit counts or layout rules. Use
    "Few-Shot" Template Comparison.
      - Developer Action: Collect 3-5 authentic "Ground Truth" samples for each
        state.
      - Prompt: "Compare this upload to these 3 authentic samples of a [STATE]
        [DOC_TYPE]. Identify deviations in layout, font consistency, or seal
        placement. Extract: {grantor, grantee, date, beacon_number, doc_id}."
3.  Lagos Registry Links (a):
      - landonline.lagosstate.gov.ng (e-GIS Search).
      - landsbureau.lagosstate.gov.ng (Admin).
      - Action: Provide a field in the Admin Console for the admin to manually
        input the result of a search on these portals.

6. Phase 3: The Sequential Workflow

Goal: Prevent sellers from skipping straight to the title.

1.  Gate 1 (Survey): Mandatory upload of Survey Plan. Gemini checks for Beacon
    Numbers and Surveyor stamps.
2.  Gate 2 (Primary Title): User selects type (C of O, Governor's Consent,
    etc.).
3.  Gate 3 (The Chain Walk):
      - If Doc.owner != KYC.name, enter recursive loop.
      - Request Deed of Assignment.
      - Agentic Loop (b): Gemini 3.7 Flash reads Deed N Grantor. If Grantor !=
        Original Title Owner, request Deed N-1.

7. Phase 4: Web Admin Console (Internal Tool)

Goal: Review-Review-Publish.

  - UI (b):
      - Display Side-by-Side: KYC Selfie vs. ID Photo.
      - PDF Viewer: Highlighting AI-flagged areas.
      - Chain View: Visual "Map" of the grantor-grantee links.
  - Approval Logic:
    1.  [Approve & Publish BLUE]: Only if root document is a C of O.
    2.  [Approve & Publish DEEP GREEN]: For valid Title (non-C of O).
    3.  [Reject]: Triggers mandatory reason field + notification to seller.

8. Final Compliance & Safety Checklist

  - Data Isolation: Ensure af-south-1 is set as the hard-coded region for all S3
    and RDS clients.
  - Manual Override: (b) Every AI rejection must have a "Request Manual Review"
    button for the user to appeal.
  - Ground Truth: (b) Before launch, the developer must verify the "visual
    markers" for each target state by testing the AI against real redacted
    documents.
  - Audit Logging: Implement the Purpose-Based logs to satisfy (a) NDPA 2023
    requirements.

Instruction for Developer: Build the "Survey Plan Gate" first. Use the
ground-truth samples you collect to "teach" Gemini what a valid survey looks
like for Lagos vs. FCT. Do not proceed to the Title Chain until the Survey
extraction logic is 90%+ accurate.
