import React, { useState, useEffect } from 'react';
import { pickupRequestService } from '../api/pickupRequestService';
import { getImageUrl } from '../../../common/api/axiosConfig';
import InteractiveMap from '../../../common/components/InteractiveMap';
import './PickupRequestHistory.css';

const getStatusChipClass = (status) => {
  switch (status) {
    case 'PENDING': return 'gc-chip-pending';
    case 'ACCEPTED': return 'gc-chip-accepted';
    case 'PICKUP_SCHEDULED': return 'gc-chip-scheduled';
    case 'COLLECTED': return 'gc-chip-collected';
    case 'RECEIVED_AT_OFFICE': return 'gc-chip-received';
    case 'RECYCLED':
    case 'COMPLETED': return 'gc-chip-recycled';
    case 'REJECTED': return 'gc-chip-rejected';
    case 'CANCELLED': return 'gc-chip-cancelled';
    default: return 'gc-chip-pending';
  }
};

const getStatusStepIndex = (status) => {
  switch (status) {
    case 'PENDING': return 0;
    case 'ACCEPTED': return 1;
    case 'PICKUP_SCHEDULED': return 2;
    case 'COLLECTED': return 3;
    case 'RECEIVED_AT_OFFICE': return 4;
    case 'RECYCLED':
    case 'COMPLETED': return 5;
    default: return 0;
  }
};

const TIMELINE_STEPS = [
  { label: 'Submitted', desc: 'Request logged' },
  { label: 'Accepted', desc: 'Office assigned' },
  { label: 'Scheduled', desc: 'Agent dispatched' },
  { label: 'Collected', desc: 'Device picked up' },
  { label: 'Received', desc: 'Arrived at center' },
  { label: 'Completed', desc: 'Points awarded' },
];

const PickupRequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [imageError, setImageError] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pickupRequestService.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch request history:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch request history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (req) => {
    setSelectedRequest(req);
    setImageError(false);
    setZoomImage(false);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchName = req.deviceName?.toLowerCase().includes(query);
    const matchCategory = req.deviceCategory?.toLowerCase().includes(query);
    const matchBrand = req.brand?.toLowerCase().includes(query);
    const matchOffice = req.office?.officeName?.toLowerCase().includes(query);
    const matchId = String(req.id).includes(query);

    return matchesStatus && (matchName || matchCategory || matchBrand || matchOffice || matchId);
  });

  return (
    <div className="gc-history-wrapper">
      {/* ── Search and Filter Controls ── */}
      <div className="gc-history-controls-bar">
        <div className="gc-search-box">
          <span className="gc-search-icon">🔍</span>
          <input
            type="text"
            className="gc-search-input"
            placeholder="Search by device, category, brand, center or REQ-ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="gc-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="gc-history-actions">
          <button
            type="button"
            className="gc-btn-secondary"
            onClick={fetchHistory}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Status Filter Badges ── */}
      <div className="gc-status-filter-pills">
        {[
          { key: 'ALL', label: 'All Submissions' },
          { key: 'PENDING', label: 'Pending' },
          { key: 'ACCEPTED', label: 'Accepted' },
          { key: 'PICKUP_SCHEDULED', label: 'Scheduled' },
          { key: 'COLLECTED', label: 'Collected' },
          { key: 'RECEIVED_AT_OFFICE', label: 'At Center' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className={`gc-status-pill ${statusFilter === item.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && requests.length === 0 ? (
        <div className="gc-history-loading">
          <div className="gc-spinner" />
          <span>Loading your e-waste requests…</span>
        </div>
      ) : error ? (
        <div className="gc-form-error-banner" style={{ margin: '20px 0' }}>
          <span>⚠️ {error}</span>
          <button type="button" className="gc-btn-secondary" onClick={fetchHistory}>Retry</button>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="gc-glass-card gc-empty-history">
          <div className="gc-empty-icon">📦</div>
          <h3>No E-Waste Requests Found</h3>
          <p>
            {requests.length === 0
              ? "You haven't submitted any electronic items for collection yet. Start now to earn eco rewards!"
              : "No requests match the current search filter."}
          </p>
        </div>
      ) : (
        /* ── Requests Table ── */
        <div className="gc-table-container">
          <table className="gc-table gc-table-responsive">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Photo</th>
                <th>Device Specifications</th>
                <th>Assigned Center</th>
                <th>Pickup Location</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span className="gc-req-id">REQ-{req.id}</span>
                  </td>
                  <td>
                    {req.photoPath ? (
                      <img
                        src={getImageUrl(req.photoPath)}
                        alt={req.deviceName}
                        className="gc-req-thumb"
                        onError={(e) => { e.target.style.display = 'none'; }}
                        onClick={() => handleOpenModal(req)}
                      />
                    ) : (
                      <span className="gc-no-photo-badge">No Photo</span>
                    )}
                  </td>
                  <td>
                    <div className="gc-device-title-cell">
                      <span className="gc-device-main">{req.deviceName}</span>
                      <span className="gc-device-sub">
                        {req.brand || ''} {req.model || ''} • {req.deviceCategory} ({req.quantity} unit{req.quantity > 1 ? 's' : ''})
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="gc-collector-name">{req.office?.officeName || 'Assigned Center'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gc-text-muted)' }}>
                        {req.office?.area || req.office?.city || 'Coimbatore'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--gc-text-secondary)' }}>
                      {req.userLocation || (req.latitude ? `${req.latitude.toFixed(4)}, ${req.longitude.toFixed(4)}` : 'Marked on GPS')}
                    </span>
                  </td>
                  <td>
                    <span className="gc-req-date">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className={`gc-chip ${getStatusChipClass(req.status)}`}>
                      {req.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="gc-btn-secondary gc-track-btn"
                      onClick={() => handleOpenModal(req)}
                    >
                      Track & Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Request Details & Live Tracking Modal ── */}
      {selectedRequest && (
        <div className="gc-modal-backdrop" onClick={() => setSelectedRequest(null)}>
          <div className="gc-modal-window gc-tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gc-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="gc-chip gc-chip-accepted">REQ-{selectedRequest.id}</span>
                  <span className={`gc-chip ${getStatusChipClass(selectedRequest.status)}`}>
                    {selectedRequest.status?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="gc-modal-title">E-Waste Request Lifecycle & Tracking</h3>
                <p className="gc-modal-subtitle">
                  Submitted on {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                className="gc-modal-close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                ✕
              </button>
            </div>

            <div className="gc-modal-body">
              {/* Status Timeline */}
              {selectedRequest.status === 'REJECTED' || selectedRequest.status === 'CANCELLED' ? (
                <div className="gc-form-error-banner" style={{ marginBottom: '20px' }}>
                  <span>
                    <strong>Status: {selectedRequest.status}</strong>
                    {selectedRequest.collectorResponse && ` — Reason: ${selectedRequest.collectorResponse}`}
                  </span>
                </div>
              ) : (
                <div className="gc-timeline-container">
                  <div className="gc-timeline-track">
                    <div
                      className="gc-timeline-progress-bar"
                      style={{
                        width: `${(getStatusStepIndex(selectedRequest.status) / (TIMELINE_STEPS.length - 1)) * 100}%`
                      }}
                    />
                    {TIMELINE_STEPS.map((step, idx) => {
                      const currentStep = getStatusStepIndex(selectedRequest.status);
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div
                          key={step.label}
                          className={`gc-timeline-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                        >
                          <div className="gc-node-circle">
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className="gc-node-label">{step.label}</span>
                          <span className="gc-node-desc">{step.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Collection Agent Details Card if assigned */}
              {(selectedRequest.agent || selectedRequest.collectorName) && (
                <div className="gc-scheduled-card" style={{ background: 'rgba(0, 212, 255, 0.08)', borderColor: 'rgba(0, 212, 255, 0.35)', marginBottom: '18px' }}>
                  <div className="gc-scheduled-icon" style={{ background: 'rgba(0, 212, 255, 0.2)', color: '#00d4ff' }}>👮</div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 className="gc-scheduled-title" style={{ color: '#00d4ff', margin: 0 }}>
                        Assigned Collection Agent
                      </h4>
                      {selectedRequest.agent?.employeeId && (
                        <span className="gc-chip gc-chip-accepted" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                          🆔 {selectedRequest.agent.employeeId}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--gc-text-muted)' }}>Agent Name</span>
                        <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.92rem' }}>
                          {selectedRequest.agent?.fullName || selectedRequest.collectorName}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--gc-text-muted)' }}>Agent Mobile</span>
                        <div>
                          {(selectedRequest.agent?.mobileNumber || selectedRequest.collectorPhoneNumber) ? (
                            <a
                              href={`tel:${selectedRequest.agent?.mobileNumber || selectedRequest.collectorPhoneNumber}`}
                              className="gc-btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginTop: '2px' }}
                            >
                              📞 Call {selectedRequest.agent?.mobileNumber || selectedRequest.collectorPhoneNumber}
                            </a>
                          ) : (
                            <span style={{ color: 'var(--gc-text-muted)', fontSize: '0.82rem' }}>Not provided</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--gc-text-muted)' }}>Collection Center</span>
                        <div style={{ color: 'var(--gc-text-secondary)', fontSize: '0.82rem' }}>
                          {selectedRequest.office?.officeName || 'Green Circuit Hub'}
                        </div>
                      </div>

                      {selectedRequest.pickupDate && (
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--gc-text-muted)' }}>Pickup Window</span>
                          <div style={{ color: '#00ff88', fontWeight: '600', fontSize: '0.82rem' }}>
                            📅 {selectedRequest.pickupDate} {selectedRequest.pickupTime ? `at ${selectedRequest.pickupTime}` : ''}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedRequest.agentRemarks && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem', color: 'var(--gc-text-secondary)' }}>
                        <strong>Agent Field Notes:</strong> {selectedRequest.agentRemarks}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reward Points Earned Banner if completed */}
              {(selectedRequest.status === 'RECYCLED' || selectedRequest.status === 'COMPLETED') && (
                <div style={{
                  background: 'rgba(0, 230, 118, 0.12)',
                  border: '1px solid rgba(0, 230, 118, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🌟</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#00ff88', fontSize: '0.92rem' }}>Certified Eco-Disposal Completed</h4>
                    <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>
                      Green reward points (+{(selectedRequest.quantity || 1) * 25} pts) credited to your balance!
                    </p>
                  </div>
                </div>
              )}

              {/* Content Grid: Device Details, Photo & Map */}
              <div className="gc-details-grid">
                {/* Left Column: Device & Office Info */}
                <div className="gc-details-col">
                  <h4 className="gc-details-section-title">📱 Device Details</h4>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Device Name</span>
                    <span className="gc-detail-val">{selectedRequest.deviceName}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Category</span>
                    <span className="gc-detail-val">{selectedRequest.deviceCategory}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Brand & Model</span>
                    <span className="gc-detail-val">{selectedRequest.brand || 'N/A'} {selectedRequest.model || ''}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Quantity</span>
                    <span className="gc-detail-val">{selectedRequest.quantity} unit(s)</span>
                  </div>
                  {selectedRequest.approximateWeight && (
                    <div className="gc-detail-pair">
                      <span className="gc-detail-key">Approx Weight</span>
                      <span className="gc-detail-val">{selectedRequest.approximateWeight} kg</span>
                    </div>
                  )}
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Condition Notes</span>
                    <span className="gc-detail-val">{selectedRequest.description}</span>
                  </div>

                  <h4 className="gc-details-section-title" style={{ marginTop: '16px' }}>🏢 Collection Center</h4>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Office Name</span>
                    <span className="gc-detail-val">{selectedRequest.office?.officeName}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Address</span>
                    <span className="gc-detail-val">{selectedRequest.office?.address}</span>
                  </div>
                  {selectedRequest.office?.phoneNumber && (
                    <div className="gc-detail-pair">
                      <span className="gc-detail-key">Phone</span>
                      <span className="gc-detail-val">{selectedRequest.office?.phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* Right Column: Uploaded Photo & Map Preview */}
                <div className="gc-details-col gc-photo-col">
                  <h4 className="gc-details-section-title">📸 Device Photo</h4>
                  {selectedRequest.photoPath && !imageError ? (
                    <div
                      className="gc-modal-photo-wrapper"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setZoomImage(true)}
                      title="Click to zoom image"
                    >
                      <img
                        src={getImageUrl(selectedRequest.photoPath)}
                        alt="E-Waste"
                        className="gc-modal-photo"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="gc-no-photo-box">
                      <span>📷 No photo attached with request</span>
                    </div>
                  )}

                  {/* Interactive Map Preview */}
                  <h4 className="gc-details-section-title" style={{ marginTop: '16px' }}>📍 Route & Locations</h4>
                  <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
                    <InteractiveMap
                      userLocation={
                        selectedRequest.latitude && selectedRequest.longitude
                          ? { lat: selectedRequest.latitude, lng: selectedRequest.longitude }
                          : null
                      }
                      offices={selectedRequest.office ? [selectedRequest.office] : []}
                      selectedOffice={selectedRequest.office}
                      height="180px"
                      showRoute={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="gc-modal-footer">
              <button
                type="button"
                className="gc-btn-secondary"
                onClick={() => setSelectedRequest(null)}
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom Photo Modal ── */}
      {zoomImage && selectedRequest?.photoPath && (
        <div className="gc-modal-backdrop" onClick={() => setZoomImage(false)}>
          <div className="gc-modal-window gc-zoom-image-window" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span style={{ fontWeight: 600, color: '#ffffff' }}>E-Waste Photo — {selectedRequest.deviceName}</span>
              <button type="button" className="gc-modal-close-btn" onClick={() => setZoomImage(false)}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={getImageUrl(selectedRequest.photoPath)}
                alt="E-Waste Full Preview"
                style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupRequestHistory;
