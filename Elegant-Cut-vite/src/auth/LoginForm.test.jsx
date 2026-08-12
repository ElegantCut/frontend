import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import LoginForm from "./LoginForm";
import { useAuth } from "./UseAuth.jsx";
import { authService } from "./authService";

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/login" }),
}));

// Mock de useAuth hook
vi.mock("./UseAuth.jsx", () => ({
    useAuth: vi.fn(),
}));

// Mock de authService para registro
vi.mock("./authService", () => ({
    authService: {
        register: vi.fn(),
    },
}));

describe("LoginForm Component", () => {
    const mockLoginFn = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Definición por defecto para el hook useAuth
        useAuth.mockReturnValue({
            login: mockLoginFn,
        });
    });

    test("debe renderizar el formulario de login por defecto", () => {
        render(<LoginForm />);

        // Verificar entradas de Login
        expect(screen.getByLabelText("Nombre de usuario")).toBeInTheDocument();
        expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
    });

    test("debe permitir escribir en usuario y contraseña", () => {
        render(<LoginForm />);

        const userInput = screen.getByLabelText("Nombre de usuario");
        const passwordInput = screen.getByLabelText("Contraseña");

        fireEvent.change(userInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        expect(userInput).toHaveValue("testuser");
        expect(passwordInput).toHaveValue("password123");
    });

    test("debe llamar a la función de login al enviar el formulario", async () => {
        mockLoginFn.mockResolvedValue({ user: { role: "client" } });
        render(<LoginForm />);

        const userInput = screen.getByLabelText("Nombre de usuario");
        const passwordInput = screen.getByLabelText("Contraseña");
        const submitButton = screen.getByRole("button", { name: "Iniciar sesión" });

        fireEvent.change(userInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLoginFn).toHaveBeenCalledWith(
                { username: "testuser", contrasena: "password123" },
                false
            );
        });

        // Esperar el mensaje de éxito de redirección
        expect(screen.getByText("¡Login exitoso! Redirigiendo...")).toBeInTheDocument();
    });

    test("debe mostrar un mensaje de error si falla el login", async () => {
        mockLoginFn.mockRejectedValue(new Error("Credenciales inválidas"));
        render(<LoginForm />);

        const userInput = screen.getByLabelText("Nombre de usuario");
        const passwordInput = screen.getByLabelText("Contraseña");
        const submitButton = screen.getByRole("button", { name: "Iniciar sesión" });

        fireEvent.change(userInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "wrong-password" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLoginFn).toHaveBeenCalled();
        });

        // Debe renderizar el banner de error
        expect(screen.getByText("Credenciales inválidas. Intenta de nuevo.")).toBeInTheDocument();
    });

    test("debe alternar a la vista de registro al dar click en Registrarte", () => {
        render(<LoginForm />);

        const registerLinkButton = screen.getByRole("button", { name: "Registrate" });
        fireEvent.click(registerLinkButton);

        // Ahora deberíamos ver el formulario de registro.
        // Verificamos si existe algún label exclusivo de registro como "Primer nombre" o "Email" en la vista.
        expect(screen.getByText("Fill in your information to get started")).toBeInTheDocument();
    });
});
