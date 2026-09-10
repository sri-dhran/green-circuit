import api from '../../../common/api/axiosConfig';

export const officeService = {
    getAllOffices: async () => {
        const response = await api.get('/offices');
        return response.data;
    },
    
    getOfficeById: async (id) => {
        const response = await api.get(`/offices/${id}`);
        return response.data;
    },
    
    searchOffices: async (query) => {
        const response = await api.get(`/offices/search`, { params: { query } });
        return response.data;
    },
    
    getNearbyCenters: async (latitude, longitude, radius = 10.0) => {
        const response = await api.get(`/collection-centers/nearby`, { 
            params: { latitude, longitude, radius } 
        });
        return response.data;
    },
    
    createOffice: async (officeData) => {
        const response = await api.post('/offices', officeData);
        return response.data;
    },
    
    updateOffice: async (id, officeData) => {
        const response = await api.put(`/offices/${id}`, officeData);
        return response.data;
    },
    
    deleteOffice: async (id) => {
        const response = await api.delete(`/offices/${id}`);
        return response.data;
    }
};
