'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [listings, setListings] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [actionMsg, setActionMsg] = useState('');

  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalLandlords: 0,
  });

  const [subscriptions, setSubscriptions] = useState([]);
  const [verylandSubmissions, setVerylandSubmissions] = useState([]);
  const [verylandBadgeSel, setVerylandBadgeSel] = useState({});
  const [verylandNotes, setVerylandNotes] = useState({});

  useEffect(() => {
    const saved = sessionStorage.getItem('mr_rent_admin');
    setTimeout(() => {
      if (saved === 'true') setAuthed(true);
      setCheckingSession(false);
    }, 0);
  }, []);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed]);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data: listingData, error: le } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: profileData, error: pe } = await supabase
        .from('Profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: subData } = await supabase
        .from('Subscription')
        .select('*')
        .order('expiry_date', { ascending: false });

      const { data: vData } = await supabase
        .from('veryland_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!le && listingData) {
        setListings(listingData);
        setStats(s => ({
          ...s,
          totalListings: listingData.length,
          activeListings: listingData.filter(l => l.status === 'approved').length,
          pendingListings: listingData.filter(l => l.status === 'pending' || !l.status).length,
        }));
      }

      if (!pe && profileData) {
        const landlordList = profileData.filter(p => p.role === 'landlord');
        setLandlords(landlordList);
        setStats(s => ({ ...s, totalLandlords: landlordList.length }));
      }

      if (subData) setSubscriptions(subData);
      if (vData) setVerylandSubmissions(vData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function approveVeryland(id) {
    const level = verylandBadgeSel[id] || 'green';
    const sub = verylandSubmissions.find(s => s.id === id);
    const newStatus = level === 'yellow' ? 'approved_partial' : 'approved_full';

    const { error } = await supabase
      .from('veryland_submissions')
      .update({ status: newStatus, badge_level: level, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      if (sub?.listing_id) {
        await supabase.from('listings').update({ veryland_badge: level }).eq('id', sub.listing_id);
      }
      setVerylandSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, badge_level: level } : s));
      showMsg('Veryland submission approved — badge awarded.');
    }
  }

  async function rejectVeryland(id) {
    const notes = verylandNotes[id] || '';
    const { error } = await supabase
      .from('veryland_submissions')
      .update({ status: 'rejected', admin_notes: notes, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setVerylandSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
      showMsg('Veryland submission rejected.');
    }
  }

  async function updateListingStatus(id, status) {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      showMsg(`Listing ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'}.`);
      setStats(s => ({
        ...s,
        activeListings: status === 'approved' ? s.activeListings + 1 : s.activeListings,
        pendingListings: s.pendingListings > 0 ? s.pendingListings - 1 : 0,
      }));
    }
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing permanently?')) return;
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (!error) {
      setListings(prev => prev.filter(l => l.id !== id));
      showMsg('Listing deleted.');
    }
  }

  async function toggleAvailability(id, current) {
    const newStatus = current === 'approved' ? 'unavailable' : 'approved';
    await updateListingStatus(id, newStatus);
  }

  function showMsg(msg) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setPwError('');
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput }),
      });
      if (res.ok) {
        sessionStorage.setItem('mr_rent_admin', 'true');
        setAuthed(true);
      } else {
        const data = await res.json();
        setPwError(data.error || 'Incorrect password.');
      }
    } catch {
      setPwError('Something went wrong. Try again.');
    }
  }

  function logout() {
    sessionStorage.removeItem('mr_rent_admin');
    setAuthed(false);
  }

  function formatPrice(price, period) {
    if (!price) return '—';
    const formatted = Number(price).toLocaleString('en-NG');
    return `₦${formatted}${period ? ' / ' + period : ''}`;
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function statusBadge(status) {
    const map = {
      approved: { bg: '#E1F5EE', color: '#0F6E56', label: 'Approved' },
      active: { bg: '#E1F5EE', color: '#0F6E56', label: 'Approved' },
      pending: { bg: '#FAEEDA', color: '#854F0B', label: 'Pending' },
      rejected: { bg: '#FCEBEB', color: '#A32D2D', label: 'Rejected' },
      unavailable: { bg: '#F1EFE8', color: '#5F5E5A', label: 'Unavailable' },
    };
    const s = map[status] || map['pending'];
    return (
      <span style={{
        background: s.bg, color: s.color,
        fontSize: 11, fontWeight: 500, padding: '2px 9px',
        borderRadius: 20, whiteSpace: 'nowrap'
      }}>{s.label}</span>
    );
  }

  if (checkingSession) return null;

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--page-bg)', fontFamily: 'DM Sans, sans-serif'
      }}>
        <div style={{
          background: '#111318', border: '0.5px solid #222',
          borderRadius: 16, padding: '2.5rem 2rem', width: '100%', maxWidth: 380
        }}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#0ef6cc', marginBottom: 4 }}>
              Mr. Rent
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>Admin Dashboard</div>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                Admin password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwInput}
                  onChange={e => setPwInput(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 44px 10px 14px', background: '#1a1d24',
                    border: pwError ? '1px solid #E24B4A' : '0.5px solid #333',
                    borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#555', fontSize: 16, padding: '2px 4px', lineHeight: 1,
                  }}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {pwError && <p style={{ color: '#E24B4A', fontSize: 12, marginTop: 4 }}>{pwError}</p>}
            </div>
            <button type="submit" style={{
              width: '100%', padding: '10px', background: '#0ef6cc',
              color: '#080a0f', border: 'none', borderRadius: 8,
              fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8
            }}>
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD
  const pendingListings = listings.filter(l => l.status === 'pending' || !l.status);
  const activeListings = listings.filter(l => l.status === 'approved');
  const otherListings = listings.filter(l => l.status === 'rejected' || l.status === 'unavailable');
  const tabListings = [...pendingListings, ...activeListings, ...otherListings];
  const verylandPending = verylandSubmissions.filter(s => s.status === 'submitted' || s.status === 'under_review');
  const now = new Date();
  const activeSubs = subscriptions.filter(s => new Date(s.expiry_date) > now);

  // Cross-reference subscription with profile for name + email
  const profileMap = Object.fromEntries(landlords.map(p => [p.id, p]));
  const enrichedSubs = subscriptions.map(s => ({
    ...s,
    full_name: profileMap[s.landlord_id]?.full_name || '—',
    email: profileMap[s.landlord_id]?.email || '—',
    phone: profileMap[s.landlord_id]?.phone || '—',
    isActive: new Date(s.expiry_date) > now,
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-1)' }}>

      {/* Top nav */}
      <div style={{
        background: '#111318', borderBottom: '0.5px solid #222',
        padding: '0 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 56
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#0ef6cc', fontWeight: 700, fontSize: 16 }}>Mr. Rent</span>
          <span style={{ color: '#444', fontSize: 14 }}>/</span>
          <span style={{ color: '#888', fontSize: 14 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {actionMsg && (
            <span style={{
              background: '#0F6E56', color: '#9FE1CB',
              fontSize: 12, padding: '4px 12px', borderRadius: 20
            }}>{actionMsg}</span>
          )}
          <button onClick={fetchAll} style={{
            background: 'transparent', border: '0.5px solid #333',
            color: '#888', borderRadius: 8, padding: '5px 12px',
            fontSize: 12, cursor: 'pointer'
          }}>↻ Refresh</button>
          <button onClick={logout} style={{
            background: 'transparent', border: '0.5px solid #333',
            color: '#888', borderRadius: 8, padding: '5px 12px',
            fontSize: 12, cursor: 'pointer'
          }}>Log out</button>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '2rem' }}>
          {[
            { label: 'Total listings', value: stats.totalListings, color: '#e8e8e8' },
            { label: 'Active listings', value: stats.activeListings, color: '#0ef6cc' },
            { label: 'Pending review', value: stats.pendingListings, color: stats.pendingListings > 0 ? '#EF9F27' : '#e8e8e8' },
            { label: 'Landlords', value: stats.totalLandlords, color: '#ff2d78' },
            { label: 'Active subscriptions', value: activeSubs.length, color: activeSubs.length > 0 ? '#0ef6cc' : '#555' },
            { label: 'Veryland queue', value: verylandPending.length, color: verylandPending.length > 0 ? '#3B82F6' : '#555' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#111318', border: '0.5px solid #222',
              borderRadius: 12, padding: '1rem 1.25rem'
            }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', borderBottom: '0.5px solid #222', paddingBottom: 12 }}>
          {[
            { key: 'listings', label: `Listings${pendingListings.length > 0 ? ` (${pendingListings.length} pending)` : ''}` },
            { key: 'landlords', label: `Landlords (${landlords.length})` },
            { key: 'subscriptions', label: `Subscriptions (${activeSubs.length} active)` },
            { key: 'veryland', label: `Veryland${verylandPending.length > 0 ? ` (${verylandPending.length} pending)` : ''}` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? '#0ef6cc' : 'transparent',
              color: activeTab === tab.key ? '#080a0f' : '#888',
              border: activeTab === tab.key ? 'none' : '0.5px solid #333',
              borderRadius: 8, padding: '6px 16px', fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400, cursor: 'pointer'
            }}>{tab.label}</button>
          ))}
        </div>

        {loading && (
          <div style={{ color: '#555', fontSize: 14, padding: '2rem 0' }}>Loading data from Supabase…</div>
        )}

        {/* LISTINGS TAB */}
        {!loading && activeTab === 'listings' && (
          <div>
            {tabListings.length === 0 && (
              <div style={{
                background: '#111318', border: '0.5px solid #222',
                borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#555'
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                <div style={{ fontSize: 14 }}>No listings yet. They will appear here once landlords submit them.</div>
              </div>
            )}
            {tabListings.map(listing => (
              <div key={listing.id} style={{
                background: '#111318',
                border: (!listing.status || listing.status === 'pending') ? '0.5px solid #BA7517' : '0.5px solid #222',
                borderRadius: 12, padding: '1.25rem', marginBottom: 10,
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#e8e8e8' }}>
                      {listing.title || 'Untitled listing'}
                    </span>
                    {statusBadge(listing.status)}
                    {(!listing.status || listing.status === 'pending') && (
                      <span style={{
                        background: '#FAEEDA', color: '#854F0B',
                        fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20
                      }}>Needs review</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>📍 {listing.location || '—'}{listing.city ? `, ${listing.city}` : ''}{listing.state ? `, ${listing.state}` : ''}</span>
                    <span>🏠 {listing.property_type || '—'}</span>
                    {listing.bedrooms && <span>🛏 {listing.bedrooms} bed</span>}
                    {listing.size && <span>📐 {listing.size}</span>}
                    <span>💰 {formatPrice(listing.price, listing.price_period)}</span>
                    <span>🕐 {timeAgo(listing.created_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <a href={`/listing/${listing.id}`} target="_blank" rel="noreferrer" style={{
                    background: 'transparent', color: '#888', border: '0.5px solid #333',
                    borderRadius: 8, padding: '5px 14px', fontSize: 12, cursor: 'pointer',
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
                  }}>👁 Preview</a>
                  {(!listing.status || listing.status === 'pending') && (
                    <>
                      <button onClick={() => updateListingStatus(listing.id, 'approved')} style={{
                        background: '#0ef6cc', color: '#080a0f', border: 'none',
                        borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}>✓ Approve</button>
                      <button onClick={() => updateListingStatus(listing.id, 'rejected')} style={{
                        background: 'transparent', color: '#E24B4A', border: '0.5px solid #E24B4A',
                        borderRadius: 8, padding: '5px 14px', fontSize: 12, cursor: 'pointer'
                      }}>✕ Reject</button>
                    </>
                  )}
                  {listing.status === 'approved' && (
                    <button onClick={() => toggleAvailability(listing.id, listing.status)} style={{
                      background: 'transparent', color: '#888', border: '0.5px solid #333',
                      borderRadius: 8, padding: '5px 14px', fontSize: 12, cursor: 'pointer'
                    }}>Mark unavailable</button>
                  )}
                  {listing.status === 'unavailable' && (
                    <button onClick={() => toggleAvailability(listing.id, listing.status)} style={{
                      background: 'transparent', color: '#0ef6cc', border: '0.5px solid #0ef6cc',
                      borderRadius: 8, padding: '5px 14px', fontSize: 12, cursor: 'pointer'
                    }}>Mark approved</button>
                  )}
                  <button onClick={() => deleteListing(listing.id)} style={{
                    background: 'transparent', color: '#555', border: '0.5px solid #333',
                    borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer'
                  }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LANDLORDS TAB */}
        {!loading && activeTab === 'landlords' && (
          <div>
            {landlords.length === 0 && (
              <div style={{
                background: '#111318', border: '0.5px solid #222',
                borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#555'
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                <div style={{ fontSize: 14 }}>No landlords have signed up yet.</div>
              </div>
            )}
            {landlords.map(lp => {
              const landlordListings = listings.filter(l => l.user_id === lp.id || l.landlord_id === lp.id);
              const activeSub = enrichedSubs.find(s => s.landlord_id === lp.id && s.isActive);
              return (
                <div key={lp.id} style={{
                  background: '#111318', border: '0.5px solid #222',
                  borderRadius: 12, padding: '1.25rem', marginBottom: 10,
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#e8e8e8', marginBottom: 4 }}>
                      {lp.full_name || lp.name || 'Unnamed landlord'}
                    </div>
                    <div style={{ fontSize: 13, color: '#888', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>✉️ {lp.email || '—'}</span>
                      <span>📞 {lp.phone || lp.whatsapp || '—'}</span>
                      <span>📅 Joined {timeAgo(lp.created_at)}</span>
                      <span>🏠 {landlordListings.length} listing{landlordListings.length !== 1 ? 's' : ''}</span>
                      {activeSub && <span style={{ color: '#0ef6cc' }}>💳 Expires {new Date(activeSub.expiry_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                  </div>
                  <span style={{
                    background: activeSub ? '#E1F5EE' : '#1a1d24',
                    color: activeSub ? '#0F6E56' : '#555',
                    fontSize: 11, fontWeight: 500, padding: '4px 10px',
                    borderRadius: 20, border: activeSub ? 'none' : '0.5px solid #333'
                  }}>
                    {activeSub ? '✓ Active Plan' : 'No subscription'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {!loading && activeTab === 'subscriptions' && (
          <div>
            {enrichedSubs.length === 0 && (
              <div style={{
                background: '#111318', border: '0.5px solid #222',
                borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#555'
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
                <div style={{ fontSize: 14 }}>No subscription records found.</div>
              </div>
            )}
            {enrichedSubs.map(s => (
              <div key={s.id} style={{
                background: '#111318',
                border: s.isActive ? '0.5px solid #0ef6cc44' : '0.5px solid #222',
                borderRadius: 12, padding: '1.25rem', marginBottom: 10,
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#e8e8e8', marginBottom: 4 }}>
                    {s.full_name}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>✉️ {s.email}</span>
                    <span>📞 {s.phone}</span>
                    <span>💳 Expires {new Date(s.expiry_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>📅 Subscribed {timeAgo(s.created_at)}</span>
                  </div>
                </div>
                <span style={{
                  background: s.isActive ? '#E1F5EE' : '#1a1d24',
                  color: s.isActive ? '#0F6E56' : '#555',
                  fontSize: 11, fontWeight: 500, padding: '4px 10px',
                  borderRadius: 20, border: s.isActive ? 'none' : '0.5px solid #333'
                }}>
                  {s.isActive ? '✓ Active' : '✕ Expired'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* VERYLAND TAB */}
        {!loading && activeTab === 'veryland' && (
          <div>
            {verylandSubmissions.length === 0 && (
              <div style={{
                background: '#111318', border: '0.5px solid #222',
                borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#555'
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏷️</div>
                <div style={{ fontSize: 14 }}>No Veryland submissions yet. They appear here when property owners submit documents.</div>
                <a href="/veryland" target="_blank" rel="noreferrer" style={{ color: '#0ef6cc', fontSize: 13, marginTop: 10, display: 'inline-block' }}>View Veryland page →</a>
              </div>
            )}
            {verylandSubmissions.map(sub => {
              const isPending = sub.status === 'submitted' || sub.status === 'under_review';
              const isApproved = sub.status === 'approved_partial' || sub.status === 'approved_full';
              const badgeColors = { white: '#d0d0d0', yellow: '#F59E0B', green: '#10B981', blue: '#3B82F6' };
              const badgeFill = badgeColors[sub.badge_level] || '#d0d0d0';
              const statusMap = {
                submitted: { bg: '#1a1a0a', color: '#EF9F27', label: 'Pending' },
                under_review: { bg: '#0a0f1a', color: '#3B82F6', label: 'Under Review' },
                approved_partial: { bg: '#0a1a10', color: '#10B981', label: 'Partial Approved' },
                approved_full: { bg: '#0a1a10', color: '#10B981', label: 'Fully Approved' },
                rejected: { bg: '#1a0a0a', color: '#E24B4A', label: 'Rejected' },
              };
              const st = statusMap[sub.status] || statusMap.submitted;

              return (
                <div key={sub.id} style={{
                  background: '#111318',
                  border: isPending ? '0.5px solid #3B82F644' : '0.5px solid #222',
                  borderRadius: 12, padding: '1.25rem', marginBottom: 12
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                          <circle cx="9" cy="9" r="9" fill={badgeFill} />
                          <polyline points="5,9 8,12 13,6" stroke={sub.badge_level === 'white' ? '#888' : '#fff'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#e8e8e8' }}>
                          {sub.owner_name || 'Unnamed submitter'}
                        </span>
                        <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 20 }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#888', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span>📍 {sub.property_address}{sub.state ? `, ${sub.state}` : ''}</span>
                        <span>✉️ {sub.owner_email || '—'}</span>
                        {sub.owner_phone && <span>📞 {sub.owner_phone}</span>}
                        <span>📄 {Array.isArray(sub.documents) ? sub.documents.length : 0} doc{Array.isArray(sub.documents) && sub.documents.length !== 1 ? 's' : ''}</span>
                        <span>🕐 {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                      </div>
                      {Array.isArray(sub.documents) && sub.documents.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {sub.documents.map((doc, i) => (
                            <a key={i} href={doc.url} target="_blank" rel="noreferrer" style={{
                              background: '#1a1d24', border: '0.5px solid #333', borderRadius: 6,
                              padding: '3px 10px', fontSize: 11, color: '#0ef6cc', textDecoration: 'none',
                              display: 'inline-flex', alignItems: 'center', gap: 4
                            }}>
                              📎 {doc.type?.replace(/_/g, ' ') || doc.name || `Doc ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                      {sub.additional_info && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#555', fontStyle: 'italic' }}>
                          Note: {sub.additional_info}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
                        <select
                          value={verylandBadgeSel[sub.id] || 'green'}
                          onChange={e => setVerylandBadgeSel(prev => ({ ...prev, [sub.id]: e.target.value }))}
                          style={{
                            background: '#1a1d24', border: '0.5px solid #333', borderRadius: 6,
                            color: '#e8e8e8', fontSize: 12, padding: '6px 10px', outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="white">⬜ White — Submitted</option>
                          <option value="yellow">🟡 Yellow — Partial</option>
                          <option value="green">🟢 Green — Verified</option>
                          <option value="blue">🔵 Blue — Premium</option>
                        </select>
                        <button onClick={() => approveVeryland(sub.id)} style={{
                          background: '#0ef6cc', color: '#080a0f', border: 'none',
                          borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                        }}>
                          ✓ Approve &amp; Award Badge
                        </button>
                        <div>
                          <input
                            placeholder="Rejection reason (optional)"
                            value={verylandNotes[sub.id] || ''}
                            onChange={e => setVerylandNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                            style={{
                              width: '100%', background: '#1a1d24', border: '0.5px solid #333',
                              borderRadius: 6, color: '#888', fontSize: 12, padding: '6px 10px',
                              outline: 'none', marginBottom: 4, boxSizing: 'border-box'
                            }}
                          />
                          <button onClick={() => rejectVeryland(sub.id)} style={{
                            background: 'transparent', color: '#E24B4A', border: '0.5px solid #E24B4A',
                            borderRadius: 8, padding: '5px 14px', fontSize: 12, cursor: 'pointer', width: '100%'
                          }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {isApproved && (
                      <div style={{ textAlign: 'right' }}>
                        <svg width="32" height="32" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="16" fill={badgeFill} />
                          <polyline points="9,16 14,21 23,11" stroke={sub.badge_level === 'white' ? '#888' : '#fff'} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Badge awarded</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}