import React, { useState, useRef } from 'react';
import { pickupRequestService } from '../api/pickupRequestService';
import { officeService } from '../../center/api/officeService';
import InteractiveMap from '../../../common/components/InteractiveMap';
import './PickupRequestForm.css';

const categories = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Television', 'Home Appliance', 'Batteries & Chargers', 'Accessories', 'Other E-Waste'];

const COIMBATORE_DEFAULT = { lat: 10.9018, lng: 76.9962 }; // Malumichampatti, Coimbatore

const PickupRequestForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceCategory: '',
    brand: '',
    model: '',
    quantity: 1,
    description: '',
    approximateWeight: '',
    userLocation: ''
  });

  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map & Location State
  const [userCoords, setUserCoords] = useState(COIMBATORE_DEFAULT);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [offices, setOffices] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileProcess = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    handleFileProcess(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Real Geolocation handling
  const requestCurrentLocation = (autoSelectFirst = false) => {
    setLocationStatus('Acquiring real-time GPS coordinates…');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          const newCoords = { lat, lng };
          setUserCoords(newCoords);
          setGpsActive(true);
          setGpsAccuracy(accuracy);
          setLocationStatus(`GPS Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)} (±${accuracy}m accuracy)`);

          if (!formData.userLocation) {
            setFormData((prev) => ({
              ...prev,
              userLocation: `Pickup Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
            }));
          }

          loadOffices(newCoords, autoSelectFirst);
        },
        (err) => {
          console.warn('Geolocation access error or denied:', err);
          setGpsActive(false);
          setLocationStatus('GPS unavailable or permission denied. Defaulted to Coimbatore area. You can click on map or edit address.');
          loadOffices(COIMBATORE_DEFAULT, autoSelectFirst);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('Geolocation not supported by browser. Showing all Coimbatore facilities.');
      loadOffices(COIMBATORE_DEFAULT, autoSelectFirst);
    }
  };

  const loadOffices = async (coords, autoSelectFirst = false) => {
    setMapLoading(true);
    try {
      let data = await officeService.getNearbyCenters(coords.lat, coords.lng, 100.0);
      if (!data || data.length === 0) {
        data = await officeService.getAllOffices();
      }
      const activeList = Array.isArray(data) ? data.filter(o => o.status === 'ACTIVE' || !o.status) : [];
      setOffices(activeList);

      if (autoSelectFirst && activeList.length > 0 && !selectedOffice) {
        setSelectedOffice(activeList[0]);
      }
    } catch (err) {
      console.warn('Could not fetch nearby offices, fetching all:', err);
      try {
        const all = await officeService.getAllOffices();
        setOffices(Array.isArray(all) ? all : []);
      } catch (err2) {
        console.error('Failed to load offices:', err2);
      }
    } finally {
      setMapLoading(false);
    }
  };

  const handleOpenMapModal = () => {
    if (!formData.deviceName || !formData.deviceCategory || !formData.description || !file) {
      setError('Please fill in Device Name, Category, Description and upload a photo first.');
      return;
    }
    setError(null);
    setShowMapModal(true);
    requestCurrentLocation(false);
  };

  const handleSelectOffice = (office) => {
    setSelectedOffice(office);
    setShowMapModal(false);
  };

  const handleMapPinChange = (newCoords) => {
    setUserCoords(newCoords);
    setFormData((prev) => ({
      ...prev,
      userLocation: `Pickup Coordinates: ${newCoords.lat.toFixed(5)}, ${newCoords.lng.toFixed(5)}`
    }));
    loadOffices(newCoords, false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffice) {
      setError('Please select an authorized collection office on the map before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('officeId', selectedOffice.id || selectedOffice.officeId);
    data.append('deviceName', formData.deviceName);
    data.append('deviceCategory', formData.deviceCategory);
    data.append('brand', formData.brand || '');
    data.append('model', formData.model || '');
    data.append('quantity', formData.quantity);
    data.append('description', formData.description);
    if (formData.approximateWeight) data.append('approximateWeight', formData.approximateWeight);
    if (formData.userLocation) data.append('userLocation', formData.userLocation);
    data.append('file', file);
    if (userCoords) {
      data.append('latitude', userCoords.lat);
      data.append('longitude', userCoords.lng);
    }

    try {
      await pickupRequestService.createRequest(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Request submission failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit pickup request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gc-pickup-form-wrapper">
      <div className="gc-form-header">
        <div className="gc-form-title-group">
          <span className="gc-form-badge">E-Waste Submission</span>
          <h2 className="gc-form-heading">Request Responsible E-Waste Recycling</h2>
          <p className="gc-form-subheading">
            Submit your electronic devices for verified pickup, certified eco-recycling, and earn Green Points.
          </p>
        </div>
      </div>

      {error && (
        <div className="gc-form-error-banner" role="alert">
          <span>⚠️ {error}</span>
          <button type="button" className="gc-banner-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {!selectedOffice ? (
        <div className="gc-form-grid">
          {/* Left Column: Device Details */}
          <div className="gc-form-col">
            <div className="gc-field-group">
              <label className="gc-input-label">Device Name *</label>
              <input
                type="text"
                className="gc-input-field"
                name="deviceName"
                placeholder="e.g. Dell Inspiron 15, iPhone 12, Smart TV, Tablet"
                value={formData.deviceName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="gc-field-row">
              <div className="gc-field-group" style={{ flex: 1 }}>
                <label className="gc-input-label">Device Category *</label>
                <select
                  className="gc-select-field"
                  name="deviceCategory"
                  value={formData.deviceCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="gc-field-group" style={{ width: '120px' }}>
                <label className="gc-input-label">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className="gc-input-field"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="gc-field-row">
              <div className="gc-field-group" style={{ flex: 1 }}>
                <label className="gc-input-label">Brand</label>
                <input
                  type="text"
                  className="gc-input-field"
                  name="brand"
                  placeholder="e.g. Apple, Lenovo, Samsung, HP"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="gc-field-group" style={{ flex: 1 }}>
                <label className="gc-input-label">Model</label>
                <input
                  type="text"
                  className="gc-input-field"
                  name="model"
                  placeholder="e.g. A2179, Pavilion 14"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="gc-field-group">
              <label className="gc-input-label">Approximate Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="gc-input-field"
                name="approximateWeight"
                placeholder="e.g. 2.5"
                value={formData.approximateWeight}
                onChange={handleChange}
              />
            </div>

            <div className="gc-field-group">
              <label className="gc-input-label">Device Condition & Description *</label>
              <textarea
                rows="3"
                className="gc-input-field"
                name="description"
                placeholder="Describe condition: dead motherboard, broken screen, swollen battery, working but obsolete, etc."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="gc-field-group">
              <label className="gc-input-label">Your Pickup Address / Landmark</label>
              <input
                type="text"
                className="gc-input-field"
                name="userLocation"
                placeholder="Enter street, apartment, landmark, or set via GPS pin"
                value={formData.userLocation}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Right Column: Photo Upload Drag-and-Drop */}
          <div className="gc-form-col">
            <label className="gc-input-label">Device Verification Photo * (JPG, PNG, WEBP)</label>

            <div
              className={`gc-upload-zone ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-image' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {imagePreview ? (
                <div className="gc-preview-container">
                  <img src={imagePreview} alt="Device Preview" className="gc-preview-img" />
                  <div className="gc-preview-overlay">
                    <button
                      type="button"
                      className="gc-btn-secondary"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      className="gc-btn-danger"
                      onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gc-upload-prompt">
                  <div className="gc-upload-icon">📸</div>
                  <span className="gc-upload-main-text">Drag & drop photo here</span>
                  <span className="gc-upload-sub-text">or click to browse files</span>
                  <div className="gc-upload-pill">High quality photo helps collectors verify faster</div>
                </div>
              )}
            </div>

            {/* Action button to open map */}
            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="gc-btn-primary"
                style={{ width: '100%', padding: '14px 20px', fontSize: '1rem' }}
                onClick={handleOpenMapModal}
              >
                <span>📍 Choose Collection Office on Live Map</span>
              </button>
              <p className="gc-hint-text">
                Next step: Pinpoint your pickup coordinates and select an authorized Coimbatore center.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmation Card when Office is selected */
        <div className="gc-confirmation-view">
          <div className="gc-glass-card gc-confirm-card">
            <div className="gc-confirm-header">
              <div>
                <span className="gc-chip gc-chip-collected">Authorized Center Selected</span>
                <h3 className="gc-confirm-title">
                  {selectedOffice.officeName || selectedOffice.name}
                </h3>
                <p className="gc-confirm-subtitle">
                  📍 {selectedOffice.address}
                  {selectedOffice.phoneNumber && ` • 📞 ${selectedOffice.phoneNumber}`}
                </p>
              </div>
              <button
                type="button"
                className="gc-btn-secondary"
                onClick={() => setSelectedOffice(null)}
              >
                Change Office
              </button>
            </div>

            <div className="gc-confirm-summary-grid">
              <div className="gc-confirm-details">
                <div className="gc-summary-row">
                  <span className="gc-summary-label">Device</span>
                  <span className="gc-summary-value">{formData.deviceName} ({formData.deviceCategory})</span>
                </div>
                <div className="gc-summary-row">
                  <span className="gc-summary-label">Brand & Model</span>
                  <span className="gc-summary-value">{formData.brand || 'N/A'} {formData.model || ''}</span>
                </div>
                <div className="gc-summary-row">
                  <span className="gc-summary-label">Quantity & Weight</span>
                  <span className="gc-summary-value">{formData.quantity} unit(s) {formData.approximateWeight ? `• ~${formData.approximateWeight} kg` : ''}</span>
                </div>
                <div className="gc-summary-row">
                  <span className="gc-summary-label">Pickup Address</span>
                  <span className="gc-summary-value">{formData.userLocation || `Coordinates: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`}</span>
                </div>
                <div className="gc-summary-row">
                  <span className="gc-summary-label">Condition</span>
                  <span className="gc-summary-value">{formData.description}</span>
                </div>
              </div>

              {imagePreview && (
                <div className="gc-confirm-photo-box">
                  <img src={imagePreview} alt="E-Waste" className="gc-confirm-img" />
                </div>
              )}
            </div>

            <div className="gc-confirm-actions">
              {onCancel && (
                <button
                  type="button"
                  className="gc-btn-secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="gc-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ minWidth: '240px' }}
              >
                {loading ? 'Submitting Request…' : '🚀 Confirm & Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Glass Map Modal for Office Selection ── */}
      {showMapModal && (
        <div className="gc-modal-backdrop" onClick={() => setShowMapModal(false)}>
          <div className="gc-modal-window gc-map-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gc-modal-header">
              <div>
                <h3 className="gc-modal-title">Select Nearby Authorized Center</h3>
                <p className="gc-modal-subtitle">
                  Verify your pickup location and choose a certified Coimbatore facility.
                </p>
              </div>
              <button
                type="button"
                className="gc-modal-close-btn"
                onClick={() => setShowMapModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="gc-modal-body">
              {/* GPS status and refresh controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 230, 118, 0.08)',
                border: '1px solid rgba(0, 230, 118, 0.2)',
                borderRadius: '12px',
                padding: '10px 16px',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{gpsActive ? '🛰️' : '📍'}</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#00ff88', display: 'block' }}>
                      {gpsActive ? 'Real GPS Location Active' : 'Pickup Coordinate Selection'}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {locationStatus || 'Click anywhere on map to reposition your pickup pin'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="gc-btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={() => requestCurrentLocation(false)}
                >
                  🔄 Recalibrate GPS
                </button>
              </div>

              {mapLoading ? (
                <div className="gc-map-loading">
                  <div className="gc-spinner" />
                  <span>Discovering authorized Coimbatore facilities…</span>
                </div>
              ) : (
                <>
                  {/* Interactive Map View */}
                  <div style={{ marginBottom: '20px' }}>
                    <InteractiveMap
                      userLocation={userCoords}
                      offices={offices}
                      selectedOffice={selectedOffice}
                      onSelectOffice={handleSelectOffice}
                      onLocationChange={handleMapPinChange}
                      allowLocationPick={true}
                      height="340px"
                      showRoute={true}
                    />
                  </div>

                  {/* Office Cards List */}
                  <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: '0 0 12px 0' }}>
                    Available Authorized Centers ({offices.length})
                  </h4>
                  <div className="gc-offices-grid">
                    {offices.map((office) => (
                      <div
                        key={office.id || office.officeId}
                        className={`gc-office-card ${selectedOffice?.id === office.id ? 'active' : ''}`}
                        onClick={() => handleSelectOffice(office)}
                      >
                        <div className="gc-office-top">
                          <span className="gc-office-icon">♻️</span>
                          <span className="gc-office-type">{office.type || 'E-Waste Center'}</span>
                        </div>
                        <h4 className="gc-office-name">{office.officeName || office.name}</h4>
                        <p className="gc-office-address">{office.address}</p>
                        {office.distanceKm != null && (
                          <div className="gc-office-distance">
                            <span>📍 ~{office.distanceKm} km away</span>
                          </div>
                        )}
                        {office.phoneNumber && (
                          <div className="gc-office-phone">📞 {office.phoneNumber}</div>
                        )}
                        <button
                          type="button"
                          className="gc-btn-primary gc-office-select-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOffice(office);
                          }}
                        >
                          Select This Center
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupRequestForm;
