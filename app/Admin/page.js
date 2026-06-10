'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'fasteraim2026';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  const [listings, setListings] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [actionMsg, setActionMsg] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalLandlords: 0,
  });

  useEffect(() => {
    const saved = sessionStorage.getItem('mr_rent_admin');
    if (saved === 'true') {
      setTimeout(() => setAuthed(true), 0);
    }
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

      if (!le && listingData) {
        setListings(listingData);
        setStats(s => ({
          ...s,
          totalListings: listingData.length,
          activeListings: listingData.filter(l => l.status === 'active').length,
          pendingListings: listingData.filter(l => l.status === 'pending' || !l.status).length,
        }));
      }

      if (!pe && profileData) {
        const landlords = profileData.filter(p => p.role === 'landlord');
        setLandlords(landlords);
        setStats(s => ({ ...s, totalLandlords: landlords.length }));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function updateListingStatus(id, status) {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      showMsg(`Listing ${status === 'active' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'}.`);
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
    const newStatus = current === 'active' ? 'unavailable' : 'active';
    await updateListingStatus(id, newStatus);
  }

  function showMsg(msg) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('mr_rent_admin', 'true');
      setAuthed(true);
      setPwError('');
    } else {
      setPwError('Incorrect password.');
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
      active: { bg: '#E1F5EE', color: '#0F6E56', label: 'Active' },
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

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#080a0f', fontFamily: 'DM Sans, sans-serif'
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
              <input
                type="password"
                value={pwInput}
                onChange={e => setPwInput(e.target.value)}
                placeholder="Enter password"
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', background: '#1a1d24',
                  border: pwError ? '1px solid #E24B4A' : '0.5px solid #333',
                  borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none'
                }}
              />
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
  const activeListings = listings.filter(l => l.status === 'active');
  const otherListings = listings.filter(l => l.status === 'rejected' || l.status === 'unavailable');

  const tabListings = activeTab === 'listings'
    ? [...pendingListings, ...activeListings, ...otherListings]
    : listings;

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'DM Sans, sans-serif', color: '#e8e8e8' }}>

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

        {/* Loading */}
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
                border: (!listing.status || listing.status === 'pending')
                  ? '0.5px solid #BA7517'
                  : '0.5px solid #222',
                borderRadius: 12, padding: '1.25rem',
                marginBottom: 10,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 16,
                alignItems: 'start'
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
                    <span>📍 {listing.location || '—'}{listing.state ? `, ${listing.state}` : ''}</span>
                    <span>🏠 {listing.property_type || '—'}</span>
                    {listing.bedrooms && <span>🛏 {listing.bedrooms} bed</span>}
                    <span>💰 {formatPrice(listing.price, listing.price_period)}</span>
                    <span>🕐 {timeAgo(listing.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {(!listing.status || listing.status === 'pending') && (
                    <>
                      <button onClick={() => updateListingStatus(listing.id, 'active')} style={{
                        background: '#0ef6cc', color: '#080a0f', border: 'none',
                        borderRadius: 8, padding: '5px 14px', fontSize: 12,
                        fontWeight: 600, cursor: 'pointer'
                      }}>Approve</button>
                      <button onClick={() => updateListingStatus(listing.id, 'rejected')} style={{
                        background: 'transparent', color: '#E24B4A',
                        border: '0.5px solid #E24B4A', borderRadius: 8,
                        padding: '5px 14px', fontSize: 12, cursor: 'pointer'
                      }}>Reject</button>
                    </>
                  )}
                  {listing.status === 'active' && (
                    <button onClick={() => toggleAvailability(listing.id, listing.status)} style={{
                      background: 'transparent', color: '#888',
                      border: '0.5px solid #333', borderRadius: 8,
                      padding: '5px 14px', fontSize: 12, cursor: 'pointer'
                    }}>Mark unavailable</button>
                  )}
                  {listing.status === 'unavailable' && (
                    <button onClick={() => toggleAvailability(listing.id, listing.status)} style={{
                      background: 'transparent', color: '#0ef6cc',
                      border: '0.5px solid #0ef6cc', borderRadius: 8,
                      padding: '5px 14px', fontSize: 12, cursor: 'pointer'
                    }}>Mark active</button>
                  )}
                  <button onClick={() => deleteListing(listing.id)} style={{
                    background: 'transparent', color: '#555',
                    border: '0.5px solid #333', borderRadius: 8,
                    padding: '5px 10px', fontSize: 12, cursor: 'pointer'
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
              const landlordListings = listings.filter(l =>
                l.user_id === lp.id || l.landlord_id === lp.id
              );
              return (
                <div key={lp.id} style={{
                  background: '#111318', border: '0.5px solid #222',
                  borderRadius: 12, padding: '1.25rem', marginBottom: 10,
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  gap: 16, alignItems: 'center'
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
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      background: lp.subscribed ? '#E1F5EE' : '#1a1d24',
                      color: lp.subscribed ? '#0F6E56' : '#555',
                      fontSize: 11, fontWeight: 500, padding: '4px 10px',
                      borderRadius: 20, border: lp.subscribed ? 'none' : '0.5px solid #333'
                    }}>
                      {lp.subscribed ? '✓ Subscribed' : 'No subscription'}
                    </span>
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