import { useState, useEffect } from 'react';
import { AuthClient } from '../utils/authClient';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = AuthClient.getToken();
    const userData = AuthClient.getUser();

    if (token && userData && AuthClient.isTokenValid()) {
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      // Token inválido o expirado
      if (token && !AuthClient.isTokenValid()) {
        AuthClient.logout();
      }
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const result = await AuthClient.login(username, password);

      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.error };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    AuthClient.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    checkAuth,
    login,
    logout
  };
}