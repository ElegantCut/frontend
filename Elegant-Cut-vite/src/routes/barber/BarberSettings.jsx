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
        <div>
            {/* Header consistente con el admin panel */}
            <header className="tab-header">
                <h2>Configuración de Perfil</h2>
            </header>

            {/* ═══ Foto de Perfil ═══ */}
            <div className="ios-section-header">Foto de Perfil</div>
            <motion.div
                className="ios-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ maxWidth: '600px' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                    <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                        <motion.img
                            key={preview || user?.photoUrl}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={preview || (user?.photoUrl ? `${UPLOADS_BASE_URL}/${user.photoUrl}` : 'https://via.placeholder.com/150')}
                            alt="Profile Preview"
                            style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                objectFit: 'cover', border: '3px solid var(--barber-border)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                            }}
                        />
                        <motion.label
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            htmlFor="photo-upload"
                            style={{
                                position: 'absolute', bottom: '5px', right: '5px',
                                backgroundColor: 'var(--barber-red)', color: 'white',
                                padding: '8px', borderRadius: '50%', cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(188,32,65,0.4)'
                            }}
                        >
                            <Camera size={18} />
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
                                    className={`ios-badge w-100 text-center d-flex align-items-center justify-content-center gap-2 ${message.type === 'error' ? 'danger' : 'success'}`}
                                    style={{ padding: '12px', marginBottom: '1rem', fontSize: '0.9rem' }}
                                >
                                    {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: selectedFile && !loading ? 1.02 : 1 }}
                            whileTap={{ scale: selectedFile && !loading ? 0.98 : 1 }}
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                            className={`ios-btn ${!selectedFile || loading ? 'secondary' : 'primary'}`}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <Save size={18} />
                            {loading ? 'Subiendo...' : 'Guardar Foto'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* ═══ Información del Portafolio ═══ */}
            <div className="ios-section-header" style={{ marginTop: '2rem' }}>Información del Portafolio</div>
            <motion.div
                className="ios-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ maxWidth: '600px' }}
            >
                <form onSubmit={handleUpdatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    
                    <div>
                        <label className="ios-label">Biografía (Sobre mí)</label>
                        <textarea 
                            name="biografia"
                            value={portfolioData.biografia}
                            onChange={handlePortfolioChange}
                            rows="4"
                            className="ios-input"
                            placeholder="Cuéntale a tus clientes acerca de ti..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label className="ios-label">Experiencia</label>
                        <input 
                            type="text"
                            name="experiencia"
                            value={portfolioData.experiencia}
                            onChange={handlePortfolioChange}
                            className="ios-input"
                            placeholder="Ej. Barber Senior, 5 años de experiencia"
                        />
                    </div>

                    <div>
                        <label className="ios-label">Especialidades</label>
                        <input 
                            type="text"
                            name="especialidades"
                            value={portfolioData.especialidades}
                            onChange={handlePortfolioChange}
                            className="ios-input"
                            placeholder="Ej. Corte Clásico, Fade, Diseño"
                        />
                        <small className="ios-item-subtitle" style={{ marginTop: '0.25rem', display: 'block', fontSize: '0.8rem' }}>
                            Separa las especialidades con comas.
                        </small>
                    </div>

                    <AnimatePresence mode="wait">
                        {portfolioMessage.text && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`ios-badge w-100 text-center d-flex align-items-center justify-content-center gap-2 ${portfolioMessage.type === 'error' ? 'danger' : 'success'}`}
                                style={{ padding: '12px', fontSize: '0.9rem' }}
                            >
                                {portfolioMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                {portfolioMessage.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: !portfolioLoading ? 1.02 : 1 }}
                        whileTap={{ scale: !portfolioLoading ? 0.98 : 1 }}
                        disabled={portfolioLoading}
                        className={`ios-btn ${portfolioLoading ? 'secondary' : 'primary'}`}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                    >
                        <Save size={18} />
                        {portfolioLoading ? 'Guardando...' : 'Guardar Portafolio'}
                    </motion.button>

                </form>
            </motion.div>
        </div>
    );
};

export default BarberSettings;
