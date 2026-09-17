import React, { useState } from 'react';
import { agentService } from '../api/agentService';
import { getImageUrl } from '../../../common/api/axiosConfig';
import InteractiveMap from '../../../common/components/InteractiveMap';
import '../../pickup/components/OfficeRequestDetailsModal.css';

const AgentRequestDetailsModal = ({ request, open, onClose, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState(request?.agentRemarks || '');
  const [proofUrl, setProofUrl] = useState(request?.pickupProofUrl || '');
  const [fullImageModal, setFullImageModal] = useState(false);

  if (!open || !request) return null;

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError('');
    try {
      await agentService.updateRequestStatus(request.id, newStatus, remarks, proofUrl);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to update request status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update pickup status.');
      setLoading(false);
    }
  };

  const imageUrl = getImageUrl(request.photoPath);

  const userLocationObj =
    request.latitude && request.longitude
      ? { lat: request.latitude, lng: request.longitude }
      : null;

  const userPhone = request.user?.phoneNumber || '';

  return (
    <>
      <div className="gc-modal-backdrop" onClick={onClose}>
        <div className="gc-modal-window gc-req-details-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="gc-modal-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="gc-chip gc-chip-accepted">REQ-{request.id}</span>
                <span className={`gc-chip gc-chip-${request.status?.toLowerCase()}`}>
                  {request.status?.replace('_', ' ')}
                </span>
              </div>
              <h3 className="gc-modal-title">Assigned Pickup Execution</h3>
              <p className="gc-modal-subtitle">
                Scheduled for {request.pickupDate || 'Today'} {request.pickupTime ? `at ${request.pickupTime}` : ''}
              </p>
            </div>
            <button type="button" className="gc-modal-close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="gc-modal-body">
            {error && (
              <div className="gc-form-error-banner" style={{ marginBottom: '16px' }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="gc-admin-req-grid">
              {/* Left Column: Citizen Contact & Location */}
              <div className="gc-admin-req-col">
                <div className="gc-card-subpanel" style={{ background: 'rgba(0, 230, 118, 0.04)', borderColor: 'rgba(0, 230, 118, 0.25)' }}>
                  <h4 className="gc-subpanel-title" style={{ color: '#00ff88' }}>👤 Customer Contact Info</h4>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Name</span>
                    <span className="gc-detail-val" style={{ fontWeight: '700' }}>{request.user?.name}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Mobile Number</span>
                    <span className="gc-detail-val">
                      {userPhone ? (
                        <a href={`tel:${userPhone}`} className="gc-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          📞 Call {userPhone}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--gc-text-muted)' }}>Phone not provided</span>
                      )}
                    </span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Email</span>
                    <span className="gc-detail-val">{request.user?.email}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Pickup Location</span>
                    <span className="gc-detail-val">{request.userLocation || request.user?.address || 'GPS coordinates'}</span>
                  </div>
                </div>

                <div className="gc-card-subpanel" style={{ marginTop: '16px' }}>
                  <h4 className="gc-subpanel-title">📦 E-Waste Item Details</h4>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Device Name</span>
                    <span className="gc-detail-val" style={{ color: '#00ff88', fontWeight: '700' }}>{request.deviceName}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Category</span>
                    <span className="gc-detail-val">{request.deviceCategory}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Brand / Model</span>
                    <span className="gc-detail-val">{request.brand || 'N/A'} {request.model || ''}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Quantity</span>
                    <span className="gc-detail-val" style={{ fontWeight: '800' }}>{request.quantity} unit(s)</span>
                  </div>
                  {request.description && (
                    <div className="gc-detail-pair">
                      <span className="gc-detail-key">User Notes</span>
                      <span className="gc-detail-val">{request.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Photo & GPS Navigation Map */}
              <div className="gc-admin-req-col">
                {/* Uploaded photo */}
                {imageUrl && (
                  <div className="gc-card-subpanel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 className="gc-subpanel-title" style={{ margin: 0 }}>📸 Device Photo Verification</h4>
                      <button
                        type="button"
                        className="gc-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                        onClick={() => setFullImageModal(true)}
                      >
                        🔍 Full Size
                      </button>
                    </div>
                    <div className="gc-admin-photo-container" onClick={() => setFullImageModal(true)}>
                      <img src={imageUrl} alt="E-Waste Photo" className="gc-admin-photo" />
                    </div>
                  </div>
                )}

                {/* Interactive Map with Directions link */}
                <div className="gc-card-subpanel" style={{ marginTop: imageUrl ? '16px' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 className="gc-subpanel-title" style={{ margin: 0 }}>🗺️ GPS Navigation</h4>
                    {request.latitude && request.longitude && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="gc-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.74rem', textDecoration: 'none', color: '#00d4ff' }}
                      >
                        🧭 Open in Maps
                      </a>
                    )}
                  </div>
                  <div style={{ height: '210px', borderRadius: '12px', overflow: 'hidden' }}>
                    <InteractiveMap
                      userLocation={userLocationObj}
                      offices={request.office ? [request.office] : []}
                      selectedOffice={request.office}
                      height="210px"
                      showRoute={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Status Progression Controls for Logistics Agent ── */}
            <div className="gc-workflow-box" style={{ marginTop: '20px' }}>
              <h4 className="gc-workflow-title">⚡ Update Pickup Progression</h4>
              
              <div className="gc-field-group" style={{ marginBottom: '14px' }}>
                <label className="gc-input-label">Field Agent Remarks / Verification Notes (Optional)</label>
                <input
                  type="text"
                  className="gc-input-field"
                  placeholder="e.g. Verified 2 laptops in good cosmetic condition, packed in protective bubble wrap"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {request.status === 'ASSIGNED' && (
                  <button
                    type="button"
                    className="gc-btn-primary"
                    disabled={loading}
                    onClick={() => handleStatusUpdate('PICKUP_SCHEDULED')}
                  >
                    📅 Accept & Confirm Schedule
                  </button>
                )}

                {(request.status === 'PICKUP_SCHEDULED' || request.status === 'ACCEPTED' || request.status === 'ASSIGNED') && (
                  <button
                    type="button"
                    className="gc-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0088ff)' }}
                    disabled={loading}
                    onClick={() => handleStatusUpdate('ON_THE_WAY')}
                  >
                    🚗 On The Way to User
                  </button>
                )}

                {(request.status === 'ON_THE_WAY' || request.status === 'PICKUP_SCHEDULED') && (
                  <button
                    type="button"
                    className="gc-btn-primary"
                    disabled={loading}
                    onClick={() => handleStatusUpdate('COLLECTED')}
                  >
                    ✅ Mark Item as Collected
                  </button>
                )}

                {request.status === 'COLLECTED' && (
                  <button
                    type="button"
                    className="gc-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #00c967, #00e676)' }}
                    disabled={loading}
                    onClick={() => handleStatusUpdate('RECEIVED_AT_OFFICE')}
                  >
                    🏢 Mark Delivered to Collection Hub
                  </button>
                )}

                {request.status === 'RECEIVED_AT_OFFICE' && (
                  <button
                    type="button"
                    className="gc-btn-primary"
                    disabled={loading}
                    onClick={() => handleStatusUpdate('COMPLETED')}
                  >
                    🏆 Certify & Complete Recycling
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="gc-modal-footer">
            <button type="button" className="gc-btn-secondary" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {fullImageModal && (
        <div className="gc-lightbox-backdrop" onClick={() => setFullImageModal(false)}>
          <div className="gc-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt="E-Waste Zoom" className="gc-lightbox-img" />
            <button type="button" className="gc-lightbox-close" onClick={() => setFullImageModal(false)}>
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentRequestDetailsModal;
