import api from '../../../common/api/axiosConfig';

export const agentService = {
  // Office agent management
  getOfficeAgents: async () => {
    const response = await api.get('/agents');
    return response.data;
  },

  getAgentById: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  createAgent: async (agentData) => {
    const response = await api.post('/agents', agentData);
    return response.data;
  },

  updateAgent: async (id, agentData) => {
    const response = await api.put(`/agents/${id}`, agentData);
    return response.data;
  },

  toggleAgentStatus: async (id, status) => {
    const response = await api.patch(`/agents/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // Agent portal endpoints
  getAgentProfile: async () => {
    const response = await api.get('/agent/profile');
    return response.data;
  },

  getAgentDashboard: async () => {
    const response = await api.get('/agent/dashboard');
    return response.data;
  },

  getAgentRequests: async (status = '') => {
    const response = await api.get('/agent/requests', {
      params: status && status !== 'ALL' ? { status } : {},
    });
    return response.data;
  },

  getAgentRequestById: async (id) => {
    const response = await api.get(`/agent/requests/${id}`);
    return response.data;
  },

  updateRequestStatus: async (id, status, remarks = '', proofUrl = '') => {
    const response = await api.put(`/agent/requests/${id}/status`, null, {
      params: {
        status,
        ...(remarks ? { remarks } : {}),
        ...(proofUrl ? { proofUrl } : {}),
      },
    });
    return response.data;
  },
};
