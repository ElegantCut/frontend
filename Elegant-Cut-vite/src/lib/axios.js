import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const UPLOADS_BASE_URL = API_BASE_URL.replace('/api', '/uploads');

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15s timeout to prevent UI from hanging
    withCredentials: true // Permite enviar y recibir cookies (JWT)
});

// Interceptor de request: agrega el token JWT como header Authorization
// Esto funciona como fallback cuando las cookies cross-site son bloqueadas
// (ej: Safari iOS bloquea cookies de terceros por Intelligent Tracking Prevention)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;