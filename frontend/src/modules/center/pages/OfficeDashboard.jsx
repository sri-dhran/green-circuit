import React, { useState, useContext } from 'react';
import { AuthContext } from '../../user/context/AuthContext';
import GlassBackground from '../../../common/components/GlassBackground';
import GlassNavbar from '../../../common/components/GlassNavbar';
import OfficeList from '../components/OfficeList';
import OfficeForm from '../components/OfficeForm';
import OfficeRequestList from '../../pickup/components/OfficeRequestList';
import AgentList from '../../agent/components/AgentList';
import CreateAgentForm from '../../agent/components/CreateAgentForm';
import './OfficeDashboard.css';

const OfficeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tabIndex, setTabIndex] = useState(0); // 0: Requests, 1: Agents, 2: Register Agent, 3: Directory, 4: Register Hub
  const [editingOffice, setEditingOffice] = useState(null);

  const handleTabChange = (index) => {
    setTabIndex(index);
    if (index !== 4) {
      setEditingOffice(null);
    }
  };

  const handleEditOffice = (office) => {
    setEditingOffice(office);
    setTabIndex(4);
  };

  const handleOfficeSaveSuccess = () => {
    setEditingOffice(null);
    setTabIndex(3);
  };

  const handleAgentCreated = () => {
    setTabIndex(1); // switch to Agent Directory
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
              Office Operations Console
            </span>
            <h1 className="gc-dash-heading">
              Collection Center & Agent Dispatch Management
            </h1>
            <p className="gc-dash-subheading">
              Supervise regional e-waste collection requests, assign certified field logistics agents, and manage authorized recycling hubs.
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
              📥 Incoming Requests
            </button>
            <button
              className={`gc-tab-button ${tabIndex === 1 ? 'active' : ''}`}
              onClick={() => handleTabChange(1)}
            >
              👮 Collection Agents
            </button>
            <button
              className={`gc-tab-button ${tabIndex === 2 ? 'active' : ''}`}
              onClick={() => handleTabChange(2)}
            >
              ➕ Register Agent
            </button>
            <button
              className={`gc-tab-button ${tabIndex === 3 ? 'active' : ''}`}
              onClick={() => handleTabChange(3)}
            >
              🏢 Offices Directory
            </button>
            <button
              className={`gc-tab-button ${tabIndex === 4 ? 'active' : ''}`}
              onClick={() => handleTabChange(4)}
            >
              {editingOffice ? '✏️ Edit Office' : '➕ Register Hub'}
            </button>
          </div>
        </div>

        {/* Tab 0: Incoming Requests */}
        {tabIndex === 0 && (
          <div className="gc-glass-card gc-office-content-card">
            <OfficeRequestList />
          </div>
        )}

        {/* Tab 1: Collection Agents Directory */}
        {tabIndex === 1 && (
          <div className="gc-glass-card gc-office-content-card">
            <AgentList onCreateNew={() => setTabIndex(2)} />
          </div>
        )}

        {/* Tab 2: Create Collection Agent */}
        {tabIndex === 2 && (
          <div className="gc-glass-card gc-office-content-card" style={{ maxWidth: '880px', margin: '0 auto' }}>
            <CreateAgentForm
              onSuccess={handleAgentCreated}
              onCancel={() => setTabIndex(1)}
            />
          </div>
        )}

        {/* Tab 3: Office Directory */}
        {tabIndex === 3 && (
          <div className="gc-glass-card gc-office-content-card">
            <OfficeList onEdit={handleEditOffice} />
          </div>
        )}

        {/* Tab 4: Office Form */}
        {tabIndex === 4 && (
          <div className="gc-glass-card gc-office-content-card" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <OfficeForm office={editingOffice} onSuccess={handleOfficeSaveSuccess} />
          </div>
        )}
      </main>
    </div>
  );
};

export default OfficeDashboard;
