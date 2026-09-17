import React, { useState, useEffect, useContext } from 'react';
import { agentService } from '../api/agentService';
import { AuthContext } from '../../user/context/AuthContext';
import GlassBackground from '../../../common/components/GlassBackground';
import GlassNavbar from '../../../common/components/GlassNavbar';
import AgentRequestDetailsModal from '../components/AgentRequestDetailsModal';
import './AgentDashboard.css';

const AgentDashboard = () => {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    assignedRequests: 0,
    pendingPickups: 0,
    todayPickups: 0,
    completedPickups: 0,
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setError('');
    if (!profile) setLoading(true);
    else setRefreshing(true);

    try {
      const [profileData, statsData, requestsData] = await Promise.all([
        agentService.getAgentProfile().catch(() => null),
        agentService.getAgentDashboard().catch(() => ({ assignedRequests: 0, pendingPickups: 0, todayPickups: 0, completedPickups: 0 })),
        agentService.getAgentRequests().catch(() => []),
      ]);

      if (profileData) setProfile(profileData);
      if (statsData) setStats(statsData);
      if (Array.isArray(requestsData)) setRequests(requestsData);
    } catch (err) {
      console.error('Failed to load agent dashboard:', err);
      setError('Unable to load assigned pickup operations. Please verify connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'PENDING': return 'gc-chip-pending';
      case 'ACCEPTED':
      case 'ASSIGNED':
      case 'PICKUP_SCHEDULED': return 'gc-chip-scheduled';
      case 'ON_THE_WAY': return 'gc-chip-ontheway';
      case 'COLLECTED': return 'gc-chip-collected';
      case 'RECEIVED_AT_OFFICE': return 'gc-chip-received';
      case 'RECYCLED':
      case 'COMPLETED': return 'gc-chip-completed';
      case 'REJECTED':
      case 'CANCELLED': return 'gc-chip-cancelled';
      default: return 'gc-chip-pending';
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchStatus;

    const matchUser = r.user?.name?.toLowerCase().includes(query) || r.user?.email?.toLowerCase().includes(query) || r.user?.phoneNumber?.includes(query);
    const matchDevice = r.deviceName?.toLowerCase().includes(query) || r.deviceCategory?.toLowerCase().includes(query);
    const matchLocation = r.userLocation?.toLowerCase().includes(query);
    const matchId = String(r.id).includes(query);

    return matchStatus && (matchUser || matchDevice || matchLocation || matchId);
  });

  return (
    <div className="gc-agent-dash-root">
      <GlassBackground />
      <GlassNavbar />

      <main className="gc-agent-dash-container">
        {/* Header section */}
        <section className="gc-agent-header-section">
          <div>
            <div className="gc-header-badge-row">
              <span className="gc-badge-portal" style={{ color: '#00e676', borderColor: 'rgba(0, 230, 118, 0.3)', background: 'rgba(0, 230, 118, 0.1)' }}>
                🚚 Field Logistics Agent Console
              </span>
              {profile?.employeeId && (
                <span className="gc-agent-badge-id">🆔 {profile.employeeId}</span>
              )}
            </div>
            <h1 className="gc-agent-heading">
              Welcome, <span className="gc-agent-name-highlight">{profile?.fullName || user?.name}</span>
            </h1>
            <p className="gc-agent-subheading">
              {profile?.officeName ? `Assigned to ${profile.officeName}` : 'Green Circuit Logistics Hub'} • Doorstep e-waste collection & verification portal.
            </p>
          </div>

          <div className="gc-agent-header-actions">
            <button
              type="button"
              className="gc-btn-secondary"
              onClick={loadDashboardData}
              disabled={loading || refreshing}
            >
              🔄 {refreshing ? 'Refreshing…' : 'Refresh Telemetry'}
            </button>
          </div>
        </section>

        {error && (
          <div className="gc-form-error-banner" style={{ marginBottom: '22px' }}>
            <span>⚠️ {error}</span>
            <button type="button" className="gc-btn-secondary" onClick={loadDashboardData}>Retry</button>
          </div>
        )}

        {/* ── 4 KPI Metric Cards ── */}
        <section className="gc-agent-stats-grid">
          {/* Card 1: Assigned Requests */}
          <div className="gc-glass-card gc-agent-stat-card">
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff' }}>
              📋
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number">{stats.assignedRequests}</span>
              <span className="gc-stat-title">Assigned Pickups</span>
              <span className="gc-stat-desc">Total delegated to you</span>
            </div>
          </div>

          {/* Card 2: Pending Pickups */}
          <div className="gc-glass-card gc-agent-stat-card">
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(255, 179, 0, 0.15)', color: '#ffca28' }}>
              ⏳
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number" style={{ color: '#ffca28' }}>{stats.pendingPickups}</span>
              <span className="gc-stat-title">Pending Pickups</span>
              <span className="gc-stat-desc">Scheduled & on the way</span>
            </div>
          </div>

          {/* Card 3: Today's Pickups */}
          <div className="gc-glass-card gc-agent-stat-card gc-agent-today-card">
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(0, 230, 118, 0.2)', color: '#00ff88' }}>
              📅
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number" style={{ color: '#00ff88' }}>{stats.todayPickups}</span>
              <span className="gc-stat-title">Today's Schedule</span>
              <span className="gc-stat-desc">Target collections for today</span>
            </div>
          </div>

          {/* Card 4: Completed Pickups */}
          <div className="gc-glass-card gc-agent-stat-card">
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(179, 136, 255, 0.15)', color: '#b388ff' }}>
              🏆
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number" style={{ color: '#b388ff' }}>{stats.completedPickups}</span>
              <span className="gc-stat-title">Completed Collections</span>
              <span className="gc-stat-desc">Successfully processed</span>
            </div>
          </div>
        </section>

        {/* ── Assigned Requests Section ── */}
        <section className="gc-glass-card gc-agent-requests-panel">
          <div className="gc-agent-panel-header">
            <div>
              <h3 className="gc-panel-title">📦 Assigned E-Waste Pickup Requests</h3>
              <p className="gc-panel-desc">
                Review citizen contact details, inspect uploaded equipment photos, navigate with GPS, and update collection status.
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="gc-agent-controls-bar">
            <div className="gc-search-box" style={{ maxWidth: '340px' }}>
              <span className="gc-search-icon">🔍</span>
              <input
                type="text"
                className="gc-search-input"
                placeholder="Search citizen, device, address, or REQ ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="gc-search-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <div className="gc-agent-filter-pills">
              {['ALL', 'PICKUP_SCHEDULED', 'ON_THE_WAY', 'COLLECTED', 'RECEIVED_AT_OFFICE', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`gc-filter-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Requests Table */}
          {loading ? (
            <div className="gc-history-loading" style={{ minHeight: '260px' }}>
              <div className="gc-spinner" />
              <span>Fetching assigned collection tasks…</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="gc-agent-empty-box">
              <div className="gc-empty-icon">🚚</div>
              <h4>No Assigned Pickups Found</h4>
              <p>
                {requests.length === 0
                  ? 'You currently have no assigned collection requests from your hub coordinator.'
                  : 'No pickup requests matched your active filters.'}
              </p>
            </div>
          ) : (
            <div className="gc-agent-table-wrapper">
              <table className="gc-agent-table">
                <thead>
                  <tr>
                    <th>REQ ID</th>
                    <th>Citizen & Contact</th>
                    <th>E-Waste Device</th>
                    <th>Quantity</th>
                    <th>Pickup Window</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <span className="gc-req-id-badge">REQ-{req.id}</span>
                      </td>
                      <td className="gc-td-citizen">
                        <strong>{req.user?.name}</strong>
                        {req.user?.phoneNumber ? (
                          <a href={`tel:${req.user.phoneNumber}`} className="gc-citizen-phone">
                            📞 {req.user.phoneNumber}
                          </a>
                        ) : (
                          <span className="gc-citizen-phone text-muted">{req.user?.email}</span>
                        )}
                      </td>
                      <td className="gc-td-device">
                        <strong>{req.deviceName}</strong>
                        <span className="gc-device-sub">{req.deviceCategory}</span>
                      </td>
                      <td>
                        <span className="gc-qty-badge">{req.quantity} unit(s)</span>
                      </td>
                      <td className="gc-td-window">
                        <span>{req.pickupDate || 'Scheduled'}</span>
                        <small>{req.pickupTime || 'Morning'}</small>
                      </td>
                      <td>
                        <span className={`gc-chip ${getStatusChipClass(req.status)}`}>
                          {req.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="gc-btn-primary gc-btn-sm"
                          onClick={() => setSelectedRequest(req)}
                        >
                          ⚡ View & Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Request Details & Action Modal */}
      {selectedRequest && (
        <AgentRequestDetailsModal
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onActionComplete={() => {
            setSelectedRequest(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default AgentDashboard;
