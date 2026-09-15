import React, { useState, useContext } from 'react';
import { AuthContext } from '../../user/context/AuthContext';
import GlassBackground from '../../../common/components/GlassBackground';
import GlassNavbar from '../../../common/components/GlassNavbar';
import OfficeList from '../components/OfficeList';
import OfficeForm from '../components/OfficeForm';
import OfficeRequestList from '../../pickup/components/OfficeRequestList';
import './OfficeDashboard.css';

const OfficeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [editingOffice, setEditingOffice] = useState(null);

  const handleTabChange = (index) => {
    setTabIndex(index);
    if (index === 0) {
      setEditingOffice(null);
    }
  };

  const handleEdit = (office) => {
    setEditingOffice(office);
    setTabIndex(1);
  };

  const handleSaveSuccess = () => {
    setEditingOffice(null);
    setTabIndex(0);
  };

  if (!user) return null;

  return (
    <div className="gc-office-dash-root">
      <GlassBackground />
      <GlassNavbar />

      <main className="gc-office-dash-container">
        {/* Header section */}
        <section className="gc-office-dash-header">
          <div>
            <span className="gc-badge-portal" style={{ color: '#00d4ff', borderColor: 'rgba(0, 212, 255, 0.3)', background: 'rgba(0, 212, 255, 0.1)' }}>
              Office Management Portal
            </span>
            <h1 className="gc-dash-heading">
              Collection Center & Operations Console
            </h1>
            <p className="gc-dash-subheading">
              Manage authorized regional collection facilities, supervise incoming disposal requests, and coordinate logistical pickups.
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="gc-office-tabs-bar">
          <div className="gc-tabs-header">
            <button
              className={`gc-tab-button ${tabIndex === 0 ? 'active' : ''}`}
              onClick={() => handleTabChange(0)}
            >
              🏢 Offices Directory
            </button>
            <button
              className={`gc-tab-button ${tabIndex === 1 ? 'active' : ''}`}
              onClick={() => handleTabChange(1)}
            >
              {editingOffice ? '✏️ Edit Office' : '➕ Register Hub'}
            </button>
            <button
              className={`gc-tab-button ${tabIndex === 2 ? 'active' : ''}`}
              onClick={() => handleTabChange(2)}
            >
              📥 Incoming Requests
            </button>
          </div>
        </div>

        {/* Tab 0: Office List */}
        {tabIndex === 0 && (
          <div className="gc-glass-card gc-office-content-card">
            <OfficeList onEdit={handleEdit} />
          </div>
        )}

        {/* Tab 1: Office Form */}
        {tabIndex === 1 && (
          <div className="gc-glass-card gc-office-content-card" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <OfficeForm office={editingOffice} onSuccess={handleSaveSuccess} />
          </div>
        )}

        {/* Tab 2: Incoming Requests */}
        {tabIndex === 2 && (
          <div className="gc-glass-card gc-office-content-card">
            <OfficeRequestList />
          </div>
        )}
      </main>
    </div>
  );
};

export default OfficeDashboard;
