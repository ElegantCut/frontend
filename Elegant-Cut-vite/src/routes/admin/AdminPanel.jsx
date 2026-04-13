import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/AdminPanel.css';

const AdminPanel = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-panel">
      {/* Overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="admin-overlay"
            onClick={closeSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          ></motion.div>
        )}
      </AnimatePresence>

      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      <div className="admin-content">
        <AdminHeader toggleSidebar={toggleSidebar} />
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