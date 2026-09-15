import React, { useState, useEffect } from 'react';
import { pickupRequestService } from '../api/pickupRequestService';
import { getImageUrl } from '../../../common/api/axiosConfig';
import './PickupRequestHistory.css';

const getStatusChipClass = (status) => {
  switch (status) {
    case 'PENDING': return 'gc-chip-pending';
    case 'ACCEPTED': return 'gc-chip-accepted';
    case 'PICKUP_SCHEDULED': return 'gc-chip-scheduled';
    case 'COLLECTED': return 'gc-chip-collected';
    case 'RECYCLED': return 'gc-chip-recycled';
    case 'REJECTED': return 'gc-chip-rejected';
    default: return 'gc-chip-pending';
  }
};

const getStatusStepIndex = (status) => {
  switch (status) {
    case 'PENDING': return 0;
    case 'ACCEPTED': return 1;
    case 'PICKUP_SCHEDULED': return 2;
    case 'COLLECTED': return 3;
    case 'RECYCLED': return 4;
    default: return 0;
  }
};

const TIMELINE_STEPS = [
  { label: 'Submitted', desc: 'Request logged' },
  { label: 'Accepted', desc: 'Office assigned' },
  { label: 'Scheduled', desc: 'Agent dispatched' },
  { label: 'Collected', desc: 'Device picked up' },
  { label: 'Recycled', desc: 'Points awarded' },
];

const PickupRequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await pickupRequestService.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to fetch request history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (req) => {
    setSelectedRequest(req);
    setImageError(false);
  };

  if (loading) {
    return (
      <div className="gc-history-loading">
        <div className="gc-spinner" />
        <span>Loading your pickup history…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gc-form-error-banner">
        <span>⚠️ {error}</span>
        <button type="button" className="gc-btn-secondary" onClick={fetchHistory}>Retry</button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="gc-glass-card gc-empty-history">
        <div className="gc-empty-icon">📦</div>
        <h3>No Pickup Requests Yet</h3>
        <p>You haven’t submitted any e-waste for recycling. Submit your first request to earn eco rewards!</p>
      </div>
    );
  }

  return (
    <div className="gc-history-wrapper">
      {/* Desktop / Tablet Table View */}
      <div className="gc-table-container">
        <table className="gc-table gc-table-responsive">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Photo</th>
              <th>Device</th>
              <th>Collector</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
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
                    />
                  ) : (
                    <span className="gc-no-photo-badge">No Photo</span>
                  )}
                </td>
                <td>
                  <div className="gc-device-title-cell">
                    <span className="gc-device-main">{req.deviceName}</span>
                    <span className="gc-device-sub">{req.brand} {req.model} • {req.deviceCategory}</span>
                  </div>
                </td>
                <td>
                  <span className="gc-collector-name">{req.office?.officeName || 'Assigned Center'}</span>
                </td>
                <td>
                  <span className="gc-req-date">{new Date(req.createdAt).toLocaleDateString()}</span>
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
                    Track Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Request Details & Tracking Modal ── */}
      {selectedRequest && (
        <div className="gc-modal-backdrop" onClick={() => setSelectedRequest(null)}>
          <div className="gc-modal-window gc-tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gc-modal-header">
              <div>
                <span className="gc-chip gc-chip-accepted" style={{ marginBottom: '6px' }}>
                  REQ-{selectedRequest.id}
                </span>
                <h3 className="gc-modal-title">E-Waste Pickup Tracking</h3>
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
                <div className="gc-form-error-banner" style={{ marginBottom: '24px' }}>
                  <span>
                    <strong>Status: {selectedRequest.status}</strong>
                    {selectedRequest.collectorResponse && ` — ${selectedRequest.collectorResponse}`}
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

              {/* Scheduled Pickup Banner if applicable */}
              {(selectedRequest.status === 'PICKUP_SCHEDULED' || selectedRequest.status === 'COLLECTED') && (
                <div className="gc-scheduled-card">
                  <div className="gc-scheduled-icon">🚚</div>
                  <div>
                    <h4 className="gc-scheduled-title">Scheduled Pickup in Progress</h4>
                    <p className="gc-scheduled-text">
                      <strong>Agent:</strong> {selectedRequest.collectorName || 'Eco Logistics Agent'} •{' '}
                      <strong>Phone:</strong> {selectedRequest.collectorPhoneNumber || 'Provided upon dispatch'}
                    </p>
                    <p className="gc-scheduled-text">
                      <strong>Date & Time:</strong> {selectedRequest.pickupDate} at {selectedRequest.pickupTime}
                    </p>
                  </div>
                </div>
              )}

              {/* Content Grid: Device Details & Photo */}
              <div className="gc-details-grid">
                <div className="gc-details-col">
                  <h4 className="gc-details-section-title">Device Specifications</h4>
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
                    <span className="gc-detail-key">Pickup Location</span>
                    <span className="gc-detail-val">{selectedRequest.userLocation || 'Marked on GPS'}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Condition Notes</span>
                    <span className="gc-detail-val">{selectedRequest.description}</span>
                  </div>

                  <h4 className="gc-details-section-title" style={{ marginTop: '18px' }}>Authorized Center</h4>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Office Name</span>
                    <span className="gc-detail-val">{selectedRequest.office?.officeName}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Address</span>
                    <span className="gc-detail-val">{selectedRequest.office?.address}</span>
                  </div>
                </div>

                <div className="gc-details-col gc-photo-col">
                  <h4 className="gc-details-section-title">Device Verification Photo</h4>
                  {selectedRequest.photoPath && !imageError ? (
                    <div className="gc-modal-photo-wrapper">
                      <img
                        src={getImageUrl(selectedRequest.photoPath)}
                        alt="E-Waste"
                        className="gc-modal-photo"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="gc-no-photo-box">
                      <span>📷 No photo attached or image preview unavailable</span>
                    </div>
                  )}
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
    </div>
  );
};

export default PickupRequestHistory;
