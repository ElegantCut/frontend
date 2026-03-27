import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthClient } from "../../lib/utils/authClient";
import { Image, Plus } from 'lucide-react';

const BarberPortfolio = () => {
    const user = AuthClient.getUser();

    return (
        <div style={{ padding: '2rem' }}>
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#2c3e50' }}
            >
                Mi Portafolio
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Mis Trabajos</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2c3e50', color: 'white',
                            border: 'none', borderRadius: '8px',
                            cursor: 'pointer', fontWeight: '600'
                        }}
                    >
                        <Plus size={18} />
                        Agregar Trabajo
                    </motion.button>
                </div>

                {/* Aquí puedes agregar la galería de trabajos */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem',
                    minHeight: '200px',
                }}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed #ccc', borderRadius: '12px',
                            padding: '2rem', cursor: 'pointer', color: '#999',
                            minHeight: '200px'
                        }}
                    >
                        <Image size={40} />
                        <p style={{ marginTop: '0.5rem' }}>Agregar foto</p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default BarberPortfolio;
