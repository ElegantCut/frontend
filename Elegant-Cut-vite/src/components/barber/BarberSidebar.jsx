import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, LogOut, User, Settings } from 'lucide-react';
import { AuthClient } from '../../auth/authClient';

const BarberSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = AuthClient.getUser();

    const handleLogout = () => {
        AuthClient.logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/barber/appointments', icon: Calendar, label: 'Mis Citas' },
        { path: '/barber/configuracion', icon: Settings, label: 'Configuración' },
    ];
    const colors = {
        rojo: '#bc2041',
        blancoMedio: '#f4f4f4',
        blanco: '#ffffffff',
        negroMedio: '#1f2933',
        negro: '#111205'
    };
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
                width: '250px',
                backgroundColor: colors.blanco,
                color: colors.negro,
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: colors.negro }}>
                    Elegant Cut
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, color: colors.negro }}>Panel del Barbero</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <User size={20} color={colors.rojo} />
                    <span style={{ fontWeight: 'bold', color: colors.negro }}>{user?.name || 'Barbero'}</span>
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Barbero Profesional</p>
            </motion.div>

            <nav style={{ flex: 1 }}>
                {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                            <Link
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '0.5rem',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: isActive ? colors.rojo : 'black',
                                    backgroundColor: isActive ? 'rgba(188, 32, 65, 0.1)' : 'transparent',
                                    transition: 'all 0.2s',
                                    fontWeight: isActive ? '600' : '400'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: colors.rojo,
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background-color 0.2s'
                }}
            >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
            </motion.button>
        </motion.div>
    );
};

export default BarberSidebar;
