import React, { useState, useEffect, useContext } from 'react';
import { analyticsService } from '../api/analyticsService';
import { AuthContext } from '../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassBackground from '../../../common/components/GlassBackground';
import GlassNavbar from '../../../common/components/GlassNavbar';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && (user.role !== 'SUPER_ADMIN' || user.email?.toLowerCase() !== 'sri741815@gmail.com')) {
      if (user.role === 'OFFICE') navigate('/dashboard');
      else navigate('/user-dashboard');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await analyticsService.getStats();
      setStats(data);
    } catch {
      setError('Failed to load global platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN' || user.email?.toLowerCase() !== 'sri741815@gmail.com') return null;

  return (
    <div className="gc-admin-root">
      <GlassBackground />
      <GlassNavbar />

      <main className="gc-admin-container">
        {/* Header section */}
        <section className="gc-admin-header-section">
          <div>
            <span className="gc-badge-portal" style={{ color: '#00d4ff', borderColor: 'rgba(0, 212, 255, 0.3)', background: 'rgba(0, 212, 255, 0.1)' }}>
              Super Admin Console
            </span>
            <h1 className="gc-admin-heading">Global Platform Analytics</h1>
            <p className="gc-admin-subheading">
              Real-time monitoring of registered recyclers, pickup operations, and circular economy recovery metrics.
            </p>
          </div>

          <div className="gc-admin-quick-actions">
            <button
              type="button"
              className="gc-btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              🏢 Manage Collection Offices
            </button>
          </div>
        </section>

        {error && (
          <div className="gc-form-error-banner" style={{ marginBottom: '24px' }}>
            <span>⚠️ {error}</span>
            <button type="button" className="gc-btn-secondary" onClick={fetchStats}>Retry</button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="gc-history-loading" style={{ minHeight: '300px' }}>
            <div className="gc-spinner" />
            <span>Aggregating platform metrics…</span>
          </div>
        ) : stats ? (
          <>
            {/* ── Key Performance Metric Cards ── */}
            <section className="gc-admin-stats-grid">
              {/* Total Users */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff' }}>
                  👥
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num">{stats.totalUsers ?? 0}</span>
                  <span className="gc-admin-stat-label">Total Users</span>
                  <span className="gc-admin-stat-desc">Registered community recyclers</span>
                </div>
              </div>

              {/* Total Pickup Requests */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(255, 179, 0, 0.15)', color: '#ffca28' }}>
                  📦
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num">{stats.totalRequests ?? 0}</span>
                  <span className="gc-admin-stat-label">Pickup Requests</span>
                  <span className="gc-admin-stat-desc">Initiated collections across all hubs</span>
                </div>
              </div>

              {/* Completed Pickups */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00ff88' }}>
                  ✅
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num">{stats.completedPickups ?? 0}</span>
                  <span className="gc-admin-stat-label">Completed Pickups</span>
                  <span className="gc-admin-stat-desc">Processed by certified offices</span>
                </div>
              </div>

              {/* Total E-Waste Items Collected */}
              <div className="gc-glass-card gc-glass-card-hover gc-admin-stat-card gc-admin-hero-stat">
                <div className="gc-admin-icon-box" style={{ background: 'rgba(0, 201, 103, 0.25)', color: '#00ff88' }}>
                  ♻️
                </div>
                <div className="gc-admin-stat-data">
                  <span className="gc-admin-stat-num" style={{ color: '#00ff88' }}>
                    {stats.totalEwasteItemsCollected ?? 0}
                  </span>
                  <span className="gc-admin-stat-label">E-Waste Items Saved</span>
                  <span className="gc-admin-stat-desc">Diverted from landfills</span>
                </div>
              </div>
            </section>

            {/* Platform Overview Panels */}
            <section className="gc-admin-panels-grid">
              <div className="gc-glass-card gc-admin-panel">
                <h3 className="gc-panel-title">System Infrastructure & Services</h3>
                <p className="gc-panel-desc">Active system components supporting Green Circuit.</p>

                <div className="gc-sys-health-list">
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">Authentication & JWT Service</span>
                    <span className="gc-chip gc-chip-collected">Healthy</span>
                  </div>
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">Collection Hubs & Geospatial API</span>
                    <span className="gc-chip gc-chip-collected">Active</span>
                  </div>
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">E-Waste Photo Upload Storage</span>
                    <span className="gc-chip gc-chip-collected">Operational</span>
                  </div>
                  <div className="gc-sys-item">
                    <span className="gc-sys-dot online" />
                    <span className="gc-sys-name">Rewards & Redemption Engine</span>
                    <span className="gc-chip gc-chip-collected">Synced</span>
                  </div>
                </div>
              </div>

              <div className="gc-glass-card gc-admin-panel">
                <h3 className="gc-panel-title">Quick Administration Actions</h3>
                <p className="gc-panel-desc">Direct shortcuts for administrative operations.</p>

                <div className="gc-admin-shortcuts">
                  <button
                    type="button"
                    className="gc-btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
                    onClick={() => navigate('/dashboard')}
                  >
                    🏢 Office Management Registry
                  </button>
                  <button
                    type="button"
                    className="gc-btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
                    onClick={() => fetchStats()}
                  >
                    🔄 Refresh Platform Telemetry
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
