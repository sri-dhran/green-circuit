import api from './axiosConfig';

export const pickupRequestService = {
    createRequest: async (formData) => {
        const response = await api.post('/pickup-requests', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    getMyRequests: async () => {
        const response = await api.get('/pickup-requests/me');
        return response.data;
    },

    getOfficeRequests: async () => {
        const response = await api.get('/pickup-requests/office');
        return response.data;
    },

    updateRequestStatus: async (id, status, rejectionReason = '') => {
        const response = await api.put(`/pickup-requests/${id}/status`, null, {
            params: { status, rejectionReason }
        });
        return response.data;
    }
};
