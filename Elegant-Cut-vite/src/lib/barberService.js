import api from "./axios"; // Importas la configuración que apunta al puerto 3001/api

// 1. Definimos el objeto que contendrá todos los servicios de Barberos
export const barberService = {

    // Función para traer todos los barberos de la DB
    getAllBarbers: async () => {
        try {
            // Hacemos la petición GET a http://localhost:3001/api/barbers
            const response = await api.get('/barbers');

            // Retornamos solo la información que nos interesa (los datos)
            return response.data;
        } catch (error) {
            console.error("Error en getAllBarbers:", error);
            throw error; // Lanzamos el error para manejarlo en la interfaz (el JSX)
        }
    },

    // Función para traer todos los portafolios (desde el nuevo módulo)
    getAllPortfolios: async () => {
        try {
            // Se asume que el backend tiene la ruta http://localhost:3001/api/portabarbero
            const response = await api.get('/portabarbero');
            return response.data;
        } catch (error) {
            console.warn("Endpoints de portafolio aún no disponibles localmente:", error);
            return []; // Devolvemos un array vacío como fallback si falla (ej. aún no se ha hecho pull)
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