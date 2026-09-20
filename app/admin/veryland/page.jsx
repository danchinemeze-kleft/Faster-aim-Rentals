'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function VerylandAdminPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedData, setSelectedData] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('status', 'flagged')
        .or('status.eq.pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      console.error('Load error:', err)
      alert('Error loading submissions')
    } finally {
      setLoading(false)
    }
  }

  async function loadSubmissionDetails(verificationId) {
    try {
      const { data: verification } = await supabase
        .from('verifications')
        .select('*')
        .eq('id', verificationId)
        .single()

      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('verification_id', verificationId)

      setSelectedData({
        verification,
        documents,
      })
    } catch (err) {
      console.error('Detail load error:', err)
    }
  }

  async function handleApprove(badgeTier) {
    if (!selectedId) return

    setApproving(true)
    try {
      const res = await fetch('/api/admin/veryland/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedId,
          badgeTier,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      alert(`✅ Approved with ${badgeTier} badge`)
      setSelectedId(null)
      setSelectedData(null)
      loadSubmissions()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setApproving(false)
    }
  }

  async function handleReject() {
    if (!selectedId || !rejectionReason.trim()) {
      alert('Please enter a rejection reason')
      return
    }

    setRejecting(true)
    try {
      const res = await fetch('/api/admin/veryland/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedId,
          reason: rejectionReason,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      alert('✅ Rejection recorded and user notified')
      setSelectedId(null)
      setSelectedData(null)
      setRejectionReason('')
      loadSubmissions()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setRejecting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading submissions...
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>🏛️ Veryland Admin Console</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' }}>
          {/* Submissions List */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Pending Review</h2>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {submissions.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                  ✅ No pending submissions
                </p>
              ) : (
                submissions.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedId(sub.id)
                      loadSubmissionDetails(sub.id)
                    }}
                    style={{
                      width: '100%',
                      padding: '15px',
                      marginBottom: '10px',
                      border: selectedId === sub.id ? '2px solid #0ea5e9' : '1px solid #ddd',
                      borderRadius: '8px',
                      background: selectedId === sub.id ? '#f0f9ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{sub.kyc_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {sub.status === 'flagged' && '🚩 Flagged'}
                      {sub.status === 'pending' && '⏳ Pending'}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          {selectedData ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* KYC Data */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>📋 KYC Data</h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                  <div><strong>Name:</strong> {selectedData.verification.kyc_name}</div>
                  <div><strong>Face Match:</strong> {(selectedData.verification.face_match_score * 100).toFixed(1)}%</div>
                  <div><strong>Status:</strong> {selectedData.verification.status}</div>
                  <div><strong>Manual Review:</strong> {selectedData.verification.requires_manual_review ? '🚩 Yes' : 'No'}</div>
                </div>
              </div>

              {/* Documents */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>📄 Documents</h3>
                {selectedData.documents.map(doc => (
                  <div key={doc.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', color: '#0ea5e9' }}>
                      {doc.doc_type}
                    </div>
                    {doc.extracted_data && (
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>
                        {doc.extracted_data.grantor && <div>📤 From: {doc.extracted_data.grantor}</div>}
                        {doc.extracted_data.grantee && <div>📥 To: {doc.extracted_data.grantee}</div>}
                        {doc.extracted_data.date && <div>📅 Date: {doc.extracted_data.date}</div>}
                      </div>
                    )}
                    {doc.is_forged && (
                      <div style={{ color: '#e74c3c', fontWeight: 700, fontSize: '0.85rem', marginTop: '6px' }}>
                        ⚠️ FORGED DETECTED
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Approval Buttons */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>✅ Approve</h3>
                <button
                  onClick={() => handleApprove('blue')}
                  disabled={approving}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '10px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: approving ? 'not-allowed' : 'pointer',
                    opacity: approving ? 0.7 : 1,
                  }}
                >
                  Blue Badge (C of O)
                </button>
                <button
                  onClick={() => handleApprove('deep_green')}
                  disabled={approving}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: approving ? 'not-allowed' : 'pointer',
                    opacity: approving ? 0.7 : 1,
                  }}
                >
                  Deep Green Badge (Title)
                </button>
              </div>

              {/* Rejection */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>❌ Reject</h3>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection (required)..."
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    marginBottom: '10px',
                    resize: 'none',
                  }}
                />
                <button
                  onClick={handleReject}
                  disabled={rejecting || !rejectionReason.trim()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: rejecting || !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                    opacity: rejecting || !rejectionReason.trim() ? 0.7 : 1,
                  }}
                >
                  {rejecting ? 'Rejecting...' : 'Reject & Notify User'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#999' }}>
              Select a submission to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
