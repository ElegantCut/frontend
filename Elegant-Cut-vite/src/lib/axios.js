import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const UPLOADS_BASE_URL = API_BASE_URL.replace('/api', '/uploads');

const api = axios.create({
    baseURL: API_BASE_URL
});



// Este lo usamos para el token importantisimo

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        //acá pegamos el token con las cabeceras como barrer token
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export default api;
;
