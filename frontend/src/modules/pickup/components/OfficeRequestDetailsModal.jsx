import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { pickupRequestService } from '../api/pickupRequestService';
import { getImageUrl } from '../../../common/api/axiosConfig';
import './OfficeRequestDetailsModal.css';

const mapContainerStyle = {
  width: '100%',
  height: '240px',
  borderRadius: '14px',
};

const OfficeRequestDetailsModal = ({ request, open, onClose, onActionComplete }) => {
  const [responseMsg, setResponseMsg] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fullImageModal, setFullImageModal] = useState(false);

  // For Scheduling Pickup
  const [collectorName, setCollectorName] = useState('');
  const [collectorPhone, setCollectorPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // For subsequent statuses
  const [nextStatus, setNextStatus] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  if (!open || !request) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      await pickupRequestService.acceptRequest(request.id, responseMsg);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to accept request:', err);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!responseMsg.trim()) return;
    setLoading(true);
    try {
      await pickupRequestService.rejectRequest(request.id, responseMsg);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to reject request:', err);
      setLoading(false);
    }
  };

  const handleAssignCollector = async () => {
    if (!collectorName || !collectorPhone || !pickupDate || !pickupTime) return;
    setLoading(true);
    try {
      await pickupRequestService.assignCollector(
        request.id,
        collectorName,
        collectorPhone,
        pickupDate,
        pickupTime
      );
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to assign collector:', err);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    setLoading(true);
    try {
      await pickupRequestService.updateRequestStatus(request.id, nextStatus);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to update status:', err);
      setLoading(false);
    }
  };

  const imageUrl = getImageUrl(request.photoPath);

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
              <h3 className="gc-modal-title">E-Waste Collection Request Details</h3>
              <p className="gc-modal-subtitle">
                Received on {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <button type="button" className="gc-modal-close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="gc-modal-body">
            <div className="gc-admin-req-grid">
              {/* Left Column: User & Device Info */}
              <div className="gc-admin-req-col">
                <div className="gc-card-subpanel">
                  <h4 className="gc-subpanel-title">👤 User Contact Details</h4>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Name</span>
                    <span className="gc-detail-val">{request.user?.name}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Email</span>
                    <span className="gc-detail-val">{request.user?.email}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Pickup Address</span>
                    <span className="gc-detail-val">{request.userLocation || 'Not provided by user'}</span>
                  </div>
                </div>

                <div className="gc-card-subpanel" style={{ marginTop: '16px' }}>
                  <h4 className="gc-subpanel-title">📱 E-Waste Specifications</h4>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Device</span>
                    <span className="gc-detail-val">{request.deviceName}</span>
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
                    <span className="gc-detail-val">{request.quantity}</span>
                  </div>
                  {request.approximateWeight && (
                    <div className="gc-detail-pair">
                      <span className="gc-detail-key">Weight</span>
                      <span className="gc-detail-val">{request.approximateWeight} kg</span>
                    </div>
                  )}
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Condition Notes</span>
                    <span className="gc-detail-val">{request.description}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Uploaded Image & Google Map */}
              <div className="gc-admin-req-col">
                {/* Uploaded Waste Photo */}
                <div className="gc-card-subpanel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 className="gc-subpanel-title" style={{ margin: 0 }}>📸 Uploaded Waste Photo</h4>
                    {imageUrl && !imageError && (
                      <button
                        type="button"
                        className="gc-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                        onClick={() => setFullImageModal(true)}
                      >
                        🔍 View Full Size
                      </button>
                    )}
                  </div>

                  {imageUrl && !imageError ? (
                    <div
                      className="gc-admin-photo-container"
                      onClick={() => setFullImageModal(true)}
                      title="Click to zoom image"
                    >
                      {imageLoading && (
                        <div className="gc-image-loading-placeholder">
                          <div className="gc-spinner" />
                          <span>Loading uploaded photo…</span>
                        </div>
                      )}
                      <img
                        src={imageUrl}
                        alt="E-Waste Device"
                        className="gc-admin-photo"
                        onLoad={() => setImageLoading(false)}
                        onError={() => { setImageLoading(false); setImageError(true); }}
                      />
                    </div>
                  ) : (
                    <div className="gc-no-photo-box" style={{ height: '140px' }}>
                      {imageError ? (
                        <div>
                          <p style={{ color: '#ff8a80', margin: '0 0 6px 0' }}>⚠️ Unable to load image</p>
                          <button
                            type="button"
                            className="gc-btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => { setImageError(false); setImageLoading(true); }}
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <span>No photo attached with request</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pickup Location Map */}
                <div className="gc-card-subpanel" style={{ marginTop: '16px' }}>
                  <h4 className="gc-subpanel-title">📍 Pickup Location Map</h4>
                  {request.latitude && request.longitude && isLoaded ? (
                    <div className="gc-admin-map-wrapper">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: request.latitude, lng: request.longitude }}
                        zoom={14}
                        options={{
                          styles: [
                            { elementType: 'geometry', stylers: [{ color: '#0f2419' }] },
                            { elementType: 'labels.text.stroke', stylers: [{ color: '#091811' }] },
                            { elementType: 'labels.text.fill', stylers: [{ color: '#749882' }] },
                            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a3c2b' }] }
                          ]
                        }}
                      >
                        <Marker
                          position={{ lat: request.latitude, lng: request.longitude }}
                          title="User Pickup Location"
                          icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                        />
                      </GoogleMap>
                    </div>
                  ) : (
                    <div className="gc-no-photo-box" style={{ height: '120px' }}>
                      <span>
                        {request.latitude && request.longitude
                          ? 'Loading Google Maps…'
                          : 'Coordinates not provided for this pickup.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Status Workflow Controls ── */}
            {/* PENDING: Rejection input if triggered */}
            {request.status === 'PENDING' && isRejecting && (
              <div className="gc-workflow-box" style={{ borderColor: 'rgba(255, 82, 82, 0.4)' }}>
                <label className="gc-input-label" style={{ color: '#ff8a80' }}>
                  Rejection Reason (Sent to User) *
                </label>
                <textarea
                  rows="2"
                  className="gc-input-field"
                  placeholder="e.g. Hazardous non-electronic material, location out of service range"
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                />
              </div>
            )}

            {/* ACCEPTED: Schedule pickup */}
            {request.status === 'ACCEPTED' && (
              <div className="gc-workflow-box">
                <h4 className="gc-workflow-title">🚚 Schedule Pickup Agent & Time</h4>
                <div className="gc-workflow-grid">
                  <div className="gc-field-group">
                    <label className="gc-input-label">Collector / Agent Name *</label>
                    <input
                      type="text"
                      className="gc-input-field"
                      placeholder="e.g. Ramesh Kumar"
                      value={collectorName}
                      onChange={(e) => setCollectorName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="gc-field-group">
                    <label className="gc-input-label">Collector Phone *</label>
                    <input
                      type="text"
                      className="gc-input-field"
                      placeholder="+91 9876543210"
                      value={collectorPhone}
                      onChange={(e) => setCollectorPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="gc-field-group">
                    <label className="gc-input-label">Pickup Date *</label>
                    <input
                      type="date"
                      className="gc-input-field"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="gc-field-group">
                    <label className="gc-input-label">Pickup Time *</label>
                    <input
                      type="time"
                      className="gc-input-field"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PICKUP_SCHEDULED or COLLECTED: Update status */}
            {(request.status === 'PICKUP_SCHEDULED' || request.status === 'COLLECTED') && (
              <div className="gc-workflow-box">
                <h4 className="gc-workflow-title">♻️ Advance Recycling Pipeline</h4>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: '220px' }}>
                    <select
                      className="gc-select-field"
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                    >
                      <option value="">-- Choose Next Status --</option>
                      {request.status === 'PICKUP_SCHEDULED' && (
                        <option value="COLLECTED">COLLECTED (Items Received)</option>
                      )}
                      {request.status === 'COLLECTED' && (
                        <option value="RECYCLED">RECYCLED (Certified & Rewards Dispatched)</option>
                      )}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="gc-btn-primary"
                    disabled={!nextStatus || loading}
                    onClick={handleUpdateStatus}
                  >
                    {loading ? 'Updating…' : 'Update Status'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="gc-modal-footer">
            <button type="button" className="gc-btn-secondary" onClick={onClose} disabled={loading}>
              Close
            </button>

            {request.status === 'PENDING' && (
              <>
                {isRejecting ? (
                  <button
                    type="button"
                    className="gc-btn-primary gc-btn-danger"
                    onClick={handleReject}
                    disabled={!responseMsg.trim() || loading}
                  >
                    {loading ? 'Rejecting…' : 'Confirm Rejection'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="gc-btn-secondary gc-btn-danger"
                    onClick={() => setIsRejecting(true)}
                    disabled={loading}
                  >
                    Reject Request
                  </button>
                )}

                {!isRejecting && (
                  <button
                    type="button"
                    className="gc-btn-primary"
                    onClick={handleAccept}
                    disabled={loading}
                  >
                    {loading ? 'Accepting…' : 'Accept Request'}
                  </button>
                )}
              </>
            )}

            {request.status === 'ACCEPTED' && (
              <button
                type="button"
                className="gc-btn-primary"
                onClick={handleAssignCollector}
                disabled={!collectorName || !collectorPhone || !pickupDate || !pickupTime || loading}
              >
                {loading ? 'Scheduling…' : 'Confirm Scheduled Pickup'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen Zoom Modal for Uploaded Photo */}
      {fullImageModal && (
        <div className="gc-modal-backdrop" onClick={() => setFullImageModal(false)}>
          <div className="gc-modal-window gc-zoom-image-window" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span style={{ fontWeight: 600, color: '#ffffff' }}>E-Waste Photo — {request.deviceName}</span>
              <button type="button" className="gc-modal-close-btn" onClick={() => setFullImageModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={imageUrl}
                alt="E-Waste Device Full Preview"
                style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfficeRequestDetailsModal;
