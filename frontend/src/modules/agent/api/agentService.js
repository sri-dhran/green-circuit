import api from '../../../common/api/axiosConfig';

export const agentService = {
  // Office agent management
  getOfficeAgents: async () => {
    const response = await api.get('/api/agents');
    return response.data;
  },

  getAgentById: async (id) => {
    const response = await api.get(`/api/agents/${id}`);
    return response.data;
  },

  createAgent: async (agentData) => {
    const response = await api.post('/api/agents', agentData);
    return response.data;
  },

  updateAgent: async (id, agentData) => {
    const response = await api.put(`/api/agents/${id}`, agentData);
    return response.data;
  },

  toggleAgentStatus: async (id, status) => {
    const response = await api.patch(`/api/agents/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // Agent portal endpoints
  getAgentProfile: async () => {
    const response = await api.get('/api/agent/profile');
    return response.data;
  },

  getAgentDashboard: async () => {
    const response = await api.get('/api/agent/dashboard');
    return response.data;
  },

  getAgentRequests: async (status = '') => {
    const response = await api.get('/api/agent/requests', {
      params: status && status !== 'ALL' ? { status } : {},
    });
    return response.data;
  },

  getAgentRequestById: async (id) => {
    const response = await api.get(`/api/agent/requests/${id}`);
    return response.data;
  },

  updateRequestStatus: async (id, status, remarks = '', proofUrl = '') => {
    const response = await api.put(`/api/agent/requests/${id}/status`, null, {
      params: {
        status,
        ...(remarks ? { remarks } : {}),
        ...(proofUrl ? { proofUrl } : {}),
      },
    });
    return response.data;
  },
};
