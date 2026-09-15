import React, { useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { pickupRequestService } from '../api/pickupRequestService';
import { officeService } from '../../center/api/officeService';
import './PickupRequestForm.css';

const categories = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Accessories', 'Other'];

const mapContainerStyle = {
  width: '100%',
  height: '380px',
  borderRadius: '16px',
};

const centerDefault = { lat: 11.0168, lng: 76.9558 }; // Default Coimbatore

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

  // Map & Office State
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [offices, setOffices] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);

  const fileInputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

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

  const handleFindCollectors = () => {
    if (!formData.deviceName || !formData.deviceCategory || !formData.description || !file) {
      setError('Please fill in Device Name, Category, Description and upload a photo first.');
      return;
    }
    setError(null);
    setShowMapModal(true);
    setMapLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(currentLoc);
          if (!formData.userLocation) {
            setFormData((prev) => ({
              ...prev,
              userLocation: `GPS: ${currentLoc.lat.toFixed(4)}, ${currentLoc.lng.toFixed(4)}`
            }));
          }
          fetchNearbyOffices(currentLoc);
        },
        (err) => {
          console.warn('Geolocation unavailable or denied, falling back to default:', err);
          setLocation(centerDefault);
          fetchNearbyOffices(centerDefault);
        },
        { timeout: 8000 }
      );
    } else {
      setLocation(centerDefault);
      fetchNearbyOffices(centerDefault);
    }
  };

  const fetchNearbyOffices = async (currentLoc) => {
    try {
      let data = await officeService.getNearbyCenters(currentLoc.lat, currentLoc.lng, 50.0);
      if (!data || data.length === 0) {
        data = await officeService.getAllOffices();
      }
      setOffices(data || []);
      if (!data || data.length === 0) {
        setLocationError('No collection offices currently available. Please contact support.');
      } else {
        setLocationError(null);
      }
    } catch (error) {
      console.warn('Nearby offices failed, trying all offices:', error);
      try {
        const allOffices = await officeService.getAllOffices();
        if (allOffices && allOffices.length > 0) {
          setOffices(allOffices);
          setLocationError(null);
          return;
        }
      } catch (err2) {
        console.error('Failed to load all offices:', err2);
      }
      setLocationError('Unable to fetch collection offices. Please verify the backend is running.');
    } finally {
      setMapLoading(false);
    }
  };

  const handleSelectCollector = (office) => {
    setSelectedOffice(office);
    setShowMapModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffice) {
      setError('Please choose a collection office before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('officeId', selectedOffice.id || selectedOffice.officeId);
    data.append('deviceName', formData.deviceName);
    data.append('deviceCategory', formData.deviceCategory);
    data.append('brand', formData.brand);
    data.append('model', formData.model);
    data.append('quantity', formData.quantity);
    data.append('description', formData.description);
    if (formData.approximateWeight) data.append('approximateWeight', formData.approximateWeight);
    if (formData.userLocation) data.append('userLocation', formData.userLocation);
    data.append('file', file);
    if (location) {
      data.append('latitude', location.lat);
      data.append('longitude', location.lng);
    }

    try {
      await pickupRequestService.createRequest(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit pickup request. Please try again.');
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
            Submit your electronic devices for safe pickup, verified recycling, and earn Green Rewards.
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
                placeholder="e.g. MacBook Pro 15, iPhone 11, Dell Monitor"
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
                  placeholder="e.g. Apple, Samsung, HP"
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
                  placeholder="e.g. A1990, Galaxy S10"
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
                placeholder="Describe condition: battery swollen, screen cracked, doesn't turn on, etc."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="gc-field-group">
              <label className="gc-input-label">Your Pickup Address / Location</label>
              <input
                type="text"
                className="gc-input-field"
                name="userLocation"
                placeholder="Enter street, apartment, landmark, or let GPS detect"
                value={formData.userLocation}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Right Column: Photo Upload Drag-and-Drop */}
          <div className="gc-form-col">
            <label className="gc-input-label">Device Photo * (JPG, PNG, WEBP)</label>

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
                onClick={handleFindCollectors}
              >
                <span>📍 Choose Collection Office & Map</span>
              </button>
              <p className="gc-hint-text">
                Next step: Select an authorized recycling center nearest to your pickup location.
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
                <span className="gc-chip gc-chip-collected">Collector Selected</span>
                <h3 className="gc-confirm-title">
                  {selectedOffice.officeName || selectedOffice.name}
                </h3>
                <p className="gc-confirm-subtitle">
                  📍 {selectedOffice.area || selectedOffice.city || selectedOffice.address}
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
                  <span className="gc-summary-value">{formData.quantity} item(s) {formData.approximateWeight ? `• ~${formData.approximateWeight} kg` : ''}</span>
                </div>
                <div className="gc-summary-row">
                  <span className="gc-summary-label">Pickup Address</span>
                  <span className="gc-summary-value">{formData.userLocation || 'Location marked on map'}</span>
                </div>
                <div className="gc-summary-row">
                  <span className="gc-summary-label">Description</span>
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
                style={{ minWidth: '220px' }}
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
                <h3 className="gc-modal-title">Select Nearby Collection Center</h3>
                <p className="gc-modal-subtitle">
                  Choose the facility that will collect and responsibly process your e-waste.
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
              {locationError && (
                <div className="gc-form-error-banner" style={{ marginBottom: '16px' }}>
                  <span>⚠️ {locationError}</span>
                  <button
                    type="button"
                    className="gc-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', marginLeft: '12px' }}
                    onClick={handleFindCollectors}
                  >
                    Retry
                  </button>
                </div>
              )}

              {mapLoading ? (
                <div className="gc-map-loading">
                  <div className="gc-spinner" />
                  <span>Discovering nearest authorized collectors…</span>
                </div>
              ) : (
                <>
                  {/* Office Cards List */}
                  <div className="gc-offices-grid">
                    {offices.map((office) => (
                      <div
                        key={office.id || office.officeId}
                        className={`gc-office-card ${selectedMarker?.id === office.id ? 'active' : ''}`}
                        onClick={() => setSelectedMarker(office)}
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
                            handleSelectCollector(office);
                          }}
                        >
                          Select Office
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Google Map View */}
                  {isLoaded && (
                    <div className="gc-map-view-container">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={location || centerDefault}
                        zoom={location ? 12 : 11}
                        options={{
                          styles: [
                            { elementType: 'geometry', stylers: [{ color: '#0f2419' }] },
                            { elementType: 'labels.text.stroke', stylers: [{ color: '#091811' }] },
                            { elementType: 'labels.text.fill', stylers: [{ color: '#749882' }] },
                            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#00e676' }] },
                            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a3c2b' }] },
                            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#051b14' }] }
                          ]
                        }}
                      >
                        {/* User Location Marker */}
                        {location && (
                          <Marker
                            position={location}
                            title="Your Location"
                            icon={{
                              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                            }}
                          />
                        )}

                        {/* Office Markers */}
                        {offices.map((office) => (
                          <Marker
                            key={office.id || office.officeId}
                            position={{ lat: office.latitude, lng: office.longitude }}
                            title={office.officeName || office.name}
                            icon={{
                              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                            }}
                            onClick={() => setSelectedMarker(office)}
                          />
                        ))}

                        {/* Info Window */}
                        {selectedMarker && (
                          <InfoWindow
                            position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                            onCloseClick={() => setSelectedMarker(null)}
                          >
                            <div className="gc-map-infowindow">
                              <h5 style={{ margin: '0 0 4px', color: '#00c967' }}>
                                {selectedMarker.officeName || selectedMarker.name}
                              </h5>
                              <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#333' }}>
                                {selectedMarker.address}
                              </p>
                              {selectedMarker.distanceKm && (
                                <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#666' }}>
                                  Distance: {selectedMarker.distanceKm} km
                                </p>
                              )}
                              <button
                                type="button"
                                style={{
                                  background: '#00c967',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  width: '100%'
                                }}
                                onClick={() => handleSelectCollector(selectedMarker)}
                              >
                                Choose This Center
                              </button>
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </div>
                  )}
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
