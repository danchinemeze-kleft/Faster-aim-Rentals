import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const document = formData.get('document');
    const address  = formData.get('address') || '';
    const state    = formData.get('state') || '';

    if (!document || !(document instanceof File)) {
      return NextResponse.json({ error: 'No document provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ analysis: 'AI service is not configured on this server.' }, { status: 200 });
    }

    const buffer   = await document.arrayBuffer();
    const base64   = Buffer.from(buffer).toString('base64');
    const mimeType = document.type || 'image/jpeg';

    const prompt = `You are a Nigerian property document verification expert with 20 years of experience authenticating land and title documents.

Analyse this property document image carefully.

Claimed property address: ${address || 'Not provided'}
State: ${state || 'Not provided'}

Provide your assessment in this exact format:

**Document Type Identified:** (what kind of document this appears to be)

**Signs of Authenticity:**
(list observable signs — stamps, watermarks, government seals, proper formatting, signatures, official fonts)

**Red Flags / Concerns:**
(any inconsistencies, suspicious modifications, missing elements, font mismatches, or signs of tampering — write NONE if nothing suspicious)

**Overall Verdict:** LIKELY AUTHENTIC / UNCERTAIN / LIKELY FRAUDULENT

**Recommendation:**
(one or two sentences advising the buyer or tenant on what to do next)

Be honest and specific. If the image is unclear or you cannot read it well, say so.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          }],
          generationConfig: { maxOutputTokens: 900, temperature: 0.2 },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const analysis = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'AI analysis could not be completed for this document.';

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Veryland AI check error:', err);
    return NextResponse.json({ analysis: 'AI analysis failed. Please try again.' }, { status: 200 });
  }
}
