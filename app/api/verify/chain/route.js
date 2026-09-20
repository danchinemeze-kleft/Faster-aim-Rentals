'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function validateChainRecursively(
  supabase,
  verificationId,
  currentDeedId,
  targetName,
  primaryOwner,
  depth = 0,
  maxDepth = 10
) {
  if (depth > maxDepth) {
    return {
      complete: false,
      reason: 'Chain depth exceeded maximum',
      depth,
      flagged_for_admin: true,
    }
  }

  // Get current deed
  const { data: currentDeed } = await supabase
    .from('documents')
    .select('extracted_data')
    .eq('id', currentDeedId)
    .eq('verification_id', verificationId)
    .single()

  if (!currentDeed) {
    return {
      complete: false,
      reason: 'Deed not found',
      depth,
    }
  }

  const extractedData = currentDeed.extracted_data || {}
  const grantee = extractedData.grantee || ''
  const grantor = extractedData.grantor || ''

  // Check if chain is complete
  if (
    grantee.toUpperCase() === targetName.toUpperCase() &&
    grantor.toUpperCase() === primaryOwner.toUpperCase()
  ) {
    return {
      complete: true,
      reason: 'Chain of title validated',
      depth,
      flagged_for_admin: false,
    }
  }

  // If not complete, we need to find the previous deed
  // The grantor of current deed should be the grantee of the previous deed
  return {
    complete: false,
    reason: 'Chain incomplete - need previous deed',
    next_required: {
      from: grantor,
      to: grantee,
    },
    depth,
    flagged_for_admin: depth >= 5,
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { verificationId, action, deedId } = body

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

    // Verify ownership
    const { data: verification } = await supabase
      .from('verifications')
      .select('id, kyc_name')
      .eq('id', verificationId)
      .eq('user_id', session.user.id)
      .single()

    if (!verification) {
      return Response.json(
        { error: 'Verification not found' },
        { status: 404 }
      )
    }

    const kycName = verification.kyc_name

    // ACTION: Check primary title
    if (action === 'check_primary_title') {
      const { primaryTitleId } = body

      if (!primaryTitleId) {
        return Response.json(
          { error: 'Primary title ID required' },
          { status: 400 }
        )
      }

      const { data: primaryDoc } = await supabase
        .from('documents')
        .select('extracted_data, doc_type')
        .eq('id', primaryTitleId)
        .eq('verification_id', verificationId)
        .single()

      if (!primaryDoc) {
        return Response.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }

      const owner = primaryDoc.extracted_data?.grantee ||
                   primaryDoc.extracted_data?.owner ||
                   ''

      const docType = primaryDoc.doc_type
      const ownerMatches = owner.toUpperCase() === kycName.toUpperCase()

      if (ownerMatches) {
        return Response.json({
          success: true,
          chain_status: 'primary_title_validated',
          owner,
          next_step: 'complete',
          message: 'Primary title owner matches your KYC. Chain of title is validated!',
        })
      } else {
        return Response.json({
          success: true,
          chain_status: 'needs_deed_chain',
          primary_owner: owner,
          next_step: 'upload_deed',
          message: `Primary title is owned by ${owner}, not your KYC name (${kycName}). Please upload Deed of Assignment.`,
        })
      }
    }

    // ACTION: Validate deed chain
    if (action === 'validate_chain') {
      if (!deedId) {
        return Response.json(
          { error: 'Deed ID required' },
          { status: 400 }
        )
      }

      // Get primary title for reference
      const { data: primaryDocs } = await supabase
        .from('documents')
        .select('id, extracted_data')
        .eq('verification_id', verificationId)
        .eq('doc_type', 'c_of_o')
        .limit(1)

      const primaryOwner = primaryDocs?.[0]?.extracted_data?.grantee ||
                          primaryDocs?.[0]?.extracted_data?.owner ||
                          ''

      const chainResult = await validateChainRecursively(
        supabase,
        verificationId,
        deedId,
        kycName,
        primaryOwner,
        0
      )

      // Store chain validation result
      if (chainResult.complete) {
        await supabase
          .from('verifications')
          .update({ status: 'approved' })
          .eq('id', verificationId)
      } else if (chainResult.flagged_for_admin) {
        await supabase
          .from('verifications')
          .update({ status: 'flagged' })
          .eq('id', verificationId)
      }

      return Response.json({
        success: true,
        chain_complete: chainResult.complete,
        chain_depth: chainResult.depth,
        flagged_for_admin: chainResult.flagged_for_admin,
        reason: chainResult.reason,
        next_required: chainResult.next_required || null,
        message: chainResult.complete
          ? 'Chain of title validated successfully!'
          : chainResult.flagged_for_admin
          ? 'Chain is complex. Flagged for admin review.'
          : 'Chain incomplete. Please upload the next deed.',
      })
    }

    return Response.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
