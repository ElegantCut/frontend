import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/Sidebar.css';
import { AuthClient } from '../../auth/authClient';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const user = AuthClient.getUser() || {};

  const handleLogout = () => {
    AuthClient.logout();
  };

  const menuItems = [
    { id: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'citas', icon: 'bi-calendar-check', label: 'Citas', path: '/admin/citas' },
    { id: 'clientes', icon: 'bi-people', label: 'Clientes', path: '/admin/clientes' },
    { id: 'barberos', icon: 'bi-scissors', label: 'Barberos', path: '/admin/barberos' },
    { id: 'administradores', icon: 'bi-shield-lock', label: 'Administradores', path: '/admin/administradores' },
    { id: 'servicios', icon: 'bi-grid', label: 'Servicios', path: '/admin/servicios' },
    { id: 'resenas', icon: 'bi-star', label: 'Reseñas', path: '/admin/resenas' },
    { id: 'configuracion', icon: 'bi-gear', label: 'Configuración', path: '/admin/configuracion' },
  ];

  return (
    <motion.div
      className={`sidebar ${isOpen ? 'open' : ''}`}
      animate={isOpen ? { x: 0 } : {}}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="sidebar-header">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="logo-container">
            <i className="bi bi-scissors text-rojo fs-2"></i>
            <h3 className="ms-2 mb-0 text-negro">Elegant Cut</h3>
          </div>
          <button className="btn-close-sidebar d-md-none" onClick={closeSidebar}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <p className="text-muted small mt-2">Panel de Administración</p>
      </div>

      <div className="user-profile mb-4 px-3">
        <div className="d-flex align-items-center p-2 bg-light rounded">
          <div className="avatar bg-rojo text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="ms-2 overflow-hidden">
            <h6 className="mb-0 text-truncate">{user.name || 'Admin'}</h6>
            <small className="text-muted">Administrador</small>
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
              onClick={() => window.innerWidth < 768 && closeSidebar()}
            >
              <i className={`bi ${item.icon} me-3`}></i>
              {item.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="sidebar-footer mt-auto p-3">
        <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Cerrar Sesión
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;