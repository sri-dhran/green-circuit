import React, { useState, useEffect } from 'react';
import { agentService } from '../api/agentService';
import EditAgentModal from './EditAgentModal';
import './AgentList.css';

const AgentList = ({ onCreateNew }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await agentService.getOfficeAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load agents:', err);
      setError('Unable to load collection agents. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (agent) => {
    const newStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setActionLoading(agent.id);
    try {
      await agentService.toggleAgentStatus(agent.id, newStatus);
      await loadAgents();
    } catch (err) {
      console.error('Failed to toggle agent status:', err);
      alert('Failed to update agent status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAgents = agents.filter((ag) => {
    const matchStatus = statusFilter === 'ALL' || ag.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchStatus;

    const matchName = ag.fullName?.toLowerCase().includes(query);
    const matchEmail = ag.email?.toLowerCase().includes(query);
    const matchPhone = ag.mobileNumber?.toLowerCase().includes(query);
    const matchEmpId = ag.employeeId?.toLowerCase().includes(query);
    const matchCity = ag.city?.toLowerCase().includes(query);

    return matchStatus && (matchName || matchEmail || matchPhone || matchEmpId || matchCity);
  });

  return (
    <div className="gc-agent-list-wrapper">
      {/* Header controls */}
      <div className="gc-agent-list-header">
        <div>
          <h3 className="gc-agent-title">👮 Field Collection Agents</h3>
          <p className="gc-agent-subtitle">
            Manage authorized e-waste pickup personnel, monitor live collection assignments, and track logistics performance.
          </p>
        </div>

        <div className="gc-agent-actions-row">
          <button type="button" className="gc-btn-secondary" onClick={loadAgents} disabled={loading}>
            🔄 Refresh
          </button>
          <button type="button" className="gc-btn-primary" onClick={onCreateNew}>
            ➕ Register Collection Agent
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="gc-agent-search-bar">
        <div className="gc-search-box" style={{ flexGrow: 1, maxWidth: '380px' }}>
          <span className="gc-search-icon">🔍</span>
          <input
            type="text"
            className="gc-search-input"
            placeholder="Search by agent name, phone, email, employee ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="gc-search-clear" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>

        <div className="gc-agent-filter-pills">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              type="button"
              className={`gc-filter-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Agents' : st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="gc-form-error-banner" style={{ marginBottom: '20px' }}>
          <span>⚠️ {error}</span>
          <button type="button" className="gc-btn-secondary" onClick={loadAgents}>Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="gc-history-loading" style={{ minHeight: '260px' }}>
          <div className="gc-spinner" />
          <span>Loading collection agents…</span>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="gc-agent-empty-state">
          <div className="gc-agent-empty-icon">👮‍♂️</div>
          <h4>No Collection Agents Found</h4>
          <p>
            {agents.length === 0
              ? 'Your collection office currently has no registered field agents. Create your first agent to dispatch pickups.'
              : 'No collection agents matched your current search/filter criteria.'}
          </p>
          {agents.length === 0 && (
            <button type="button" className="gc-btn-primary" onClick={onCreateNew} style={{ marginTop: '14px' }}>
              ➕ Register First Agent
            </button>
          )}
        </div>
      ) : (
        <div className="gc-agents-grid">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="gc-glass-card gc-agent-card">
              {/* Card Top */}
              <div className="gc-agent-card-top">
                <div className="gc-agent-avatar">
                  {agent.fullName ? agent.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="gc-agent-meta">
                  <div className="gc-agent-name-row">
                    <h4 className="gc-agent-name">{agent.fullName}</h4>
                    <span className={`gc-chip ${agent.status === 'ACTIVE' ? 'gc-chip-completed' : 'gc-chip-cancelled'}`}>
                      {agent.status}
                    </span>
                  </div>
                  <span className="gc-agent-empid">
                    🆔 {agent.employeeId || `AGT-${agent.id}`} • {agent.officeName || 'Collection Hub'}
                  </span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="gc-agent-details-list">
                <div className="gc-agent-detail-item">
                  <span className="gc-detail-lbl">📱 Mobile:</span>
                  <a href={`tel:${agent.mobileNumber}`} className="gc-detail-val gc-link">
                    {agent.mobileNumber}
                  </a>
                </div>
                <div className="gc-agent-detail-item">
                  <span className="gc-detail-lbl">✉️ Email:</span>
                  <span className="gc-detail-val">{agent.email}</span>
                </div>
                {agent.city && (
                  <div className="gc-agent-detail-item">
                    <span className="gc-detail-lbl">📍 Location:</span>
                    <span className="gc-detail-val">{agent.city}{agent.state ? `, ${agent.state}` : ''}</span>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="gc-agent-kpi-row">
                <div className="gc-agent-kpi">
                  <span className="gc-kpi-val text-blue">{agent.assignedRequestsCount ?? 0}</span>
                  <span className="gc-kpi-lbl">Active Assigned</span>
                </div>
                <div className="gc-agent-kpi-divider" />
                <div className="gc-agent-kpi">
                  <span className="gc-kpi-val text-green">{agent.completedPickupsCount ?? 0}</span>
                  <span className="gc-kpi-lbl">Completed Pickups</span>
                </div>
              </div>

              {/* Actions */}
              <div className="gc-agent-card-actions">
                <button
                  type="button"
                  className="gc-btn-secondary gc-btn-sm"
                  onClick={() => setSelectedAgent(agent)}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  type="button"
                  className={`gc-btn-sm ${agent.status === 'ACTIVE' ? 'gc-btn-danger-outline' : 'gc-btn-success-outline'}`}
                  onClick={() => handleToggleStatus(agent)}
                  disabled={actionLoading === agent.id}
                >
                  {actionLoading === agent.id ? 'Updating…' : agent.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedAgent && (
        <EditAgentModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onSuccess={() => {
            setSelectedAgent(null);
            loadAgents();
          }}
        />
      )}
    </div>
  );
};

export default AgentList;
