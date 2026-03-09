import api from "./axios"; // Importas la configuración que apunta al puerto 3001/api

// 1. Definimos el objeto que contendrá todos los servicios de Barberos
export const barberService = {

    // Función para traer todos los barberos de la DB
    getAllBarbers: async () => {
        try {
            // Hacemos la petición GET a http://localhost:3001/api/barbers
            const response = await api.get('/barbers');

            return response.data;
        } catch (error) {
            console.error("Error en getAllBarbers:", error);
            throw error; // Lanzamos el error para manejarlo en la interfaz (el JSX)
        }
    },

    // Función pública para traer barberos en el Home (sin autenticación)
    getPublicBarbers: async () => {
        try {
            const response = await api.get('/barbers/public');
            return response.data;
        } catch (error) {
            console.error("Error en getPublicBarbers:", error);
            throw error;
        }
    },

    // Función para traer los portafolios de todos los barberos
    getAllPortfolios: async () => {
        try {
            const response = await api.get('/barbers/portfolios');
            return response.data;
        } catch (error) {
            console.error("Error en getAllPortfolios:", error);
            // Retornamos array vacío para no bloquear el renderizado si falla
            return [];
        }
    },

    // Ejemplo de otra función para crear un barbero (POST)
    createBarber: async (barberData) => {
        try {
            const response = await api.post('/barbers', barberData);
            return response.data;
        } catch (error) {
            console.error("Error al crear barbero:", error);
            throw error;
        }
    }
};