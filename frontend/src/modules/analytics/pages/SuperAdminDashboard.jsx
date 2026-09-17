import React, { useState, useEffect, useContext } from 'react';
import { analyticsService } from '../api/analyticsService';
import { AuthContext } from '../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassBackground from '../../../common/components/GlassBackground';
import GlassNavbar from '../../../common/components/GlassNavbar';
import './SuperAdminDashboard.css';

const PERIOD_OPTIONS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    if (user && (user.role !== 'SUPER_ADMIN' || user.email?.toLowerCase() !== 'sri741815@gmail.com')) {
      if (user.role === 'OFFICE') navigate('/dashboard');
      else navigate('/user-dashboard');
      return;
    }
    fetchStats(period);
  }, [user, period]);

  const fetchStats = async (selectedPeriod = period) => {
    try {
      setError('');
      if (!stats) setLoading(true);
      else setRefreshing(true);

      const data = await analyticsService.getStats(selectedPeriod);
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError('Unable to load analytics data from database. Please verify backend connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'gc-chip-pending';
      case 'ACCEPTED':
      case 'PICKUP_SCHEDULED':
        return 'gc-chip-scheduled';
      case 'COLLECTED':
      case 'RECEIVED_AT_OFFICE':
        return 'gc-chip-collected';
      case 'COMPLETED':
      case 'RECYCLED':
        return 'gc-chip-completed';
      case 'REJECTED':
      case 'CANCELLED':
        return 'gc-chip-cancelled';
      default:
        return 'gc-chip-pending';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.replace(/_/g, ' ');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN' || user.email?.toLowerCase() !== 'sri741815@gmail.com') {
    return null;
  }

  // Calculate percentage distribution for the lifecycle progress bar
  const totalReqs = stats?.totalRequests || 0;
  const pendingPct = totalReqs > 0 ? ((stats?.pendingRequests || 0) / totalReqs) * 100 : 0;
  const acceptedPct = totalReqs > 0 ? (((stats?.acceptedRequests || 0) + (stats?.scheduledRequests || 0)) / totalReqs) * 100 : 0;
  const collectedPct = totalReqs > 0 ? (((stats?.collectedRequests || 0) + (stats?.receivedAtOfficeRequests || 0)) / totalReqs) * 100 : 0;
  const completedPct = totalReqs > 0 ? ((stats?.completedPickups || 0) / totalReqs) * 100 : 0;
  const rejectedPct = totalReqs > 0 ? (((stats?.rejectedRequests || 0) + (stats?.cancelledRequests || 0)) / totalReqs) * 100 : 0;

  return (
    <div className="gc-admin-root">
      <GlassBackground />
      <GlassNavbar />

      <main className="gc-admin-container">
        {/* Header section */}
        <section className="gc-admin-header-section">
          <div>
            <div className="gc-header-badge-row">
              <span className="gc-badge-portal" style={{ color: '#00d4ff', borderColor: 'rgba(0, 212, 255, 0.3)', background: 'rgba(0, 212, 255, 0.1)' }}>
                🛡️ Super Admin Console
              </span>
              <span className="gc-badge-live">
                <span className="gc-sys-dot online" style={{ margin: 0 }} /> Live Telemetry
              </span>
            </div>
            <h1 className="gc-admin-heading">Super Admin Analytics</h1>
            <p className="gc-admin-subheading">
              Real-time platform telemetry computed directly from the MySQL database across all collection hubs, recyclers, and workflows.
            </p>
          </div>

          <div className="gc-admin-quick-actions">
            <button
              type="button"
              className="gc-btn-secondary gc-refresh-btn"
              onClick={() => fetchStats(period)}
              disabled={loading || refreshing}
              title="Refresh database telemetry"
            >
              <span className={`gc-refresh-icon ${refreshing ? 'spinning' : ''}`}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh Analytics'}
            </button>
            <button
              type="button"
              className="gc-btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              🏢 Manage Office Registry
            </button>
          </div>
        </section>

        {/* Date Period Filter Bar */}
        <section className="gc-filter-bar gc-glass-card">
          <div className="gc-filter-label">
            <span>📅 Filter Period:</span>
          </div>
          <div className="gc-filter-pills">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`gc-filter-pill ${period === opt.id ? 'active' : ''}`}
                onClick={() => handlePeriodChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="gc-form-error-banner" style={{ marginBottom: '24px' }}>
            <span>⚠️ {error}</span>
            <button type="button" className="gc-btn-secondary" onClick={() => fetchStats(period)}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="gc-history-loading" style={{ minHeight: '350px' }}>
            <div className="gc-spinner" />
            <span>Querying database aggregation analytics…</span>
          </div>
        ) : stats ? (
          <>
            {/* ══════════════════════════════════════════════════════════
                ROW 1: Primary Platform Metrics (4 Cards)
                ══════════════════════════════════════════════════════════ */}
            <h2 className="gc-section-title">Core Platform KPI Metrics</h2>
            <section className="gc-admin-stats-grid">
              {/* CARD 1: Total Registered Users */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff' }}>
                  👥
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num">{stats.totalUsers ?? 0}</span>
                  <span className="gc-admin-stat-label">Total Registered Users</span>
                  <span className="gc-admin-stat-desc">
                    {stats.registeredIndividuals ?? 0} Recyclers • {stats.officeStaffUsers ?? 0} Office Staff
                  </span>
                </div>
              </div>

              {/* CARD 2: Total Pickup Requests */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(255, 179, 0, 0.15)', color: '#ffca28' }}>
                  📦
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num">{stats.totalRequests ?? stats.totalPickupRequests ?? 0}</span>
                  <span className="gc-admin-stat-label">Total Pickup Requests</span>
                  <span className="gc-admin-stat-desc">All e-waste requests submitted by users</span>
                </div>
              </div>

              {/* CARD 3: Completed Pickups */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00ff88' }}>
                  ✅
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num">{stats.completedPickups ?? 0}</span>
                  <span className="gc-admin-stat-label">Completed Pickups</span>
                  <span className="gc-admin-stat-desc">
                    {stats.recycledRequests ?? 0} Recycled • {stats.completedRequests ?? 0} Completed
                  </span>
                </div>
              </div>

              {/* CARD 4: Total Recycled E-Waste Items (Hero Card) */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card gc-admin-hero-stat">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(0, 201, 103, 0.25)', color: '#00ff88' }}>
                  ♻️
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num" style={{ color: '#00ff88' }}>
                    {stats.totalEwasteItemsCollected ?? stats.totalRecycledItems ?? 0}
                  </span>
                  <span className="gc-admin-stat-label">E-Waste Items Saved</span>
                  <span className="gc-admin-stat-desc">Sum of item quantities diverted from landfills</span>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                ROW 2: Operational Hub & Reward Metrics (4 Cards)
                ══════════════════════════════════════════════════════════ */}
            <section className="gc-admin-stats-grid">
              {/* CARD 5: Total Collection Offices */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(179, 136, 255, 0.15)', color: '#b388ff' }}>
                  🏢
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num">{stats.totalCollectionOffices ?? 0}</span>
                  <span className="gc-admin-stat-label">Collection Offices</span>
                  <span className="gc-admin-stat-desc">
                    {stats.activeOffices ?? 0} Active Hubs • {stats.inactiveOffices ?? 0} Inactive
                  </span>
                </div>
              </div>

              {/* CARD 6: Pending Pickup Requests */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(255, 179, 0, 0.15)', color: '#ffb300' }}>
                  ⏳
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num" style={{ color: '#ffca28' }}>
                    {stats.pendingRequests ?? 0}
                  </span>
                  <span className="gc-admin-stat-label">Pending Requests</span>
                  <span className="gc-admin-stat-desc">Awaiting office review and verification</span>
                </div>
              </div>

              {/* CARD 7: Accepted Pickup Requests */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff' }}>
                  🚚
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num" style={{ color: '#00d4ff' }}>
                    {stats.acceptedRequests ?? 0}
                  </span>
                  <span className="gc-admin-stat-label">Accepted Requests</span>
                  <span className="gc-admin-stat-desc">
                    Approved by hubs • {stats.scheduledRequests ?? 0} In Transit
                  </span>
                </div>
              </div>

              {/* CARD 8: Total Reward Points Distributed */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700' }}>
                  🏆
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num" style={{ color: '#ffd700' }}>
                    {stats.totalRewardPointsDistributed ?? 0}
                  </span>
                  <span className="gc-admin-stat-label">Reward Points Distributed</span>
                  <span className="gc-admin-stat-desc">Granted to users for circular recycling</span>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                MODULE 10: Detailed Request Lifecycle Overview
                ══════════════════════════════════════════════════════════ */}
            <section className="gc-glass-card gc-lifecycle-panel">
              <div className="gc-lifecycle-header">
                <div>
                  <h3 className="gc-panel-title">📊 Pickup Request Lifecycle Overview</h3>
                  <p className="gc-panel-desc">Real-time breakdown of all e-waste collection requests across operational lifecycle states.</p>
                </div>
                <div className="gc-lifecycle-summary-badge">
                  Total Managed: <strong>{totalReqs}</strong>
                </div>
              </div>

              {/* Visual Distribution Progress Bar */}
              {totalReqs > 0 ? (
                <div className="gc-progress-wrapper">
                  <div className="gc-multi-progress-bar">
                    {pendingPct > 0 && <div className="gc-bar-segment pending" style={{ width: `${pendingPct}%` }} title={`Pending: ${stats.pendingRequests || 0} (${pendingPct.toFixed(1)}%)`} />}
                    {acceptedPct > 0 && <div className="gc-bar-segment accepted" style={{ width: `${acceptedPct}%` }} title={`Accepted & Scheduled: ${(stats.acceptedRequests || 0) + (stats.scheduledRequests || 0)} (${acceptedPct.toFixed(1)}%)`} />}
                    {collectedPct > 0 && <div className="gc-bar-segment collected" style={{ width: `${collectedPct}%` }} title={`Collected & At Office: ${(stats.collectedRequests || 0) + (stats.receivedAtOfficeRequests || 0)} (${collectedPct.toFixed(1)}%)`} />}
                    {completedPct > 0 && <div className="gc-bar-segment completed" style={{ width: `${completedPct}%` }} title={`Completed & Recycled: ${stats.completedPickups || 0} (${completedPct.toFixed(1)}%)`} />}
                    {rejectedPct > 0 && <div className="gc-bar-segment cancelled" style={{ width: `${rejectedPct}%` }} title={`Rejected & Cancelled: ${(stats.rejectedRequests || 0) + (stats.cancelledRequests || 0)} (${rejectedPct.toFixed(1)}%)`} />}
                  </div>
                  <div className="gc-progress-legend">
                    <span className="gc-legend-item"><span className="gc-legend-dot pending" /> Pending ({pendingPct.toFixed(0)}%)</span>
                    <span className="gc-legend-item"><span className="gc-legend-dot accepted" /> Accepted/Transit ({acceptedPct.toFixed(0)}%)</span>
                    <span className="gc-legend-item"><span className="gc-legend-dot collected" /> Collected/At Hub ({collectedPct.toFixed(0)}%)</span>
                    <span className="gc-legend-item"><span className="gc-legend-dot completed" /> Completed/Recycled ({completedPct.toFixed(0)}%)</span>
                    <span className="gc-legend-item"><span className="gc-legend-dot cancelled" /> Rejected/Cancelled ({rejectedPct.toFixed(0)}%)</span>
                  </div>
                </div>
              ) : (
                <div className="gc-empty-box">No requests recorded for this time period.</div>
              )}

              {/* Status Breakdown Grid */}
              <div className="gc-status-pills-grid">
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Total Requests</span>
                  <span className="gc-pill-val">{stats.totalRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Pending</span>
                  <span className="gc-pill-val text-amber">{stats.pendingRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Accepted</span>
                  <span className="gc-pill-val text-blue">{stats.acceptedRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Pickup Scheduled</span>
                  <span className="gc-pill-val text-blue">{stats.scheduledRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Collected</span>
                  <span className="gc-pill-val text-teal">{stats.collectedRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Received at Office</span>
                  <span className="gc-pill-val text-teal">{stats.receivedAtOfficeRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Recycled</span>
                  <span className="gc-pill-val text-green">{stats.recycledRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Completed</span>
                  <span className="gc-pill-val text-green">{stats.completedRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Rejected</span>
                  <span className="gc-pill-val text-red">{stats.rejectedRequests ?? 0}</span>
                </div>
                <div className="gc-status-pill-card">
                  <span className="gc-pill-label">Cancelled</span>
                  <span className="gc-pill-val text-red">{stats.cancelledRequests ?? 0}</span>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                MODULE 11: E-Waste Category Analytics Overview
                ══════════════════════════════════════════════════════════ */}
            <section className="gc-glass-card gc-category-panel">
              <div className="gc-category-header">
                <div>
                  <h3 className="gc-panel-title">📱 E-Waste Category Distribution</h3>
                  <p className="gc-panel-desc">Aggregated breakdown of e-waste requests and unit quantities grouped by device category.</p>
                </div>
              </div>

              {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                <div className="gc-category-grid">
                  {stats.categoryBreakdown.map((cat, idx) => {
                    const catQty = cat.totalQuantity || 0;
                    const catCount = cat.count || 0;
                    const totalQtyAll = stats.totalEwasteItemsCollected || 1;
                    const pctOfTotal = ((catQty / totalQtyAll) * 100).toFixed(1);

                    return (
                      <div key={idx} className="gc-category-card">
                        <div className="gc-cat-card-header">
                          <span className="gc-cat-icon">
                            {cat.category.toLowerCase().includes('phone') ? '📱' :
                             cat.category.toLowerCase().includes('laptop') ? '💻' :
                             cat.category.toLowerCase().includes('batter') ? '🔋' :
                             cat.category.toLowerCase().includes('tv') || cat.category.toLowerCase().includes('television') ? '📺' :
                             cat.category.toLowerCase().includes('charger') ? '🔌' :
                             cat.category.toLowerCase().includes('computer') ? '🖥️' : '⚙️'}
                          </span>
                          <span className="gc-cat-title">{cat.category}</span>
                        </div>
                        <div className="gc-cat-stats-row">
                          <div className="gc-cat-stat">
                            <span className="gc-cat-val">{catCount}</span>
                            <span className="gc-cat-lbl">Requests</span>
                          </div>
                          <div className="gc-cat-divider" />
                          <div className="gc-cat-stat">
                            <span className="gc-cat-val text-green">{catQty}</span>
                            <span className="gc-cat-lbl">Units Saved</span>
                          </div>
                        </div>
                        <div className="gc-cat-bar-bg">
                          <div className="gc-cat-bar-fill" style={{ width: `${Math.min(parseFloat(pctOfTotal), 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="gc-empty-box">No device category data found for this period.</div>
              )}
            </section>

            {/* ══════════════════════════════════════════════════════════
                Recent Submissions & System Infrastructure Panels
                ══════════════════════════════════════════════════════════ */}
            <section className="gc-admin-panels-grid">
              {/* Recent Requests Stream */}
              <div className="gc-glass-card gc-admin-panel">
                <div className="gc-panel-head-flex">
                  <div>
                    <h3 className="gc-panel-title">🛰️ Recent E-Waste Submissions</h3>
                    <p className="gc-panel-desc">Latest requests submitted by registered recyclers across all hubs.</p>
                  </div>
                </div>

                {stats.recentRequests && stats.recentRequests.length > 0 ? (
                  <div className="gc-recent-table-wrapper">
                    <table className="gc-recent-table">
                      <thead>
                        <tr>
                          <th>Item / Device</th>
                          <th>Qty</th>
                          <th>Citizen</th>
                          <th>Office</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentRequests.map((req) => (
                          <tr key={req.id}>
                            <td className="gc-td-device">
                              <strong>{req.deviceName}</strong>
                              <span className="gc-td-sub">{req.category || 'General'}</span>
                            </td>
                            <td><span className="gc-qty-badge">{req.quantity}</span></td>
                            <td className="gc-td-user">{req.userName || req.userEmail || 'Recycler'}</td>
                            <td className="gc-td-office">{req.officeName || 'Unassigned'}</td>
                            <td>
                              <span className={`gc-chip ${getStatusBadgeClass(req.status)}`}>
                                {formatStatus(req.status)}
                              </span>
                            </td>
                            <td className="gc-td-date">{formatDate(req.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="gc-empty-box">No recent e-waste requests found.</div>
                )}
              </div>

              {/* System Infrastructure Health & Shortcuts */}
              <div className="gc-glass-card gc-admin-panel">
                <h3 className="gc-panel-title">⚡ Platform Operations & Services</h3>
                <p className="gc-panel-desc">Real-time health status of Green Circuit backend services.</p>

                <div className="gc-sys-health-list">
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">MySQL Core Relational Engine</span>
                    <span className="gc-chip gc-chip-collected">Connected</span>
                  </div>
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">JWT Authentication & Super Admin Gate</span>
                    <span className="gc-chip gc-chip-collected">Enforced</span>
                  </div>
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">Collection Hubs & Geospatial API</span>
                    <span className="gc-chip gc-chip-collected">Active</span>
                  </div>
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">Rewards & Circular Economy Engine</span>
                    <span className="gc-chip gc-chip-collected">Synced</span>
                  </div>
                </div>

                <div className="gc-admin-shortcuts" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="gc-btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '14px 18px', width: '100%' }}
                    onClick={() => navigate('/dashboard')}
                  >
                    🏢 Open Collection Office Registry
                  </button>
                  <button
                    type="button"
                    className="gc-btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '14px 18px', width: '100%' }}
                    onClick={() => fetchStats(period)}
                    disabled={refreshing}
                  >
                    🔄 Refresh Real-time Telemetry
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
