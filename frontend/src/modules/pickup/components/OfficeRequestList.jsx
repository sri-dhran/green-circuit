import React, { useState, useEffect } from 'react';
import { pickupRequestService } from '../api/pickupRequestService';
import OfficeRequestDetailsModal from './OfficeRequestDetailsModal';
import './OfficeRequestList.css';

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

const OfficeRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchRequests = async () => {
    try {
      const data = await pickupRequestService.getOfficeRequests();
      setRequests(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch incoming collection requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleActionComplete = () => {
    setSelectedRequest(null);
    fetchRequests();
  };

  const filteredRequests = statusFilter === 'ALL'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  return (
    <div className="gc-office-req-wrapper">
      {/* Header & Status Filter Bar */}
      <div className="gc-office-req-header">
        <div>
          <h3 className="gc-history-section-title">Incoming E-Waste Pickup Requests</h3>
          <p className="gc-history-section-sub">
            Review user submissions, verify uploaded equipment photos, and assign logistics agents.
          </p>
        </div>

        <div className="gc-filter-group">
          {['ALL', 'PENDING', 'ACCEPTED', 'PICKUP_SCHEDULED', 'COLLECTED', 'RECYCLED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`gc-filter-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="gc-form-error-banner" style={{ marginBottom: '16px' }}>
          <span>⚠️ {error}</span>
          <button type="button" className="gc-btn-secondary" onClick={fetchRequests}>Retry</button>
        </div>
      )}

      {loading && requests.length === 0 ? (
        <div className="gc-history-loading">
          <div className="gc-spinner" />
          <span>Fetching incoming collection requests…</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="gc-glass-card gc-empty-history" style={{ margin: '20px 0' }}>
          <div className="gc-empty-icon">📥</div>
          <h3>No Collection Requests Found</h3>
          <p>There are currently no collection requests under the selected status filter.</p>
        </div>
      ) : (
        <div className="gc-table-container">
          <table className="gc-table gc-table-responsive">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Requested Date</th>
                <th>User</th>
                <th>E-Waste Device</th>
                <th>Pickup Location</th>
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
                    <span className="gc-req-date">
                      {new Date(req.createdAt).toLocaleDateString()} • {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: '#ffffff' }}>{req.user?.name || 'User'}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gc-text-muted)' }}>{req.user?.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>{req.deviceName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gc-text-muted)' }}>
                        {req.deviceCategory} • {req.quantity} unit(s)
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', color: 'var(--gc-text-secondary)' }}>
                      {req.userLocation || 'Location marked on GPS'}
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
                      className="gc-btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      onClick={() => setSelectedRequest(req)}
                    >
                      View & Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRequest && (
        <OfficeRequestDetailsModal
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
};

export default OfficeRequestList;
