import api from './axiosConfig';

export const notificationService = {
    getMyNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    
    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    }
};
