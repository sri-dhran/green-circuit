import api from '../../../common/api/axiosConfig';

export const userService = {
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    }
};
