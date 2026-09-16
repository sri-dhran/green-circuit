import React, { useState, useEffect, useContext } from 'react';
import { rewardService } from '../api/rewardService';
import { AuthContext } from '../../user/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassBackground from '../../../common/components/GlassBackground';
import GlassNavbar from '../../../common/components/GlassNavbar';
import './RewardStore.css';

const RewardStore = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tabIndex, setTabIndex] = useState(0); // 0: Store, 1: Redemptions
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const rewardsData = await rewardService.getAvailableRewards();
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);

      try {
        const redemptionsData = await rewardService.getMyRedemptions();
        setRedemptions(Array.isArray(redemptionsData) ? redemptionsData : []);
      } catch (redemptionErr) {
        console.warn('Could not fetch user redemptions:', redemptionErr);
        setRedemptions([]);
      }

      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('Failed to load rewards store data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load rewards store data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (itemId) => {
    setRedeemingId(itemId);
    try {
      await rewardService.redeemReward(itemId);
      setSuccessMsg('🎉 Reward redeemed successfully! Voucher details sent to your registered email.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem reward. Please check your points balance.');
    } finally {
      setRedeemingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="gc-reward-root">
      <GlassBackground />
      <GlassNavbar />

      <main className="gc-reward-container">
        {/* Banner Section with User Points */}
        <section className="gc-glass-card gc-reward-hero-card">
          <div className="gc-hero-left">
            <span className="gc-badge-portal">Green Circuit Store</span>
            <h1 className="gc-reward-heading">Eco Rewards Marketplace</h1>
            <p className="gc-reward-subheading">
              Turn your recycled electronic waste into certified shopping discounts, eco-gadgets, and gift vouchers.
            </p>
          </div>

          <div className="gc-hero-points-box">
            <div className="gc-hero-trophy">🏆</div>
            <div className="gc-hero-points-data">
              <span className="gc-hero-points-num">{user.rewardPoints ?? 0}</span>
              <span className="gc-hero-points-label">Available Reward Points</span>
            </div>
          </div>
        </section>

        {/* Feedback alerts */}
        {error && (
          <div className="gc-form-error-banner" style={{ margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span>⚠️ {error}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={fetchData}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                🔄 Retry
              </button>
              <button type="button" className="gc-banner-close" onClick={() => setError('')}>✕</button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="gc-reward-success-banner">
            <span>{successMsg}</span>
            <button type="button" className="gc-banner-close" onClick={() => setSuccessMsg('')}>✕</button>
          </div>
        )}

        {/* Store Tabs */}
        <div className="gc-reward-tabs-bar">
          <div className="gc-tabs-header">
            <button
              className={`gc-tab-button ${tabIndex === 0 ? 'active' : ''}`}
              onClick={() => setTabIndex(0)}
            >
              🎁 Available Rewards ({rewards.length})
            </button>
            <button
              className={`gc-tab-button ${tabIndex === 1 ? 'active' : ''}`}
              onClick={() => setTabIndex(1)}
            >
              📜 My Redemptions ({redemptions.length})
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="gc-history-loading">
            <div className="gc-spinner" />
            <span>Loading reward items…</span>
          </div>
        ) : (
          <>
            {/* Tab 0: Available Rewards Grid */}
            {tabIndex === 0 && (
              <div className="gc-rewards-grid">
                {rewards.length === 0 ? (
                  <div className="gc-glass-card gc-empty-history" style={{ gridColumn: '1 / -1' }}>
                    <div className="gc-empty-icon">🎁</div>
                    <h3>No Rewards Currently Available</h3>
                    <p>New vouchers and eco-products are added every week. Check back soon!</p>
                  </div>
                ) : (
                  rewards.map((reward) => {
                    const canAfford = (user.rewardPoints ?? 0) >= reward.pointsCost;
                    const isRedeeming = redeemingId === reward.id;

                    return (
                      <div key={reward.id} className="gc-glass-card gc-glass-card-hover gc-reward-card">
                        {reward.imageUrl && (
                          <div className="gc-reward-img-wrapper">
                            <img
                              src={reward.imageUrl}
                              alt={reward.name}
                              className="gc-reward-img"
                              crossOrigin="anonymous"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}

                        <div className="gc-reward-content">
                          <div className="gc-reward-cost-pill">
                            <span>🪙 {reward.pointsCost} Points</span>
                          </div>
                          <h3 className="gc-reward-title">{reward.name}</h3>
                          <p className="gc-reward-desc">{reward.description}</p>
                        </div>

                        <div className="gc-reward-footer">
                          <button
                            type="button"
                            className={canAfford ? 'gc-btn-primary' : 'gc-btn-secondary'}
                            style={{ width: '100%' }}
                            disabled={!canAfford || isRedeeming}
                            onClick={() => handleRedeem(reward.id)}
                          >
                            {isRedeeming ? (
                              'Processing…'
                            ) : canAfford ? (
                              'Redeem Voucher'
                            ) : (
                              `Needs ${reward.pointsCost - (user.rewardPoints ?? 0)} more pts`
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 1: My Redemptions History */}
            {tabIndex === 1 && (
              <div className="gc-glass-card gc-redemptions-card">
                <h3 className="gc-redemptions-title">Your Claimed Rewards</h3>
                <p className="gc-redemptions-sub">
                  History of all vouchers, digital coupons, and items claimed with your points.
                </p>

                {redemptions.length === 0 ? (
                  <div className="gc-empty-history" style={{ padding: '32px 0' }}>
                    <div className="gc-empty-icon">🏷️</div>
                    <p>You have not claimed any rewards yet. Collect more points by submitting e-waste!</p>
                  </div>
                ) : (
                  <div className="gc-redemptions-list">
                    {redemptions.map((r) => (
                      <div key={r.id} className="gc-redemption-item">
                        <div className="gc-redemption-item-left">
                          <div className="gc-redemption-icon">🎁</div>
                          <div>
                            <h4 className="gc-redemption-name">{r.rewardItem?.name || 'Redeemed Reward'}</h4>
                            <span className="gc-redemption-date">
                              Claimed on {new Date(r.redeemedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="gc-redemption-cost">
                          <span>-{r.rewardItem?.pointsCost} Pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default RewardStore;
