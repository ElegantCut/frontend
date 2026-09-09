import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/AdminPanel.css';
import { div } from 'framer-motion/client';

const AdminPanel = () => {
  const location = useLocation();
  // Inicializamos el estado leyendo de localStorage (si existe), sino por defecto es false (abierto)
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // Cada vez que cambie isCollapsed, lo guardamos en localStorage
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeSidebar = () => {
    setIsCollapsed(true);
  };

  return (
    <div className='admin-panel'>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            className='sidebar-overlay'
            onClick={closeSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Acá cambiamos el estado del menu uwu */}
      <Sidebar isCollapsed={isCollapsed} closeSidebar={closeSidebar} toggleSidebar={toggleSidebar} />

      <div className={`admin-content ${isCollapsed ? 'collapsed' : ''}`}>
        <AdminHeader toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
        
        {/* ¡No olvides el main y el Outlet! */}
        <main className="admin-main container-fluid py-4 px-md-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;