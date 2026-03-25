import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api'
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
