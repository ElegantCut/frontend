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

  const checkAuth = async () => {
    // Ya no buscamos el token en localStorage porque ahora se maneja por cookies HttpOnly.
    // Solo verificamos si existen los datos del usuario localmente como primera instancia.
    const userDataStr = localStorage.getItem('user');
    setLoading(true);

    if (userDataStr) {
      try {
        // Verificamos si la cookie sigue siendo válida contra el backend
        const result = await authService.checkToken(); 

        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          setIsAuthenticated(true);
          setUser(result.user);
        }
      } catch (error) {
        // Si hay un error de red pero tenemos datos locales, podrías elegir no desloguear
        // Pero para seguridad estricta con HttpOnly, lo ideal es limpiar si el token no sirve
        if (error !== "No se pudo conectar al servidor") {
           logoutLocal(); 
        }
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        setIsAuthenticated(true);
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const logoutLocal = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const logout = async () => {
    console.log("👋 Cerrando sesión...");
    await authService.logout();
    logoutLocal();
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