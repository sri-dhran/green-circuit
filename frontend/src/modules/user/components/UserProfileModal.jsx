import React, { useState, useEffect } from 'react';
import { userService } from '../api/userService';

const UserProfileModal = ({ user, open, onClose, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobileNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile();
      if (data) {
        setFormData({
          name: data.name || '',
          mobileNumber: data.phoneNumber || '',
          address: data.address || '',
          city: data.city || '',
        });
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateMobile = (mobile) => {
    if (!mobile || !mobile.trim()) return false;
    const cleaned = mobile.replace(/[\s\-()]/g, '');
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    if (formData.mobileNumber && !validateMobile(formData.mobileNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210).');
      return;
    }

    setLoading(true);
    try {
      const updated = await userService.updateProfile({
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        city: formData.city,
      });
      setSuccess(true);
      if (onProfileUpdated) onProfileUpdated(updated);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || err.message || 'Unable to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="gc-modal-backdrop" onClick={onClose}>
      <div
        className="gc-modal-window gc-req-details-modal"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gc-modal-header">
          <div>
            <span className="gc-badge-portal" style={{ color: '#00e676', borderColor: 'rgba(0, 230, 118, 0.3)', background: 'rgba(0, 230, 118, 0.1)' }}>
              Citizen Profile & Contact
            </span>
            <h3 className="gc-modal-title" style={{ marginTop: '4px' }}>Edit Account Profile</h3>
            <p className="gc-modal-subtitle">
              Provide your mobile number and address so collection agents can coordinate doorstep e-waste pickups.
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

          {success ? (
            <div className="gc-create-agent-success" style={{ padding: '28px 16px' }}>
              <div className="gc-success-icon" style={{ width: '46px', height: '46px', fontSize: '1.5rem', marginBottom: '10px' }}>✓</div>
              <h4 style={{ color: '#ffffff', margin: 0 }}>Profile Updated Successfully!</h4>
              <p style={{ fontSize: '0.84rem', margin: '4px 0 0 0' }}>Your verified contact details will be used for logistics coordination.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="gc-field-group">
                <label htmlFor="name" className="gc-field-label">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="gc-input"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="gc-field-group">
                <label htmlFor="mobileNumber" className="gc-field-label">
                  Mobile Number (Primary Pickup Contact) *
                </label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  className="gc-input"
                  placeholder="+91 9876543210"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
                <span className="gc-field-hint">
                  Your phone number will only be shared with your assigned collection agent for pickup verification.
                </span>
              </div>

              <div className="gc-field-group">
                <label htmlFor="address" className="gc-field-label">Primary Residential Address (Optional)</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="gc-input"
                  placeholder="Apartment, Street, Area"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="gc-field-group">
                <label htmlFor="city" className="gc-field-label">City / Town</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="gc-input"
                  placeholder="e.g. Chennai, Coimbatore"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="gc-modal-footer" style={{ marginTop: '8px', paddingBottom: 0 }}>
                <button type="button" className="gc-btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="gc-btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Profile & Mobile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
