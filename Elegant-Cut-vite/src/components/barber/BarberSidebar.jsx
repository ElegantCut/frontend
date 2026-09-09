import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import '../../styles/Sidebar.css';
import { AuthClient } from '../../auth/authClient';

const BarberSidebar = ({ isOpen, closeSidebar }) => {
  const user = AuthClient.getUser() || {};

  const handleLogout = () => {
    AuthClient.logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { id: 'appointments', icon: 'bi-calendar-check', label: 'Mis Citas', path: '/barber/appointments' },
    { id: 'configuracion', icon: 'bi-gear', label: 'Configuración', path: '/barber/configuracion' },
  ];

  return (
    <motion.div
      className={`sidebar ${isOpen ? 'open' : ''}`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="sidebar-header">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="logo-container">
            <i className="bi bi-scissors text-rojo fs-2"></i>
            <h3 className="ms-2 mb-0 text-white">Elegant Cut</h3>
          </div>
          {closeSidebar && (
            <button className="btn-close-sidebar d-lg-none" onClick={closeSidebar}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        <p className="text-muted small mt-2">Panel del Barbero</p>
      </div>

      <div className="user-profile mb-4 px-3">
        <div className="d-flex align-items-center p-2 bg-light rounded">
          <div className="avatar bg-rojo text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div className="ms-2 overflow-hidden">
            <h6 className="mb-0 text-truncate">{user.name || 'Barbero'}</h6>
            <small className="text-muted">Barbero Profesional</small>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon} me-3`}></i>
              {item.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="sidebar-footer mt-auto p-3">
        <button className="btn-ios-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          Cerrar Sesión
        </button>
      </div>
    </motion.div>
  );
};

export default BarberSidebar;
