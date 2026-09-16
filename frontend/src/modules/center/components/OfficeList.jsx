import React, { useState, useEffect } from 'react';
import { officeService } from '../api/officeService';
import './OfficeList.css';

const OfficeList = ({ onEdit }) => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await officeService.getAllOffices();
      setOffices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching offices:', err);
      setError(err.response?.data?.message || err.message || 'Unable to fetch office directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (searchQuery.trim() === '') {
        fetchOffices();
      } else {
        const data = await officeService.searchOffices(searchQuery);
        setOffices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error searching offices:', err);
      setError('Search failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name || 'this office'}?`)) {
      try {
        await officeService.deleteOffice(id);
        fetchOffices();
      } catch (err) {
        console.error('Error deleting office:', err);
        setError('Failed to delete office.');
      }
    }
  };

  return (
    <div className="gc-office-list-wrapper">
      {/* Search & Action Bar */}
      <div className="gc-office-search-bar">
        <form onSubmit={handleSearch} className="gc-search-form">
          <div className="gc-search-input-wrapper">
            <span className="gc-search-icon">🔍</span>
            <input
              type="text"
              className="gc-input-field gc-search-input"
              placeholder="Search offices by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="gc-btn-primary" style={{ padding: '10px 20px' }}>
            Search
          </button>
          <button
            type="button"
            className="gc-btn-secondary"
            onClick={() => { setSearchQuery(''); fetchOffices(); }}
          >
            Reset
          </button>
        </form>
      </div>

      {error && (
        <div className="gc-form-error-banner" style={{ marginBottom: '16px' }}>
          <span>⚠️ {error}</span>
          <button type="button" className="gc-btn-secondary" onClick={fetchOffices}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="gc-history-loading">
          <div className="gc-spinner" />
          <span>Loading collection hubs…</span>
        </div>
      ) : offices.length === 0 ? (
        <div className="gc-glass-card gc-empty-history" style={{ margin: '20px 0' }}>
          <div className="gc-empty-icon">🏢</div>
          <h3>No Offices Found</h3>
          <p>No registered collection centers match your query. Try resetting your search.</p>
        </div>
      ) : (
        <div className="gc-table-container">
          <table className="gc-table gc-table-responsive">
            <thead>
              <tr>
                <th>Office Name</th>
                <th>Address & Region</th>
                <th>Contact</th>
                <th>Working Hours</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((office) => (
                <tr key={office.id || office.officeId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>♻️</span>
                      <div>
                        <strong style={{ color: '#ffffff', display: 'block' }}>
                          {office.officeName || office.name}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#00d4ff' }}>
                          {office.type || 'E-Waste Recycler'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--gc-text-secondary)', fontSize: '0.86rem' }}>
                        {office.address}
                      </span>
                      <span style={{ color: 'var(--gc-text-muted)', fontSize: '0.74rem' }}>
                        {office.city} {office.state ? `• ${office.state}` : ''} {office.pincode ? `(${office.pincode})` : ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--gc-text-secondary)', fontSize: '0.86rem' }}>
                      📞 {office.phoneNumber || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="gc-chip gc-chip-collected" style={{ textTransform: 'none' }}>
                      🕒 {office.workingHours || '9 AM - 6 PM'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="gc-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => onEdit(office)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="gc-btn-secondary gc-btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleDelete(office.id || office.officeId, office.officeName)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OfficeList;
