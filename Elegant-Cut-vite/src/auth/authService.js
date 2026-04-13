import api from "../lib/axios";

export const authService = {
    // 0. Método para verificar el token (sesión activa)
    checkToken: async () => {
        try {
            const response = await api.post('/auth/check-token');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Sesión inválida";
        }
    },

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

            // Si el backend responde con éxito (el token ya está en la cookie HttpOnly)
            if (response.data.user) {
                // Guardamos solo los datos del usuario localmente (el token se maneja por cookies)
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Usuario o contraseña incorrectos";
        }
    },

    // 3. Método para salir (Limpia la cookie en el backend y datos locales)
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    // 4. Método para solicitar recuperación de contraseña
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Error al enviar el correo" };
        }
    },

    // 5. Método para resetear la contraseña con el código
    resetPassword: async (email, codigo, newPassword) => {
        try {
            const response = await api.put('/auth/reset-password', { email, codigo, newPassword });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Código inválido o expirado" };
        }
    }
};