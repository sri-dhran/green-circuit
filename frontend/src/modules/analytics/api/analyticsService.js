import api from '../../../common/api/axiosConfig';

export const analyticsService = {
    getStats: async (period = 'all') => {
        const response = await api.get('/analytics', {
            params: { period }
        });
        return response.data;
    }
};
