import React, { useState, useEffect } from 'react';
import { officeService } from '../api/officeService';
import './OfficeForm.css';

const OfficeForm = ({ office, onSuccess }) => {
  const [formData, setFormData] = useState({
    officeName: '',
    address: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    workingHours: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (office) {
      setFormData({
        officeName: office.officeName || office.name || '',
        address: office.address || '',
        latitude: office.latitude || '',
        longitude: office.longitude || '',
        phoneNumber: office.phoneNumber || '',
        workingHours: office.workingHours || ''
      });
    } else {
      setFormData({
        officeName: '',
        address: '',
        latitude: '',
        longitude: '',
        phoneNumber: '',
        workingHours: ''
      });
    }
  }, [office]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (office && (office.id || office.officeId)) {
        await officeService.updateOffice(office.id || office.officeId, formData);
      } else {
        await officeService.createOffice(formData);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save office details. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gc-office-form-wrapper">
      <div className="gc-form-header">
        <h3 className="gc-form-heading">
          {office ? 'Edit Collection Center' : 'Register New Collection Center'}
        </h3>
        <p className="gc-form-subheading">
          Configure office location coordinates, operating hours, and contact details for user routing.
        </p>
      </div>

      {error && (
        <div className="gc-form-error-banner" style={{ marginBottom: '20px' }}>
          <span>⚠️ {error}</span>
          <button type="button" className="gc-banner-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="gc-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="gc-field-group">
            <label className="gc-input-label">Office Name *</label>
            <input
              type="text"
              className="gc-input-field"
              name="officeName"
              placeholder="e.g. Coimbatore Green E-Hub"
              value={formData.officeName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="gc-field-group">
            <label className="gc-input-label">Phone Number *</label>
            <input
              type="text"
              className="gc-input-field"
              name="phoneNumber"
              placeholder="+91 98402 35929"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="gc-field-group" style={{ gridColumn: '1 / -1' }}>
            <label className="gc-input-label">Street Address & City *</label>
            <textarea
              rows="2"
              className="gc-input-field"
              name="address"
              placeholder="Industrial Estate, Main Road, City, Pincode"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="gc-field-group">
            <label className="gc-input-label">Latitude Coordinate *</label>
            <input
              type="number"
              step="any"
              className="gc-input-field"
              name="latitude"
              placeholder="e.g. 10.9018"
              value={formData.latitude}
              onChange={handleChange}
              required
            />
          </div>

          <div className="gc-field-group">
            <label className="gc-input-label">Longitude Coordinate *</label>
            <input
              type="number"
              step="any"
              className="gc-input-field"
              name="longitude"
              placeholder="e.g. 76.9962"
              value={formData.longitude}
              onChange={handleChange}
              required
            />
          </div>

          <div className="gc-field-group" style={{ gridColumn: '1 / -1' }}>
            <label className="gc-input-label">Operating Hours</label>
            <input
              type="text"
              className="gc-input-field"
              name="workingHours"
              placeholder="e.g. 9:00 AM - 6:00 PM (Mon - Sat)"
              value={formData.workingHours}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="gc-office-form-actions">
          <button
            type="button"
            className="gc-btn-secondary"
            onClick={() => onSuccess && onSuccess()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="gc-btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving…' : office ? '💾 Update Office' : '➕ Register Office'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfficeForm;
