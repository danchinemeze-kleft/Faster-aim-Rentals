import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Privileged client: service role key, never tied to a visitor's cookies
function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// 1) find out who is calling (anon key + cookies, verified with getUser)
// 2) check they are an admin in the "Profiles" table
async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }

  const admin = adminClient()
  const { data: profile } = await admin.from('Profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') {
    return { error: Response.json({ error: 'Admin access required' }, { status: 403 }) }
  }
  return { user, admin }
}

// List applications, with short-lived links to view their private documents
export async function GET(request) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { admin } = auth

  const status = new URL(request.url).searchParams.get('status') || 'pending'
  if (!['pending', 'verified', 'rejected', 'draft'].includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data: rows, error } = await admin
    .from('professionals')
    .select('*')
    .eq('verification_status', status)
    .order('updated_at', { ascending: true })
    .limit(50)
  if (error) return Response.json({ error: 'Could not load professionals' }, { status: 500 })

  const professionals = await Promise.all(
    rows.map(async (p) => {
      const { data: docs } = await admin
        .from('professional_documents')
        .select('id, doc_type, storage_path')
        .eq('professional_id', p.id)
        .order('created_at')
      const list = docs || []
      const { data: signed } = list.length
        ? await admin.storage.from('professional-docs').createSignedUrls(list.map((d) => d.storage_path), 600)
        : { data: [] }
      const { data: u } = await admin.auth.admin.getUserById(p.user_id)
      return {
        ...p,
        email: u?.user?.email || null,
        documents: list.map((d, i) => ({ id: d.id, doc_type: d.doc_type, url: signed?.[i]?.signedUrl || null })),
      }
    })
  )

  return Response.json({ professionals })
}

// Approve or reject a pending application
export async function POST(request) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { user, admin } = auth

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }
  const { professionalId, action } = body
  if (!professionalId || !['approve', 'reject'].includes(action)) {
    return Response.json({ error: 'professionalId and a valid action are required' }, { status: 400 })
  }

  const { data: p } = await admin.from('professionals').select('id, verification_status').eq('id', professionalId).maybeSingle()
  if (!p) return Response.json({ error: 'Professional not found' }, { status: 404 })
  if (p.verification_status !== 'pending') {
    return Response.json({ error: 'Only pending applications can be reviewed' }, { status: 409 })
  }

  let update
  if (action === 'approve') {
    const { data: docs } = await admin.from('professional_documents').select('doc_type').eq('professional_id', p.id)
    const types = new Set((docs || []).map((d) => d.doc_type))
    if (!types.has('government_id') || !types.has('certificate')) {
      return Response.json({ error: 'Required documents are missing' }, { status: 409 })
    }
    const months = Math.min(Math.max(parseInt(body.months, 10) || 12, 1), 24)
    const until = new Date()
    until.setMonth(until.getMonth() + months)
    update = {
      verification_status: 'verified',
      rejection_reason: null,
      verified_at: new Date().toISOString(),
      verified_until: until.toISOString(),
    }
  } else {
    const reason = String(body.reason || '').trim()
    if (reason.length < 5 || reason.length > 300) {
      return Response.json({ error: 'Give a reason of 5 to 300 characters' }, { status: 400 })
    }
    update = { verification_status: 'rejected', rejection_reason: reason }
  }

  const { error } = await admin.from('professionals').update(update).eq('id', p.id).eq('verification_status', 'pending')
  if (error) {
    console.error('Professional review error:', error)
    return Response.json({ error: 'Could not save the decision' }, { status: 500 })
  }

  // Audit log (non-fatal: adjust the columns to match your admin_logs table)
  const { error: logError } = await admin.from('admin_logs').insert([
    { admin_id: user.id, action: action === 'approve' ? 'professional_approval' : 'professional_rejection' },
  ])
  if (logError) console.error('Audit log error:', logError)

  return Response.json({ success: true })
}