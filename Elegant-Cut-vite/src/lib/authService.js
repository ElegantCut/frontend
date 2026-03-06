import api from "./axios";

export const authService = {
    // 1. Método para el Registro
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Error al crear la cuenta";
        }
    },

    // 2. Método para el Login (¡Aquí manejamos el Token!)
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);

            // Si el backend responde con éxito y trae token
            if (response.data.token) {
                // Guardamos el pase VIP y los datos del usuario (JWT)
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Usuario o contraseña incorrectos";
        }
    },

    // 3. Método para salir (Limpiar el bolsillo)
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};