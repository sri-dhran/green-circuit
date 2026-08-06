import api from './axiosConfig';

export const userService = {
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    }
};
