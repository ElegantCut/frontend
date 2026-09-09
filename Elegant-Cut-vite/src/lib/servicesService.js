import api from "./axios";

// 2. Creamos un objeto que agrupa todas las funciones de "Servicios"
export const servicesService = {

    // Esta función le pedirá al Backend la lista de precios y servicios
    getAllServices: async () => {
        try {
            // Hacemos la petición a: http://localhost:3001/api/services
            // El "/services" debe coincidir con el nombre de tu 
            const response = await api.get('/services');

            // Si todo sale bien, devolvemos la lista de datos uwu
            return response.data;
        } catch (error) {


            // Si el backend está apagado o hay un error, lo avisamos por consola eliminar esta linea cuando se tenga claro todo
            console.error("Error al traer servicios desde el servidor:", error);
            throw error;
        }
    },

    // Esta función le pedirá al Backend los servicios filtrados por género
    getServicesByGender: async (generoId) => {
        try {
            const response = await api.get(`/services/gender/${generoId}`);
            return response.data;
        } catch (error) {
            console.error("Error al traer servicios por género desde el servidor:", error);
            throw error;
        }
    }
}