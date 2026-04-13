import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthClient } from "../../auth/authClient";
import api, { UPLOADS_BASE_URL } from '../../lib/axios';
import { Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';

const BarberSettings = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const user = AuthClient.getUser();

    // Portfolio State
    const [portfolioData, setPortfolioData] = useState({
        biografia: '',
        experiencia: '',
        especialidades: ''
    });
    const [portfolioLoading, setPortfolioLoading] = useState(false);
    const [portfolioMessage, setPortfolioMessage] = useState({ type: '', text: '' });

    // Cargar datos actuales del portafolio al montar
    React.useEffect(() => {
        const fetchPortfolio = async () => {
            const currentUser = AuthClient.getUser();
            const targetUserId = currentUser?.userId || currentUser?.id || currentUser?.id_usuario;
            
            if (!targetUserId) return;
            try {
                const response = await api.get(`/barbers/${targetUserId}`);
                const data = response.data;
                if (data && data.portafolios && data.portafolios.length > 0) {
                    const port = data.portafolios[0];
                    let specs = port.especialidades || '';
                    if (typeof specs === 'string' && specs.startsWith('[')) {
                        try { specs = JSON.parse(specs).join(', '); } catch(e){}
                    }
                    setPortfolioData({
                        biografia: port.biografia || '',
                        experiencia: port.experiencia || '',
                        especialidades: Array.isArray(specs) ? specs.join(', ') : specs
                    });
                }
            } catch (err) {
                console.error("Error al cargar portafolio", err);
            }
        };
        fetchPortfolio();
    }, []);

    const handlePortfolioChange = (e) => {
        const { name, value } = e.target;
        setPortfolioData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdatePortfolio = async (e) => {
        e.preventDefault();
        
        const currentUser = AuthClient.getUser();
        const targetUserId = currentUser?.userId || currentUser?.id || currentUser?.id_usuario;
        
        if (!targetUserId) {
            setPortfolioMessage({ type: 'error', text: 'Error: Sesión inválida. Por favor, cierra sesión y vuelve a entrar.' });
            return;
        }

        setPortfolioLoading(true);
        setPortfolioMessage({ type: '', text: '' });

        try {
            // Transformar especialidades a array JSON stringificado
            const espArray = portfolioData.especialidades.split(',').map(s => s.trim()).filter(Boolean);
            const payload = {
                biografia: portfolioData.biografia,
                experiencia: portfolioData.experiencia,
                especialidades: JSON.stringify(espArray)
            };

            const response = await api.patch(`/barbers/${targetUserId}`, payload);

            const data = response.data;
            if (response.ok) {
                setPortfolioMessage({ type: 'success', text: 'Portafolio actualizado exitosamente.' });
            } else {
                setPortfolioMessage({ type: 'error', text: data.message || 'Error al actualizar el portafolio.' });
            }
        } catch (error) {
            console.error("Detalles completos del error:", error);
            setPortfolioMessage({ type: 'error', text: `Error interno: ${error.message || 'Desconocido'}` });
        } finally {
            setPortfolioLoading(false);
        }
    };

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
                            src={preview || (user?.photoUrl ? `${UPLOADS_BASE_URL}/${user.photoUrl}` : 'https://via.placeholder.com/150')}
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

            {/* Nueva Tarjeta para el Portafolio */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', marginTop: '2rem' }}
            >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Información del Portafolio</h2>
                <form onSubmit={handleUpdatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Biografía (Sobre mí)</label>
                        <textarea 
                            name="biografia"
                            value={portfolioData.biografia}
                            onChange={handlePortfolioChange}
                            rows="4"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
                            placeholder="Cuéntale a tus clientes acerca de ti..."
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Experiencia</label>
                        <input 
                            type="text"
                            name="experiencia"
                            value={portfolioData.experiencia}
                            onChange={handlePortfolioChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                            placeholder="Ej. Barber Senior, 5 años de experiencia"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Especialidades</label>
                        <input 
                            type="text"
                            name="especialidades"
                            value={portfolioData.especialidades}
                            onChange={handlePortfolioChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                            placeholder="Ej. Corte Clásico, Fade, Diseño"
                        />
                        <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>Separa las especialidades con comas.</small>
                    </div>

                    <AnimatePresence mode="wait">
                        {portfolioMessage.text && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    padding: '1rem', borderRadius: '8px',
                                    backgroundColor: portfolioMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
                                    color: portfolioMessage.type === 'error' ? '#ef4444' : '#22c55e',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    overflow: 'hidden'
                                }}
                            >
                                {portfolioMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                                {portfolioMessage.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: !portfolioLoading ? 1.02 : 1 }}
                        whileTap={{ scale: !portfolioLoading ? 0.98 : 1 }}
                        disabled={portfolioLoading}
                        style={{
                            width: '100%', padding: '0.75rem',
                            backgroundColor: portfolioLoading ? '#94a3b8' : '#2c3e50', color: 'white',
                            borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: '600',
                            cursor: portfolioLoading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            transition: 'background 0.2s', marginTop: '0.5rem'
                        }}
                    >
                        <Save size={20} />
                        {portfolioLoading ? 'Guardando...' : 'Guardar Portafolio'}
                    </motion.button>

                </form>
            </motion.div>
        </div>
    );
};

export default BarberSettings;
