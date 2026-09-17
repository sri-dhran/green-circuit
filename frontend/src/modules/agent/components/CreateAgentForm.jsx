import React, { useState } from 'react';
import { agentService } from '../api/agentService';
import './CreateAgentForm.css';

const CreateAgentForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    employeeId: '',
    profileImageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateMobile = (mobile) => {
    const cleaned = mobile.replace(/[\s\-()]/g, '');
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setError('Agent full name must be at least 2 characters.');
      return;
    }

    if (!validateMobile(formData.mobileNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210 or +91 9876543210).');
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address for the agent login.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters for secure agent authentication.');
      return;
    }

    setLoading(true);
    try {
      await agentService.createAgent(formData);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      console.error('Error creating agent:', err);
      setError(err.response?.data?.message || err.message || 'Unable to create collection agent. Please verify input and try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      mobileNumber: '',
      email: '',
      password: '',
      address: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      employeeId: '',
      profileImageUrl: '',
    });
    setError('');
  };

  return (
    <div className="gc-create-agent-card">
      <div className="gc-create-agent-header">
        <span className="gc-badge-portal" style={{ color: '#00e676', borderColor: 'rgba(0, 230, 118, 0.3)', background: 'rgba(0, 230, 118, 0.1)' }}>
          Logistics Staff Registration
        </span>
        <h2 className="gc-form-main-title">Register New Collection Agent</h2>
        <p className="gc-form-main-desc">
          Enroll a verified field logistics officer under this collection center to dispatch and process e-waste pickups.
        </p>
      </div>

      {error && (
        <div className="gc-form-error-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      {success ? (
        <div className="gc-create-agent-success">
          <div className="gc-success-icon">✓</div>
          <h3>Collection Agent Registered Successfully!</h3>
          <p>Login credentials have been provisioned and the agent is now available for pickup dispatch.</p>
        </div>
      ) : (
        <form className="gc-agent-form" onSubmit={handleSubmit} noValidate>
          {/* Section 1: Basic Identity & Login Credentials */}
          <div className="gc-form-sub-header">
            <h4>1. Agent Identity & Portal Credentials</h4>
          </div>

          <div className="gc-form-grid-2">
            <div className="gc-field-group">
              <label htmlFor="fullName" className="gc-field-label">
                Agent Full Name <span className="text-red">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="gc-input"
                placeholder="e.g. Arun Kumar"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="gc-field-group">
              <label htmlFor="employeeId" className="gc-field-label">
                Employee / Badge ID (Optional)
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                className="gc-input"
                placeholder="e.g. TEC-A005 (Auto-generated if empty)"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="gc-form-grid-2">
            <div className="gc-field-group">
              <label htmlFor="mobileNumber" className="gc-field-label">
                Mobile Number <span className="text-red">*</span>
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                className="gc-input"
                placeholder="e.g. +91 9876543210"
                required
                value={formData.mobileNumber}
                onChange={handleChange}
              />
              <span className="gc-field-hint">Used by citizens and offices to coordinate doorstep pickups.</span>
            </div>

            <div className="gc-field-group">
              <label htmlFor="email" className="gc-field-label">
                Email Address (Login Username) <span className="text-red">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="gc-input"
                placeholder="e.g. arun.agent@greencircuit.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="gc-form-grid-2">
            <div className="gc-field-group">
              <label htmlFor="password" className="gc-field-label">
                Temporary Password <span className="text-red">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="gc-input"
                placeholder="Minimum 6 characters"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <span className="gc-field-hint">The agent will use this password to log in to the mobile agent portal.</span>
            </div>

            <div className="gc-field-group">
              <label htmlFor="profileImageUrl" className="gc-field-label">
                Profile Photo URL (Optional)
              </label>
              <input
                id="profileImageUrl"
                name="profileImageUrl"
                type="url"
                className="gc-input"
                placeholder="https://example.com/avatar.jpg"
                value={formData.profileImageUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 2: Residential / Base Location */}
          <div className="gc-form-sub-header" style={{ marginTop: '16px' }}>
            <h4>2. Residential / Hub Location Details</h4>
          </div>

          <div className="gc-field-group">
            <label htmlFor="address" className="gc-field-label">
              Local Operating Address (Optional)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="gc-input"
              placeholder="Street address or designated dispatch hub"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="gc-form-grid-3">
            <div className="gc-field-group">
              <label htmlFor="city" className="gc-field-label">City / District</label>
              <input
                id="city"
                name="city"
                type="text"
                className="gc-input"
                placeholder="e.g. Coimbatore"
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
                placeholder="e.g. Tamil Nadu"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="gc-field-group">
              <label htmlFor="pincode" className="gc-field-label">Postal Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                className="gc-input"
                placeholder="e.g. 641001"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="gc-form-actions">
            {onCancel && (
              <button type="button" className="gc-btn-secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
            )}
            <button type="button" className="gc-btn-secondary" onClick={handleReset} disabled={loading}>
              Reset Form
            </button>
            <button type="submit" className="gc-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="gc-spinner" />
                  Creating Agent Account…
                </>
              ) : (
                'Create Collection Agent'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateAgentForm;
