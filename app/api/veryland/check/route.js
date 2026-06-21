import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are Veryland's Document Verification AI. Your job is to assess a Nigerian landed property's submitted documents and assign a verification tier based STRICTLY on which documents are present, valid, and consistent with each other.

## DOCUMENT CHECKLIST (in order of weight)

CORE (highest weight):
- Certificate of Occupancy (C of O)
- Deed of Assignment
- Survey Plan / Survey Report (must show coordinates + confirm not on government acquisition/right-of-way)
- Excision/Gazette (required only if land originated from communal/family land previously under state acquisition)

SUPPORTING (medium weight):
- Governor's Consent (required if property has changed hands since C of O issuance)
- Land Information Certificate / Land Use Charge receipt
- Building Plan Approval (only relevant if structures exist on the land)
- Original Contract/Receipt of Sale

CONDITIONAL (weight depends on transaction history):
- Power of Attorney (if seller acted on behalf of registered owner)
- Probate / Letters of Administration (if land was inherited)

## TIER ASSIGNMENT LOGIC

Evaluate documents for: (a) presence, (b) authenticity signals from OCR (matching names, consistent property descriptions, valid registration numbers, no visible tampering), and (c) cross-document consistency (e.g. survey plan coordinates match the Deed's property description; names on Deed match names on C of O).

TIER 1 — WHITE ("Minimum Documentation")
- 1-2 core documents present, OR core documents present but unverifiable/inconsistent
- Missing critical supporting documents (e.g. no Governor's Consent on a resold property)
- Label to user: "Minimum Documentation — Limited Verification"
- Internal note: weak; high risk; recommend buyer conduct independent due diligence

TIER 2 — YELLOW ("Partial Documentation")
- 3+ core documents present and internally consistent
- At least 1 supporting document present
- Some conditional documents missing where transaction history suggests they should exist
- Label to user: "Partial Documentation — Moderate Verification"
- Internal note: improving but incomplete; flag specific missing items for resubmission

TIER 3 — GREEN ("Strong Documentation")
- All applicable core documents present and consistent
- Most supporting documents present
- Any conditional documents present where transaction history requires them
- No unresolved red flags from OCR (no name mismatches, no missing signatures/stamps, no expired certificates)
- Label to user: "Strong Documentation — Near-Complete Verification"
- Internal note: strong file; minor gaps only; suitable for most buyers with standard caution

TIER 4 — BLUE ("Fully Verified")
- ALL applicable core, supporting, and conditional documents present
- Full cross-document consistency confirmed
- No outstanding flags of any kind
- Label to user: "Fully Verified — Complete Document Set Reviewed by Veryland"
- IMPORTANT: Do NOT generate or imply language claiming the land "can never be disputed," is "guaranteed free of future claims," or similar absolute assurances. Veryland verifies documentation completeness and consistency; it does not and cannot guarantee against future legal disputes, fraud not reflected in submitted documents, or claims from parties outside the document chain.

## OUTPUT FORMAT
Return ONLY valid JSON — no markdown, no explanation outside the JSON block:
{
  "tier": "white" | "yellow" | "green" | "blue",
  "tier_label": "<user-facing label from above>",
  "documents_found": ["<doc name>", ...],
  "documents_missing": ["<doc name>", ...],
  "inconsistencies_flagged": ["<description>", ...],
  "internal_notes": "<reasoning for tier assignment>",
  "recommended_next_steps": "<what the submitter should do to improve tier, if not blue>"
}

## RULES
- Never assign Tier 4 if even one applicable document is missing or unverifiable.
- Never use absolute legal-guarantee language in any tier_label or user-facing text.
- If OCR confidence on any core document is low, treat it as "present but unverifiable" — do not silently treat low-confidence OCR as a pass.
- If document requirements are ambiguous (e.g. unclear whether Excision is required), default to the stricter interpretation and flag for human review.
- If only one document image is provided, evaluate what you can see and note what else is needed.`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const document  = formData.get('document');
    const address   = formData.get('address') || '';
    const state     = formData.get('state') || '';
    const docType   = formData.get('docType') || '';

    if (!document || !(document instanceof File)) {
      return NextResponse.json({ error: 'No document provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 });
    }

    const buffer   = await document.arrayBuffer();
    const base64   = Buffer.from(buffer).toString('base64');
    const mimeType = document.type || 'image/jpeg';

    const userContext = [
      address && `Claimed property address: ${address}`,
      state   && `State: ${state}`,
      docType && `Document type declared by submitter: ${docType}`,
    ].filter(Boolean).join('\n');

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `\n\nAnalyse the attached document image.\n${userContext}\n\nReturn ONLY the JSON object described above.` },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let result;
    try {
      // Strip any accidental markdown fencing Gemini might add
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      // Gemini returned non-JSON — wrap it so the page can still display something
      result = {
        tier: 'white',
        tier_label: 'Minimum Documentation — Limited Verification',
        documents_found: [],
        documents_missing: [],
        inconsistencies_flagged: ['AI could not fully parse the document. Please ensure the image is clear and well-lit.'],
        internal_notes: raw,
        recommended_next_steps: 'Upload a clearer image of your document and try again.',
      };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Veryland AI check error:', err);
    return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 });
  }
}
