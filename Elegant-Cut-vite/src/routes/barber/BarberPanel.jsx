import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BarberSidebar from '../../components/barber/BarberSidebar';

import '../../styles/AdminPanel.css';
import '../../styles/BarberPanel.css';

const BarberPanel = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="barber-panel-container">
            {/* Overlay for mobile when sidebar is open */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        className="barber-overlay"
                        onClick={closeSidebar}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            <BarberSidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            <div className="barber-content">
                {/* Mobile Header */}
                <div className="barber-mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <button className="btn-toggle-sidebar" onClick={toggleSidebar}>
                            <i className="bi bi-list"></i>
                        </button>
                        <h1>Elegant Cut</h1>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BarberPanel;
