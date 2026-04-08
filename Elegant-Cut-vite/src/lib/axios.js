import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const UPLOADS_BASE_URL = API_BASE_URL.replace('/api', '/uploads');

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true // Permite enviar cookies en las peticiones
});

export default api;
;
