import { vi, describe, test, expect, beforeEach } from "vitest";
import api from "./axios";
import { appointmentService } from "./appointmentService";

// Simular (mock) axios
vi.mock("./axios", () => {
    return {
        default: {
            post: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
            patch: vi.fn()
        }
    };
});

describe("appointmentService", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Espiar en console.error para silenciar la salida durante pruebas de error y verificar llamadas
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    describe("create", () => {
        test("debe crear una cita correctamente", async () => {
            const mockCita = { id: 10, barberId: 1, date: "2026-08-15", time: "10:00" };
            api.post.mockResolvedValue({ data: mockCita });

            const appointmentData = { barberId: 1, date: "2026-08-15", time: "10:00" };
            const resultado = await appointmentService.create(appointmentData);

            expect(api.post).toHaveBeenCalledWith("/appointments", appointmentData);
            expect(resultado).toEqual(mockCita);
        });

        test("debe lanzar el error y reportarlo a la consola si falla la creación", async () => {
            const errorApi = new Error("Error del servidor");
            api.post.mockRejectedValue(errorApi);

            const appointmentData = { barberId: 1 };

            await expect(appointmentService.create(appointmentData)).rejects.toThrow("Error del servidor");
            expect(console.error).toHaveBeenCalledWith("Error al crear la cita:", errorApi);
        });
    });

    describe("getAppointmentsByBarber", () => {
        test("debe obtener las citas de un barbero correctamente", async () => {
            const mockCitas = [
                { id: 1, barberId: 5, date: "2026-08-12" },
                { id: 2, barberId: 5, date: "2026-08-13" }
            ];
            api.get.mockResolvedValue({ data: mockCitas });

            const resultado = await appointmentService.getAppointmentsByBarber(5);

            expect(api.get).toHaveBeenCalledWith("/appointments/barber/5");
            expect(resultado).toEqual(mockCitas);
        });

        test("debe lanzar el error si falla al obtener citas", async () => {
            const errorApi = new Error("Error de conexión");
            api.get.mockRejectedValue(errorApi);

            await expect(appointmentService.getAppointmentsByBarber(5)).rejects.toThrow("Error de conexión");
            expect(console.error).toHaveBeenCalledWith("Error al obtener las citas del barbero:", errorApi);
        });
    });

    describe("getHorarios", () => {
        test("debe obtener los horarios correctamente", async () => {
            const mockHorarios = ["09:00", "10:00", "11:00"];
            api.get.mockResolvedValue({ data: mockHorarios });

            const resultado = await appointmentService.getHorarios();

            expect(api.get).toHaveBeenCalledWith("/appointments/horarios");
            expect(resultado).toEqual(mockHorarios);
        });
    });

    describe("getAvailability", () => {
        test("debe consultar la disponibilidad sin duración de servicio", async () => {
            const mockAvailability = ["09:00", "11:00"];
            api.get.mockResolvedValue({ data: mockAvailability });

            const resultado = await appointmentService.getAvailability("2026-08-12", 2);

            expect(api.get).toHaveBeenCalledWith("/appointments/availability?date=2026-08-12&barberId=2");
            expect(resultado).toEqual(mockAvailability);
        });

        test("debe consultar la disponibilidad incluyendo la duración de servicio", async () => {
            const mockAvailability = ["14:00", "15:00"];
            api.get.mockResolvedValue({ data: mockAvailability });

            const resultado = await appointmentService.getAvailability("2026-08-12", 2, 60);

            expect(api.get).toHaveBeenCalledWith("/appointments/availability?date=2026-08-12&barberId=2&serviceDuration=60");
            expect(resultado).toEqual(mockAvailability);
        });
    });

    describe("reschedule", () => {
        test("debe reagendar una cita correctamente", async () => {
            const mockCitaReagendada = { id: 10, date: "2026-08-20", time: "11:00" };
            api.patch.mockResolvedValue({ data: mockCitaReagendada });

            const data = { date: "2026-08-20", time: "11:00" };
            const resultado = await appointmentService.reschedule(10, data);

            expect(api.patch).toHaveBeenCalledWith("/appointments/10/reschedule", data);
            expect(resultado).toEqual(mockCitaReagendada);
        });

        test("debe lanzar el error si falla al reagendar la cita", async () => {
            const errorApi = new Error("No disponible");
            api.patch.mockRejectedValue(errorApi);

            const data = { date: "2026-08-20" };

            await expect(appointmentService.reschedule(10, data)).rejects.toThrow("No disponible");
            expect(console.error).toHaveBeenCalledWith("Error al reagendar la cita:", errorApi);
        });
    });

});
