import React, { useState, useEffect } from 'react';
import { pickupRequestService } from '../api/pickupRequestService';
import { agentService } from '../../agent/api/agentService';
import { getImageUrl } from '../../../common/api/axiosConfig';
import InteractiveMap from '../../../common/components/InteractiveMap';
import './OfficeRequestDetailsModal.css';

const OfficeRequestDetailsModal = ({ request, open, onClose, onActionComplete }) => {
  const [responseMsg, setResponseMsg] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fullImageModal, setFullImageModal] = useState(false);

  // Available office agents
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Scheduling details
  const [collectorName, setCollectorName] = useState(request?.collectorName || '');
  const [collectorPhone, setCollectorPhone] = useState(request?.collectorPhoneNumber || '');
  const [pickupDate, setPickupDate] = useState(
    request?.pickupDate || new Date().toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState(request?.pickupTime || '10:00');

  // Next status
  const [nextStatus, setNextStatus] = useState('');

  useEffect(() => {
    if (open) {
      loadOfficeAgents();
      if (request) {
        setCollectorName(request.collectorName || (request.agent ? request.agent.fullName : ''));
        setCollectorPhone(request.collectorPhoneNumber || (request.agent ? request.agent.mobileNumber : ''));
        if (request.agent) {
          setSelectedAgentId(String(request.agent.id));
        }
      }
    }
  }, [open, request]);

  const loadOfficeAgents = async () => {
    try {
      const data = await agentService.getOfficeAgents();
      if (Array.isArray(data)) {
        setAvailableAgents(data.filter((a) => a.status === 'ACTIVE'));
      }
    } catch (err) {
      console.warn('Could not load office agents:', err);
    }
  };

  const handleAgentSelect = (e) => {
    const agentId = e.target.value;
    setSelectedAgentId(agentId);
    if (!agentId) return;

    const agent = availableAgents.find((a) => String(a.id) === String(agentId));
    if (agent) {
      setCollectorName(agent.fullName);
      setCollectorPhone(agent.mobileNumber);
    }
  };

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

  const handleAssignAgentOrCollector = async () => {
    if (!collectorName || !collectorPhone || !pickupDate || !pickupTime) {
      alert('Please select an agent or provide agent name, contact number, pickup date and time.');
      return;
    }

    setLoading(true);
    try {
      if (selectedAgentId) {
        await pickupRequestService.assignAgent(
          request.id,
          Number(selectedAgentId),
          pickupDate,
          pickupTime
        );
      } else {
        await pickupRequestService.assignCollector(
          request.id,
          collectorName,
          collectorPhone,
          pickupDate,
          pickupTime
        );
      }
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to assign agent:', err);
      alert('Failed to assign collection agent. Please check connection and try again.');
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

  const userLocationObj =
    request.latitude && request.longitude
      ? { lat: request.latitude, lng: request.longitude }
      : null;

  const assignedAgentObj = request.agent || (request.collectorName ? {
    fullName: request.collectorName,
    mobileNumber: request.collectorPhoneNumber,
  } : null);

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
                    <span className="gc-detail-key">Citizen Name</span>
                    <span className="gc-detail-val">{request.user?.name}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Mobile Number</span>
                    <span className="gc-detail-val">
                      {request.user?.phoneNumber ? (
                        <a href={`tel:${request.user.phoneNumber}`} className="gc-link">
                          📱 {request.user.phoneNumber}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Email Address</span>
                    <span className="gc-detail-val">{request.user?.email}</span>
                  </div>
                  <div className="gc-detail-pair">
                    <span className="gc-detail-key">Pickup Address</span>
                    <span className="gc-detail-val">{request.userLocation || request.user?.address || 'GPS coordinates only'}</span>
                  </div>
                </div>

                {/* Assigned Agent Box if assigned */}
                {assignedAgentObj && (
                  <div className="gc-card-subpanel" style={{ marginTop: '16px', background: 'rgba(0, 212, 255, 0.05)', borderColor: 'rgba(0, 212, 255, 0.25)' }}>
                    <h4 className="gc-subpanel-title" style={{ color: '#00d4ff' }}>👮 Assigned Collection Agent</h4>
                    <div className="gc-detail-pair">
                      <span className="gc-detail-key">Agent Name</span>
                      <span className="gc-detail-val" style={{ color: '#00ff88', fontWeight: '700' }}>
                        {assignedAgentObj.fullName} {request.agent?.employeeId ? `(${request.agent.employeeId})` : ''}
                      </span>
                    </div>
                    <div className="gc-detail-pair">
                      <span className="gc-detail-key">Agent Mobile</span>
                      <span className="gc-detail-val">
                        <a href={`tel:${assignedAgentObj.mobileNumber}`} className="gc-link" style={{ color: '#00d4ff' }}>
                          📱 {assignedAgentObj.mobileNumber}
                        </a>
                      </span>
                    </div>
                    {request.pickupDate && (
                      <div className="gc-detail-pair">
                        <span className="gc-detail-key">Scheduled Window</span>
                        <span className="gc-detail-val">{request.pickupDate} {request.pickupTime ? `at ${request.pickupTime}` : ''}</span>
                      </div>
                    )}
                    {request.agentRemarks && (
                      <div className="gc-detail-pair">
                        <span className="gc-detail-key">Agent Remarks</span>
                        <span className="gc-detail-val">{request.agentRemarks}</span>
                      </div>
                    )}
                  </div>
                )}

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
                    <span className="gc-detail-val">{request.quantity} unit(s)</span>
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

              {/* Right Column: Uploaded Image & Interactive Map */}
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
                  <h4 className="gc-subpanel-title">📍 User Pickup vs Office Location</h4>
                  <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                    <InteractiveMap
                      userLocation={userLocationObj}
                      offices={request.office ? [request.office] : []}
                      selectedOffice={request.office}
                      height="200px"
                      showRoute={true}
                    />
                  </div>
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

            {/* ACCEPTED / ASSIGNED: Schedule & Assign Collection Agent */}
            {(request.status === 'ACCEPTED' || request.status === 'PENDING') && (
              <div className="gc-workflow-box">
                <h4 className="gc-workflow-title">🚚 Assign Registered Collection Agent & Schedule Window</h4>
                
                {availableAgents.length > 0 && (
                  <div className="gc-field-group" style={{ marginBottom: '14px' }}>
                    <label className="gc-input-label">Select Office Agent *</label>
                    <select
                      className="gc-select-field"
                      value={selectedAgentId}
                      onChange={handleAgentSelect}
                    >
                      <option value="">-- Choose Verified Field Agent --</option>
                      {availableAgents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          👮 {ag.fullName} ({ag.mobileNumber}) - {ag.employeeId || `AGT-${ag.id}`} [{ag.assignedRequestsCount || 0} active pickups]
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="gc-workflow-grid">
                  <div className="gc-field-group">
                    <label className="gc-input-label">Collector / Agent Name *</label>
                    <input
                      type="text"
                      className="gc-input-field"
                      placeholder="e.g. Arun Kumar"
                      value={collectorName}
                      onChange={(e) => setCollectorName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="gc-field-group">
                    <label className="gc-input-label">Collector Mobile *</label>
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

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="gc-btn-primary"
                    disabled={!collectorName || !collectorPhone || loading}
                    onClick={handleAssignAgentOrCollector}
                  >
                    {loading ? 'Assigning Agent…' : '👮 Assign Collection Agent & Notify'}
                  </button>
                </div>
              </div>
            )}

            {/* Advance Recycling Pipeline for SCHEDULED, COLLECTED, RECEIVED_AT_OFFICE */}
            {(request.status === 'PICKUP_SCHEDULED' || request.status === 'ON_THE_WAY' || request.status === 'COLLECTED' || request.status === 'RECEIVED_AT_OFFICE') && (
              <div className="gc-workflow-box">
                <h4 className="gc-workflow-title">♻️ Advance Recycling Pipeline</h4>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: '240px' }}>
                    <select
                      className="gc-select-field"
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                    >
                      <option value="">-- Choose Next Status --</option>
                      {(request.status === 'PICKUP_SCHEDULED' || request.status === 'ON_THE_WAY') && (
                        <option value="COLLECTED">COLLECTED (Agent picked up device)</option>
                      )}
                      {(request.status === 'PICKUP_SCHEDULED' || request.status === 'ON_THE_WAY' || request.status === 'COLLECTED') && (
                        <option value="RECEIVED_AT_OFFICE">RECEIVED_AT_OFFICE (Arrived at Facility)</option>
                      )}
                      {(request.status === 'COLLECTED' || request.status === 'RECEIVED_AT_OFFICE') && (
                        <>
                          <option value="RECYCLED">RECYCLED (Certified & Eco-Disposed)</option>
                          <option value="COMPLETED">COMPLETED (Award Reward Points)</option>
                        </>
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
                    className="gc-btn-danger"
                    disabled={!responseMsg.trim() || loading}
                    onClick={handleReject}
                  >
                    Confirm Rejection
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="gc-btn-secondary"
                      style={{ color: '#ff8a80', borderColor: 'rgba(255, 82, 82, 0.4)' }}
                      onClick={() => setIsRejecting(true)}
                      disabled={loading}
                    >
                      Reject Request
                    </button>
                    <button
                      type="button"
                      className="gc-btn-primary"
                      onClick={handleAccept}
                      disabled={loading}
                    >
                      Accept Request
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full Size Image Lightbox */}
      {fullImageModal && (
        <div className="gc-lightbox-backdrop" onClick={() => setFullImageModal(false)}>
          <div className="gc-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt="E-Waste Full View" className="gc-lightbox-img" />
            <button
              type="button"
              className="gc-lightbox-close"
              onClick={() => setFullImageModal(false)}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OfficeRequestDetailsModal;
