import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BarberSidebar from '../../components/barber/BarberSidebar';

const BarberPanel = () => {
    const location = useLocation();

    return (
        <div className="barber-panel-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <BarberSidebar />
            <div className="barber-content" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
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
