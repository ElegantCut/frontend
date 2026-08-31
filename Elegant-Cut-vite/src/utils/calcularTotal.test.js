import { describe, test, expect } from "vitest";
import { calcularTotal } from "./calcularTotal";

describe("calcularTotal", () => {

    test("debe calcular correctamente el total del carrito con múltiples productos", () => {
        const productos = [
            {
                nombre: "Shampoo",
                precio: 20000,
                cantidad: 2
            },
            {
                nombre: "Cera",
                precio: 15000,
                cantidad: 1
            }
        ];

        const resultado = calcularTotal(productos);

        expect(resultado).toBe(55000);
    });

    test("debe retornar 0 si el carrito de productos está vacío", () => {
        const productos = [];

        const resultado = calcularTotal(productos);

        expect(resultado).toBe(0);
    });

    test("debe retornar 0 si los productos tienen cantidad 0", () => {
        const productos = [
            {
                nombre: "Shampoo",
                precio: 20000,
                cantidad: 0
            },
            {
                nombre: "Cera",
                precio: 15000,
                cantidad: 0
            }
        ];

        const resultado = calcularTotal(productos);

        expect(resultado).toBe(0);
    });

    test("debe calcular correctamente para un solo producto con cantidad 1", () => {
        const productos = [
            {
                nombre: "Corte de cabello",
                precio: 25000,
                cantidad: 1
            }
        ];

        const resultado = calcularTotal(productos);

        expect(resultado).toBe(25000);
    });

    test("debe manejar correctamente precios con decimales", () => {
        const productos = [
            {
                nombre: "Gel Especial",
                precio: 12.5,
                cantidad: 2
            },
            {
                nombre: "Peine",
                precio: 5.25,
                cantidad: 4
            }
        ];

        const resultado = calcularTotal(productos);

        // (12.5 * 2) + (5.25 * 4) = 25 + 21 = 46
        expect(resultado).toBe(46);
    });

});