'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const GEMINI_SYSTEM_PROMPT = `You are the Veryland Forensic Land Auditor for Nigeria. You are analyzing a document for the state of [USER_SELECTED_STATE].

1. Check for 'Digital Forgery': Identify font inconsistencies, clone-stamp artifacts, or layer mismatches.
2. Extract Data: {grantor, grantee, date, beacon_number, document_id}.
3. State-Specific Rules:
   - Lagos: Verify 13-digit alpha-numeric code and e-CofO QR layout.
   - FCT: Search for AGIS barcode and 'Right of Occupancy' stamps.
4. Validation: If Survey Plan, confirm 'Red Seal' and 'Beacon Numbers' are present.

Respond in JSON format:
{
  "is_forged": boolean,
  "forgery_confidence": 0-1,
  "grantor": "string",
  "grantee": "string",
  "date": "YYYY-MM-DD",
  "beacon_number": "string",
  "document_id": "string",
  "state_validation_passed": boolean,
  "state_validation_notes": "string",
  "red_flags": ["string"],
  "overall_confidence": 0-1
}`

async function analyzeDocumentWithGemini(imageBase64, state, docType) {
  try {
    const model = client.getGenerativeModel({ model: 'gemini-3.7-flash' })

    const prompt = GEMINI_SYSTEM_PROMPT.replace('[USER_SELECTED_STATE]', state) +
      `\n\nDocument Type: ${docType}\nPlease analyze this document and provide assessment in JSON format.`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.split(',')[1] || imageBase64,
        },
      },
      { text: prompt },
    ])

    const responseText = result.response.text()

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response')
    }

    const analysisData = JSON.parse(jsonMatch[0])
    return analysisData
  } catch (err) {
    console.error('Gemini analysis error:', err)
    throw new Error('Document analysis failed: ' + err.message)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { documentBase64, docType, state, verificationId } = body

    if (!documentBase64) {
      return Response.json(
        { error: 'Document image is required' },
        { status: 400 }
      )
    }

    if (!docType || !['survey', 'c_of_o', 'deed', 'gazette'].includes(docType)) {
      return Response.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    if (!state) {
      return Response.json(
        { error: 'State is required' },
        { status: 400 }
      )
    }

    if (!verificationId) {
      return Response.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify this verification belongs to user
    const { data: verification } = await supabase
      .from('verifications')
      .select('id')
      .eq('id', verificationId)
      .eq('user_id', session.user.id)
      .single()

    if (!verification) {
      return Response.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    // Analyze document with Gemini
    const analysisData = await analyzeDocumentWithGemini(documentBase64, state, docType)

    // For now, store image as base64 in DB (in production, would upload to S3)
    // TODO: Upload to AWS S3 af-south-1 and store presigned URL
    const documentUrl = 'data:image/jpeg;base64,' + (documentBase64.split(',')[1] || documentBase64).slice(0, 100) + '...'

    // Store document in DB
    const { data: document, error } = await supabase
      .from('documents')
      .insert([
        {
          verification_id: verificationId,
          doc_type: docType,
          s3_url: documentUrl,
          extracted_data: analysisData,
          is_forged: analysisData.is_forged,
          state,
        },
      ])
      .select()

    if (error) {
      console.error('DB error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      document: document[0],
      analysis: analysisData,
      is_forged: analysisData.is_forged,
      confidence: analysisData.overall_confidence,
      red_flags: analysisData.red_flags || [],
    })
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
