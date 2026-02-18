import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthClient } from "../../lib/utils/authClient";
import { Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';

const BarberSettings = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const user = AuthClient.getUser();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Solo se permiten archivos de imagen.' });
                return;
            }
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setMessage({ type: '', text: '' });
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const result = await AuthClient.uploadProfilePhoto(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Foto actualizada correctamente.' });
                // Actualizar datos del usuario en local storage si es necesario
                // AuthClient.refreshUserData(); // Idealmente debería existir esto
            } else {
                setMessage({ type: 'error', text: result.error || 'Error al subir la imagen.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#2c3e50' }}
            >
                Configuración de Perfil
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px' }}
            >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Cambiar Foto de Perfil</h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

                    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                        <motion.img
                            key={preview || user?.photoUrl}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={preview || (user?.photoUrl ? `http://localhost:3001/uploads/${user.photoUrl}` : 'https://via.placeholder.com/150')}
                            alt="Profile Preview"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f8f9fa' }}
                        />
                        <motion.label
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            htmlFor="photo-upload"
                            style={{
                                position: 'absolute', bottom: '5px', right: '5px',
                                backgroundColor: '#3498db', color: 'white',
                                padding: '8px', borderRadius: '50%', cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            <Camera size={20} />
                        </motion.label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ width: '100%' }}>
                        <AnimatePresence mode="wait">
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        padding: '1rem', borderRadius: '8px', marginBottom: '1rem',
                                        backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                                        color: message.type === 'error' ? '#ef4444' : '#22c55e',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: selectedFile && !loading ? 1.02 : 1 }}
                            whileTap={{ scale: selectedFile && !loading ? 0.98 : 1 }}
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: !selectedFile || loading ? '#94a3b8' : '#2c3e50',
                                color: 'white',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: !selectedFile || loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'background 0.2s'
                            }}
                        >
                            <Save size={20} />
                            {loading ? 'Subiendo...' : 'Guardar Cambios'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BarberSettings;
