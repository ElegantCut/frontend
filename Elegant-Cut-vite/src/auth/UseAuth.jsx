import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './authService';

// 1. Creamos el Contexto Global de Autenticación
const AuthContext = createContext(null);

// 2. Creamos el Proveedor (Provider) que envolverá toda nuestra aplicación
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app por primera vez, verificamos si hay una sesión guardada
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Ya no buscamos el token en localStorage porque ahora se maneja por cookies HttpOnly.
    // Solo verificamos si existen los datos del usuario.
    const userDataStr = localStorage.getItem('user');

    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error("Error leyendo datos del usuario local", error);
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    // Llamamos a tu servicio que conecta con Axios y el Backend
    const result = await authService.login(credentials);
    // Luego de loguearnos con éxito, verificamos el localStorage de nuevo
    checkAuth();
    return result;
  };

  const logout = () => {
    // Tu servicio limpia el localStorage y redirige al login
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Proveemos todas estas funciones "en vivo" a los demás componentes
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuth, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Este es el hook "useAuth" que usamos en Header.jsx y ProtectedRoute.jsx para jalar los datos del contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}