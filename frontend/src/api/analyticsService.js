import api from './axiosConfig';

export const analyticsService = {
    getStats: async () => {
        const response = await api.get('/analytics');
        return response.data;
    }
};
