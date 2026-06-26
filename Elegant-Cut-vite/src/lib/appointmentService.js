import api from "./axios";

export const appointmentService = {

    create: async (appointmentData) => {
        try {
            const response = await api.post('/appointments', appointmentData);
            return response.data;
        } catch (error) {

            console.error("Error al crear la cita:", error);
            throw error;
        }

    },
    getAppointmentsByBarber: async (barberId) => {
        try {
            const response = await api.get(`/appointments/barber/${barberId}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener las citas del barbero:", error);
            throw error;
        }
    },
    getHorarios: async () => {
        const response = await api.get('/appointments/horarios');
        return response.data;
    },
    reschedule: async (appointmentId, data) => {
        try {
            const response = await api.patch(`/appointments/${appointmentId}/reschedule`, data);
            return response.data;
        } catch (error) {
            console.error("Error al reagendar la cita:", error);
            throw error;
        }
    }
}
