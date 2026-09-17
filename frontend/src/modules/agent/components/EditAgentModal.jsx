import React, { useState } from 'react';
import { agentService } from '../api/agentService';

const EditAgentModal = ({ agent, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: agent.fullName || '',
    mobileNumber: agent.mobileNumber || '',
    employeeId: agent.employeeId || '',
    address: agent.address || '',
    city: agent.city || '',
    state: agent.state || 'Tamil Nadu',
    pincode: agent.pincode || '',
    profileImageUrl: agent.profileImageUrl || '',
    status: agent.status || 'ACTIVE',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setError('Agent name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    try {
      await agentService.updateAgent(agent.id, formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error updating agent:', err);
      setError(err.response?.data?.message || err.message || 'Unable to update agent profile.');
      setLoading(false);
    }
  };

  return (
    <div className="gc-modal-backdrop" onClick={onClose}>
      <div
        className="gc-modal-window gc-req-details-modal"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gc-modal-header">
          <div>
            <span className="gc-badge-portal" style={{ color: '#00d4ff', borderColor: 'rgba(0, 212, 255, 0.3)', background: 'rgba(0, 212, 255, 0.1)' }}>
              Edit Agent Profile
            </span>
            <h3 className="gc-modal-title" style={{ marginTop: '4px' }}>{agent.fullName}</h3>
            <p className="gc-modal-subtitle">
              Update contact info, badge ID, and status for this logistics officer.
            </p>
          </div>
          <button type="button" className="gc-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="gc-form-error-banner" style={{ margin: '0 0 16px 0' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="gc-form-grid-2">
            <div className="gc-field-group">
              <label htmlFor="fullName" className="gc-field-label">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="gc-input"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="gc-field-group">
              <label htmlFor="employeeId" className="gc-field-label">Employee / Badge ID</label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                className="gc-input"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="gc-form-grid-2">
            <div className="gc-field-group">
              <label htmlFor="mobileNumber" className="gc-field-label">Mobile Number</label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                className="gc-input"
                required
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>
            <div className="gc-field-group">
              <label htmlFor="status" className="gc-field-label">Account Status</label>
              <select
                id="status"
                name="status"
                className="gc-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE" style={{ background: '#0a1a12', color: '#fff' }}>ACTIVE (Available)</option>
                <option value="INACTIVE" style={{ background: '#0a1a12', color: '#fff' }}>INACTIVE (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="gc-field-group">
            <label htmlFor="address" className="gc-field-label">Operating / Hub Address</label>
            <input
              id="address"
              name="address"
              type="text"
              className="gc-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="gc-form-grid-3">
            <div className="gc-field-group">
              <label htmlFor="city" className="gc-field-label">City</label>
              <input
                id="city"
                name="city"
                type="text"
                className="gc-input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="gc-field-group">
              <label htmlFor="state" className="gc-field-label">State</label>
              <input
                id="state"
                name="state"
                type="text"
                className="gc-input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="gc-field-group">
              <label htmlFor="pincode" className="gc-field-label">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                className="gc-input"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="gc-modal-footer" style={{ marginTop: '12px', paddingBottom: 0 }}>
            <button type="button" className="gc-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="gc-btn-primary" disabled={loading}>
              {loading ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAgentModal;
