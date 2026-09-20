'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const YOUVERIFY_BASE_URL = 'https://api.youverify.co/v2'

// Bakare Rule: Verify name matching
function isNameMatch(kycName, docName) {
  if (!kycName || !docName) return false

  const kyc = kycName.toUpperCase().trim().split(/\s+/).filter(Boolean)
  const doc = docName.toUpperCase().trim().split(/\s+/).filter(Boolean)

  // Check if surnames match first
  if (kyc[0] !== doc[0]) return false

  // Check if remaining names match regardless of order
  const kycOthers = kyc.slice(1).sort()
  const docOthers = doc.slice(1).sort()

  return JSON.stringify(kycOthers) === JSON.stringify(docOthers)
}

// Call Youverify API for biometric verification
async function verifyWithYouverify(nin, bvn, selfieBase64) {
  try {
    const response = await fetch(
      `${YOUVERIFY_BASE_URL}/biometrics/id-check`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.YOUVERIFY_API_KEY}`,
        },
        body: JSON.stringify({
          nin: nin || null,
          bvn: bvn || null,
          selfie: selfieBase64,
          client_id: process.env.YOUVERIFY_CLIENT_ID,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Youverify API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error('Youverify verification error:', err)
    throw new Error('Identity verification failed: ' + err.message)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { nin, bvn, selfieBase64 } = body

    if (!selfieBase64) {
      return Response.json(
        { error: 'Selfie image is required' },
        { status: 400 }
      )
    }

    if (!nin && !bvn) {
      return Response.json(
        { error: 'NIN or BVN is required' },
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

    const userId = session.user.id

    // Call Youverify
    const youverifyResult = await verifyWithYouverify(nin, bvn, selfieBase64)

    // Extract kyc name and face match score
    const kycName = youverifyResult.data?.idDocument?.name ||
                    youverifyResult.data?.firstName + ' ' + youverifyResult.data?.lastName ||
                    'Unknown'

    const faceMatchScore = youverifyResult.data?.faceMatchScore ||
                          youverifyResult.data?.biometric_score ||
                          0

    // Determine verification status based on face match threshold
    let status = 'approved'
    let requiresManualReview = false

    if (faceMatchScore < 0.65) {
      status = 'rejected'
    } else if (faceMatchScore >= 0.65 && faceMatchScore < 0.80) {
      status = 'flagged'
      requiresManualReview = true
    }

    // Store verification in DB
    const { data: verification, error } = await supabase
      .from('verifications')
      .insert([
        {
          user_id: userId,
          kyc_name: kycName,
          status,
          badge_tier: 'none',
          face_match_score: faceMatchScore,
          requires_manual_review: requiresManualReview,
        },
      ])
      .select()

    if (error) {
      console.error('DB error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Update user's Profiles table with kyc_verified flag
    await supabase
      .from('Profiles')
      .update({
        kyc_verified: true,
        kyc_name: kycName,
      })
      .eq('id', userId)

    return Response.json({
      success: true,
      verification: verification[0],
      kyc_name: kycName,
      face_match_score: faceMatchScore,
      status,
      requires_manual_review: requiresManualReview,
      message: status === 'approved'
        ? 'Identity verified! You can now upload documents.'
        : status === 'flagged'
        ? 'Identity verification flagged for manual review.'
        : 'Identity verification failed. Please try again.',
    })
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
