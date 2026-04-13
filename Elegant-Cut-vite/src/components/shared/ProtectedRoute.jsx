import React from 'react';
import { useAuth } from "../../auth/UseAuth.jsx";
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si se requiere uno específico
  if (requiredRole) {
    let hasRole = false;
    const userRole = user.role?.toLowerCase();
    const userIdRol = Number(user.id_rol);

    // Verificación por nombre de rol (role)
    if (userRole === requiredRole.toLowerCase()) hasRole = true;
    
    // Verificación por ID de rol (id_rol)
    if (requiredRole === 'admin' && userIdRol === 1) hasRole = true;
    if (requiredRole === 'barber' && userIdRol === 3) hasRole = true;
    if (requiredRole === 'client' && userIdRol === 2) hasRole = true;

    if (!hasRole) {
      console.warn(`⛔ Acceso denegado: se requiere rol "${requiredRole}", pero el usuario tiene rol "${userRole}" (ID: ${userIdRol})`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;