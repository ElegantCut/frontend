// @vitest-environment happy-dom
import { vi, describe, test, expect, beforeEach } from "vitest";
import api from "../lib/axios";
import { authService } from "./authService";


vi.mock("../lib/axios", () => {
    return {
        default: {
            post: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
            patch: vi.fn()
        }
    };
});

describe("authService", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();

        Object.defineProperty(window, "location", {
            writable: true,
            value: { href: "" }
        });
    });

    describe("login", () => {
        test("debe iniciar sesión correctamente y guardar en localStorage si rememberMe es true", async () => {
            const userData = { id: 1, nombre: "Admin", rol: "barber" };
            api.post.mockResolvedValue({
                data: { user: userData, token: "fake-jwt-token" }
            });

            const credentials = { email: "test@test.com", password: "password123" };
            const resultado = await authService.login(credentials, true);

            expect(api.post).toHaveBeenCalledWith("/auth/login", {
                email: "test@test.com",
                password: "password123",
                rememberMe: true
            });
            expect(resultado.user).toEqual(userData);
            expect(localStorage.getItem("user")).toEqual(JSON.stringify(userData));
            expect(sessionStorage.getItem("user")).toBeNull();
        });

        test("debe iniciar sesión correctamente y guardar en sessionStorage si rememberMe es false", async () => {
            const userData = { id: 2, nombre: "Cliente", rol: "client" };
            api.post.mockResolvedValue({
                data: { user: userData, token: "fake-jwt-token" }
            });

            const credentials = { email: "client@test.com", password: "password123" };
            const resultado = await authService.login(credentials, false);

            expect(api.post).toHaveBeenCalledWith("/auth/login", {
                email: "client@test.com",
                password: "password123",
                rememberMe: false
            });
            expect(resultado.user).toEqual(userData);
            expect(sessionStorage.getItem("user")).toEqual(JSON.stringify(userData));
            expect(localStorage.getItem("user")).toBeNull();
        });

        test("debe lanzar el mensaje de error de la API si las credenciales son incorrectas", async () => {
            api.post.mockRejectedValue({
                response: {
                    data: { message: "Contraseña incorrecta" }
                }
            });

            const credentials = { email: "test@test.com", password: "wrong-password" };

            await expect(authService.login(credentials, false)).rejects.toBe("Contraseña incorrecta");
        });

        test("debe lanzar mensaje de error genérico si ocurre un fallo sin respuesta de servidor", async () => {
            api.post.mockRejectedValue(new Error("Network Error"));

            const credentials = { email: "test@test.com", password: "password123" };

            await expect(authService.login(credentials, false)).rejects.toBe("Usuario o contraseña incorrectos");
        });
    });

    describe("register", () => {
        test("debe registrar un usuario correctamente", async () => {
            const responseData = { message: "Usuario creado exitosamente", user: { id: 3, nombre: "Nuevo" } };
            api.post.mockResolvedValue({ data: responseData });

            const userData = { email: "new@test.com", password: "password123", name: "Nuevo" };
            const resultado = await authService.register(userData);

            expect(api.post).toHaveBeenCalledWith("/auth/register", userData);
            expect(resultado).toEqual(responseData);
        });

        test("debe lanzar mensaje de error de la API en el registro", async () => {
            api.post.mockRejectedValue({
                response: {
                    data: { message: "El correo ya está registrado" }
                }
            });

            const userData = { email: "existing@test.com", password: "password123" };

            await expect(authService.register(userData)).rejects.toBe("El correo ya está registrado");
        });

        test("debe manejar mensajes de error en formato array devueltos por la API", async () => {
            api.post.mockRejectedValue({
                response: {
                    data: { message: ["El correo es inválido", "La contraseña es muy corta"] }
                }
            });

            const userData = { email: "invalid-email", password: "1" };

            await expect(authService.register(userData)).rejects.toBe("El correo es inválido");
        });
    });

    describe("logout", () => {
        test("debe limpiar localStorage y redirigir a /login", async () => {
            localStorage.setItem("user", JSON.stringify({ id: 1, nombre: "Usuario" }));
            api.post.mockResolvedValue({});

            await authService.logout();

            expect(api.post).toHaveBeenCalledWith("/auth/logout");
            expect(localStorage.getItem("user")).toBeNull();
            expect(window.location.href).toBe("/login");
        });
    });

});
