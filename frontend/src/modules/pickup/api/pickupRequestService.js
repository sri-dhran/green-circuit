import api from '../../../common/api/axiosConfig';

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

    acceptRequest: async (id, responseMsg = '') => {
        const response = await api.patch(`/pickup-requests/${id}/accept`, null, {
            params: { response: responseMsg }
        });
        return response.data;
    },

    rejectRequest: async (id, responseMsg = '') => {
        const response = await api.patch(`/pickup-requests/${id}/reject`, null, {
            params: { response: responseMsg }
        });
        return response.data;
    },

    updateRequestStatus: async (id, status) => {
        const response = await api.patch(`/pickup-requests/${id}/status`, null, {
            params: { status }
        });
        return response.data;
    },

    assignCollector: async (id, collectorName, collectorPhone, pickupDate, pickupTime) => {
        const response = await api.put(`/pickup-requests/${id}/assign-collector`, null, {
            params: { collectorName, collectorPhone, pickupDate, pickupTime }
        });
        return response.data;
    }
};
