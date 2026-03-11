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
    // Map required strings to id_rol numbers
    if (requiredRole === 'admin' && user.id_rol === 1) hasRole = true;
    if (requiredRole === 'barber' && user.id_rol === 3) hasRole = true;
    if (requiredRole === 'client' && user.id_rol === 2) hasRole = true;

    // Por si acaso el de base de datos envía rol
    if (user.role === requiredRole) hasRole = true;

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;