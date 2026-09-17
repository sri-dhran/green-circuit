import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { pickupRequestService } from '../api/pickupRequestService';
import GlassBackground from '../../../common/components/GlassBackground';
import GlassNavbar from '../../../common/components/GlassNavbar';
import PickupRequestForm from '../components/PickupRequestForm';
import PickupRequestHistory from '../components/PickupRequestHistory';
import UserProfileModal from '../../user/components/UserProfileModal';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0); // 0: Submit, 1: History
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    if (!user) return;
    fetchUserStats();
  }, [user, activeTab]);

  const fetchUserStats = async () => {
    try {
      const requests = await pickupRequestService.getMyRequests();
      if (Array.isArray(requests)) {
        const total = requests.length;
        const pending = requests.filter(
          (r) => r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'PICKUP_SCHEDULED'
        ).length;
        const completed = requests.filter(
          (r) => r.status === 'COLLECTED' || r.status === 'RECYCLED'
        ).length;
        setStats({ totalRequests: total, pending, completed });
      }
      if (refreshUser) refreshUser();
    } catch (err) {
      console.warn('Could not load user stats:', err);
    }
  };

  const handlePickupSuccess = () => {
    setActiveTab(1); // switch to history tab on submission
    fetchUserStats();
  };

  if (!user) return null;

  return (
    <div className="gc-dashboard-root">
      <GlassBackground />
      <GlassNavbar />

      <main className="gc-dashboard-container">
        {/* Welcome & Overview Header */}
        <section className="gc-dash-header-section">
          <div className="gc-dash-header-left">
            <span className="gc-badge-portal">User Portal</span>
            <h1 className="gc-dash-heading">
              Welcome back, <span className="gc-dash-name">{user.name}</span>
            </h1>
            <p className="gc-dash-subheading">
              Track your electronic waste impact, schedule certified disposals, and claim green rewards.
            </p>
          </div>

          <div className="gc-dash-header-action" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="gc-btn-secondary"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setProfileModalOpen(true)}
            >
              <span>👤 Mobile & Profile</span>
            </button>
            <button
              type="button"
              className="gc-btn-secondary gc-rewards-banner-btn"
              onClick={() => navigate('/reward-store')}
            >
              <span>🏆 Reward Store</span>
              <span className="gc-rewards-pts-tag">{user.rewardPoints ?? 0} Pts Available</span>
            </button>
          </div>
        </section>

        {/* ── Glass Statistics Metric Cards ── */}
        <section className="gc-dash-stats-grid">
          {/* Card 1: Total Requests */}
          <div className="gc-glass-card gc-glass-card-hover gc-stat-card">
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(0, 201, 103, 0.15)', color: '#00e676' }}>
              📦
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number">{stats.totalRequests}</span>
              <span className="gc-stat-title">Total Requests</span>
              <span className="gc-stat-desc">Lifetime submissions</span>
            </div>
          </div>

          {/* Card 2: Pending Pickup */}
          <div className="gc-glass-card gc-glass-card-hover gc-stat-card">
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(255, 179, 0, 0.15)', color: '#ffca28' }}>
              ⏳
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number">{stats.pending}</span>
              <span className="gc-stat-title">In Progress</span>
              <span className="gc-stat-desc">Awaiting pickup/collector</span>
            </div>
          </div>

          {/* Card 3: Completed Pickups */}
          <div className="gc-glass-card gc-glass-card-hover gc-stat-card">
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff' }}>
              ✅
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number">{stats.completed}</span>
              <span className="gc-stat-title">Completed & Recycled</span>
              <span className="gc-stat-desc">Certified eco-disposals</span>
            </div>
          </div>

          {/* Card 4: Reward Points */}
          <div
            className="gc-glass-card gc-glass-card-hover gc-stat-card gc-stat-reward-card"
            onClick={() => navigate('/reward-store')}
          >
            <div className="gc-stat-icon-wrapper" style={{ background: 'rgba(255, 193, 7, 0.2)', color: '#ffd54f' }}>
              🌟
            </div>
            <div className="gc-stat-data">
              <span className="gc-stat-number" style={{ color: '#ffd54f' }}>{user.rewardPoints ?? 0}</span>
              <span className="gc-stat-title">Eco Reward Points</span>
              <span className="gc-stat-desc">Click to redeem rewards →</span>
            </div>
          </div>
        </section>

        {/* ── Main Navigation Tabs ── */}
        <div className="gc-dash-tabs-bar">
          <div className="gc-tabs-header">
            <button
              className={`gc-tab-button ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              🌿 New Pickup Request
            </button>
            <button
              className={`gc-tab-button ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              📋 My Requests ({stats.totalRequests})
            </button>
          </div>
        </div>

        {/* ── Tab 0: New Submission ── */}
        {activeTab === 0 && (
          <div className="gc-tab-submit-layout">
            {/* Left Sidebar: Profile & How it works */}
            <aside className="gc-profile-sidebar">
              <div className="gc-glass-card gc-profile-card">
                <div className="gc-profile-avatar-large">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="gc-profile-user-name">{user.name}</h3>
                <p className="gc-profile-user-email">{user.email}</p>
                <div className="gc-chip gc-chip-collected" style={{ marginTop: '6px' }}>
                  Verified Recycler
                </div>

                <div className="gc-profile-divider" />

                <h4 className="gc-hiw-title">How Recycling Works</h4>
                <div className="gc-hiw-list">
                  <div className="gc-hiw-step">
                    <span className="gc-step-num">1</span>
                    <div className="gc-step-text">
                      <strong>Enter Device Info</strong>
                      <p>Specify device category, condition & attach a photo.</p>
                    </div>
                  </div>
                  <div className="gc-hiw-step">
                    <span className="gc-step-num">2</span>
                    <div className="gc-step-text">
                      <strong>Select Facility</strong>
                      <p>Pick your nearest certified e-waste office on the map.</p>
                    </div>
                  </div>
                  <div className="gc-hiw-step">
                    <span className="gc-step-num">3</span>
                    <div className="gc-step-text">
                      <strong>Doorstep Pickup</strong>
                      <p>Agent inspects and securely collects your devices.</p>
                    </div>
                  </div>
                  <div className="gc-hiw-step">
                    <span className="gc-step-num">4</span>
                    <div className="gc-step-text">
                      <strong>Earn Rewards</strong>
                      <p>Receive green points redeemable in the reward store.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Main Form Container */}
            <div className="gc-glass-card gc-form-container-card">
              <PickupRequestForm onSuccess={handlePickupSuccess} />
            </div>
          </div>
        )}

        {/* ── Tab 1: Request History ── */}
        {activeTab === 1 && (
          <div className="gc-glass-card gc-history-container-card">
            <div className="gc-history-header-bar">
              <div>
                <h3 className="gc-history-section-title">Submitted Pickup Requests</h3>
                <p className="gc-history-section-sub">
                  Live timeline updates from collection to certified recycling.
                </p>
              </div>
              <button
                type="button"
                className="gc-btn-primary"
                onClick={() => setActiveTab(0)}
              >
                + New Submission
              </button>
            </div>
            <PickupRequestHistory />
          </div>
        )}

        {/* Edit Profile & Mobile Modal */}
        {profileModalOpen && (
          <UserProfileModal
            user={user}
            open={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            onProfileUpdated={() => {
              if (refreshUser) refreshUser();
            }}
          />
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
