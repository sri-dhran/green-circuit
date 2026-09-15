import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api';
export const SERVER_ROOT = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Safely constructs the full URL for uploaded images.
 * Handles null, empty, already-full URLs, and relative paths starting with or without leading slash.
 */
export const getImageUrl = (photoPath) => {
    if (!photoPath) return '';
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || photoPath.startsWith('blob:') || photoPath.startsWith('data:')) {
        return photoPath;
    }
    const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    return `${SERVER_ROOT}${cleanPath}`;
};

export default api;
