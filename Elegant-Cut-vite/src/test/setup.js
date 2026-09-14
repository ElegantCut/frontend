import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Mocks globales comunes para pruebas de componentes en React (ej. framer-motion)
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }) => React.createElement("div", props, children),
        button: ({ children, ...props }) => React.createElement("button", props, children),
        span: ({ children, ...props }) => React.createElement("span", props, children),
        h2: ({ children, ...props }) => React.createElement("h2", props, children),
        p: ({ children, ...props }) => React.createElement("p", props, children),
        form: ({ children, ...props }) => React.createElement("form", props, children),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// Mock global para lucide-react para acelerar y simplificar las pruebas de componentes
vi.mock("lucide-react", async () => {
    const actual = await vi.importActual("lucide-react");
    return {
        ...actual,
        // Si hay algún ícono que dé problemas, se puede mockear aquí
    };
});
