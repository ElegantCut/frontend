import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthClient } from '../../auth/authClient';
import api from '../../lib/axios';
import { Camera, Save, AlertCircle, CheckCircle, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { getCloudinaryUrl } from '../../lib/utils/imageHelper';

const BarberSettings = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoMessage, setPhotoMessage] = useState({ type: '', text: '' });

    // Personal Profile State
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState({
        prim_nombre: '',
        seg_nombre: '',
        apellido1: '',
        apellido2: '',
        email: '',
        telefono: '',
        foto_perfil: '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Portfolio State
    const [portfolioData, setPortfolioData] = useState({
        biografia: '',
        experiencia: '',
        especialidades: '',
        instagram: '',
        fotos_portafolio: []
    });
    const [portfolioLoading, setPortfolioLoading] = useState(false);
    const [portfolioMessage, setPortfolioMessage] = useState({ type: '', text: '' });
    const [uploadingGallery, setUploadingGallery] = useState(false);

    // Cargar datos actuales del perfil y portafolio al montar
    React.useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = AuthClient.getUser();
            const targetUserId = currentUser?.userId || currentUser?.id || currentUser?.id_usuario;

            if (!targetUserId) return;
            try {
                // Traer datos mediante /barbers/:id que incluye portafolio y datos personales del barbero
                const response = await api.get(`/barbers/${targetUserId}`);
                const data = response.data;
                // Mapear datos personales
                setProfileData({
                    prim_nombre: data.prim_nombre || '',
                    seg_nombre: data.seg_nombre || '',
                    apellido1: data.apellido1 || '',
                    apellido2: data.apellido2 || '',
                    email: data.email || '',
                    telefono: data.telefono || '',
                    foto_perfil: data.foto_perfil || '',
                });

                // Mapear datos del portafolio
                if (data && data.portafolios) {
                    // La base de datos puede devolver un objeto directo o un arreglo
                    const port = Array.isArray(data.portafolios) ? data.portafolios[0] : data.portafolios;

                    if (port) {
                        let specs = port.especialidades || '';
                        if (typeof specs === 'string' && specs.startsWith('[')) {
                            try { specs = JSON.parse(specs).join(', '); } catch (e) { }
                        }
                        setPortfolioData({
                            biografia: port.biografia || '',
                            experiencia: port.experiencia || '',
                            especialidades: Array.isArray(specs) ? specs.join(', ') : specs,
                            instagram: port.instagram || ''
                        });
                    }
                    const loadUserData = async () => {
                        try {
                            // 1. Obtener perfil completo directamente de la API
                            const meResponse = await api.get('/users/me');
                            const userData = meResponse.data;
                            setUser(userData);

                            setProfileData({
                                prim_nombre: userData.prim_nombre || '',
                                seg_nombre: userData.seg_nombre || '',
                                apellido1: userData.apellido1 || '',
                                apellido2: userData.apellido2 || '',
                                email: userData.email || '',
                                telefono: userData.telefono || '',
                                foto_perfil: userData.foto_perfil || '',
                            });

                            // 2. Obtener portafolio por su id_usuario
                            if (userData.id_usuario) {
                                const portResponse = await api.get(`/portabarbero/${userData.id_usuario}`);
                                const port = portResponse.data;
                                if (port) {
                                    let specs = port.especialidades || '';
                                    if (typeof specs === 'string' && (specs.startsWith('[') || specs.startsWith('"'))) {
                                        try {
                                            const parsed = JSON.parse(specs);
                                            specs = Array.isArray(parsed) ? parsed.join(', ') : parsed;
                                        } catch (e) { }
                                    } else if (Array.isArray(specs)) {
                                        specs = specs.join(', ');
                                    }

                                    let fotos = [];
                                    if (port.fotos_portafolio) {
                                        if (typeof port.fotos_portafolio === 'string' && port.fotos_portafolio.startsWith('[')) {
                                            try { fotos = JSON.parse(port.fotos_portafolio); } catch (e) { }
                                        } else if (Array.isArray(port.fotos_portafolio)) {
                                            fotos = port.fotos_portafolio;
                                        }
                                    }

                                    setPortfolioData({
                                        biografia: port.biografia || '',
                                        experiencia: port.experiencia || '',
                                        especialidades: specs || '',
                                        instagram: port.instagram || '',
                                        fotos_portafolio: Array.isArray(fotos) ? fotos : []
                                    });
                                    origin / develop
                                }
                            }
                        } catch (err) {
                            console.error("Error al cargar datos del barbero:", err);
                            setProfileMessage({ type: 'error', text: 'No se pudieron cargar los datos del perfil.' });
                        }
                    };

                    useEffect(() => {
                        loadUserData();
                    }, []);

                    const handleProfileChange = (e) => {
                        const { name, value } = e.target;
                        setProfileData(prev => ({ ...prev, [name]: value }));
                    };

                    const handlePortfolioChange = (e) => {
                        const { name, value } = e.target;
                        setPortfolioData(prev => ({ ...prev, [name]: value }));
                    };

                    // Actualizar datos personales
                    const handleUpdateProfile = async (e) => {
                        e.preventDefault();
                        setProfileLoading(true);
                        setProfileMessage({ type: '', text: '' });

                        try {
                            const payload = {
                                prim_nombre: profileData.prim_nombre,
                                seg_nombre: profileData.seg_nombre,
                                apellido1: profileData.apellido1,
                                apellido2: profileData.apellido2,
                                email: profileData.email,
                                telefono: profileData.telefono,
                            };

                            const response = await api.patch('/users/profile', payload);

                            if (response.status === 200 || response.data) {
                                setProfileMessage({ type: 'success', text: 'Datos personales actualizados exitosamente.' });
                                // Actualizar sesión local
                                const currentUser = AuthClient.getUser() || {};
                                const name = `${profileData.prim_nombre} ${profileData.apellido1}`.trim();
                                AuthClient.setUser({ ...currentUser, name, email: profileData.email });
                                setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
                            }
                        } catch (error) {
                            console.error("Error al actualizar perfil:", error);
                            const msg = error.response?.data?.message || error.message || 'Error de conexión';
                            setProfileMessage({ type: 'error', text: Array.isArray(msg) ? msg.join(', ') : msg });
                        } finally {
                            setProfileLoading(false);
                        }
                    };

                    // Actualizar portafolio
                    const handleUpdatePortfolio = async (e) => {
                        e.preventDefault();
                        const targetUserId = user?.id_usuario || AuthClient.getUser()?.userId || AuthClient.getUser()?.id;

                        if (!targetUserId) {
                            setPortfolioMessage({ type: 'error', text: 'Error: No se encontró el ID de usuario. Por favor recarga la página.' });
                            return;
                        }

                        setPortfolioLoading(true);
                        setPortfolioMessage({ type: '', text: '' });

                        try {
                            // Transformar especialidades a array
                            const espArray = typeof portfolioData.especialidades === 'string'
                                ? portfolioData.especialidades.split(',').map(s => s.trim()).filter(Boolean)
                                : portfolioData.especialidades;

                            const payload = {
                                id_usuario: Number(targetUserId),
                                biografia: portfolioData.biografia || '',
                                experiencia: portfolioData.experiencia || '',
                                instagram: portfolioData.instagram || '',
                                especialidades: espArray,
                                fotos_portafolio: portfolioData.fotos_portafolio || []
                            };

                            const response = await api.post('/portabarbero', payload);


                            const data = response.data;
                            if (response.status >= 200 && response.status < 300) {

                                if (response.status === 200 || response.status === 201 || response.data) {
                                    origin / develop
                                    setPortfolioMessage({ type: 'success', text: 'Portafolio actualizado exitosamente.' });
                                    setTimeout(() => setPortfolioMessage({ type: '', text: '' }), 4000);
                                } else {
                                    setPortfolioMessage({ type: 'error', text: data?.message || 'Error al actualizar el portafolio.' });
                                }
                            } catch (error) {
                                console.error("Error al actualizar portafolio:", error);
                                const msg = error.response?.data?.message || error.message || 'Error de conexión';
                                setPortfolioMessage({ type: 'error', text: Array.isArray(msg) ? msg.join(', ') : msg });
                            } finally {
                                setPortfolioLoading(false);
                            }
                        };

                        // Manejo de cambio de archivo de foto de perfil
                        const handleFileChange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                if (!file.type.startsWith('image/')) {
                                    setPhotoMessage({ type: 'error', text: 'Solo se permiten archivos de imagen.' });
                                    return;
                                }
                                if (file.size > 5 * 1024 * 1024) {
                                    setPhotoMessage({ type: 'error', text: 'La imagen no debe superar los 5MB.' });
                                    return;
                                }
                                setSelectedFile(file);
                                setPreview(URL.createObjectURL(file));
                                setPhotoMessage({ type: '', text: '' });
                            }
                        };

                        // Subir foto de perfil a Cloudinary
                        const handleUploadPhoto = async () => {
                            if (!selectedFile) return;

                            setPhotoLoading(true);
                            setPhotoMessage({ type: '', text: '' });

                            try {
                                const targetUserId = user?.id_usuario || AuthClient.getUser()?.userId;
                                const result = await AuthClient.uploadProfilePhoto(selectedFile, targetUserId);

                                if (result.success) {
                                    setPhotoMessage({ type: 'success', text: 'Foto de perfil actualizada correctamente.' });
                                    setProfileData(prev => ({ ...prev, foto_perfil: result.photoUrl }));
                                    setSelectedFile(null);
                                    setTimeout(() => setPhotoMessage({ type: '', text: '' }), 4000);
                                } else {
                                    setPhotoMessage({ type: 'error', text: result.error || 'Error al subir la imagen.' });
                                }
                            } catch (error) {
                                setPhotoMessage({ type: 'error', text: 'Error de conexión al subir la imagen.' });
                            } finally {
                                setPhotoLoading(false);
                            }
                        };

                        // Subir foto a la galería del portafolio
                        const handleAddGalleryPhoto = async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            setUploadingGallery(true);
                            try {
                                const formData = new FormData();
                                formData.append('file', file);

                                const response = await api.post('/uploads/upload', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });

                                if (response.data && response.data.url) {
                                    const newPhotoUrl = response.data.url;
                                    const updatedPhotos = [...portfolioData.fotos_portafolio, newPhotoUrl];
                                    setPortfolioData(prev => ({ ...prev, fotos_portafolio: updatedPhotos }));

                                    // Guardar automáticamente en el portafolio
                                    const targetUserId = user?.id_usuario || AuthClient.getUser()?.userId;
                                    if (targetUserId) {
                                        await api.post('/portabarbero', {
                                            id_usuario: Number(targetUserId),
                                            biografia: portfolioData.biografia,
                                            experiencia: portfolioData.experiencia,
                                            instagram: portfolioData.instagram,
                                            especialidades: typeof portfolioData.especialidades === 'string'
                                                ? portfolioData.especialidades.split(',').map(s => s.trim()).filter(Boolean)
                                                : portfolioData.especialidades,
                                            fotos_portafolio: updatedPhotos
                                        });
                                    }
                                    setPortfolioMessage({ type: 'success', text: 'Foto agregada a la galería.' });
                                    setTimeout(() => setPortfolioMessage({ type: '', text: '' }), 3000);
                                }
                            } catch (error) {
                                console.error("Error subiendo foto de galería:", error);
                                setPortfolioMessage({ type: 'error', text: 'Error al subir foto de la galería.' });
                            } finally {
                                setUploadingGallery(false);
                                e.target.value = '';
                            }
                        };

                        // Eliminar foto de la galería
                        const handleRemoveGalleryPhoto = async (indexToRemove) => {
                            const updatedPhotos = portfolioData.fotos_portafolio.filter((_, idx) => idx !== indexToRemove);
                            setPortfolioData(prev => ({ ...prev, fotos_portafolio: updatedPhotos }));

                            const targetUserId = user?.id_usuario || AuthClient.getUser()?.userId;
                            if (targetUserId) {
                                try {
                                    await api.post('/portabarbero', {
                                        id_usuario: Number(targetUserId),
                                        biografia: portfolioData.biografia,
                                        experiencia: portfolioData.experiencia,
                                        instagram: portfolioData.instagram,
                                        especialidades: typeof portfolioData.especialidades === 'string'
                                            ? portfolioData.especialidades.split(',').map(s => s.trim()).filter(Boolean)
                                            : portfolioData.especialidades,
                                        fotos_portafolio: updatedPhotos
                                    });
                                    setPortfolioMessage({ type: 'success', text: 'Foto eliminada de la galería.' });
                                    setTimeout(() => setPortfolioMessage({ type: '', text: '' }), 3000);
                                } catch (err) {
                                    console.error("Error al actualizar galería:", err);
                                }
                            }
                        };

                        const currentPhotoSrc = preview || (profileData.foto_perfil ? getCloudinaryUrl(profileData.foto_perfil) : null);

                        return (
                            <div>
                                <header className="tab-header mb-4">
                                    <h2>Configuración de Perfil</h2>
                                </header>

                                {/* ═══ Foto de Perfil ═══ */}
                                <div className="ios-section-header">Foto de Perfil</div>
                                <motion.div
                                    className="ios-card mb-4"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    style={{ maxWidth: '650px' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                                            {currentPhotoSrc ? (
                                                <img
                                                    key={currentPhotoSrc}
                                                    src={currentPhotoSrc}
                                                    alt="Foto de Perfil"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: '3px solid var(--barber-border, #3f3f46)',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#bc2041',
                                                        color: '#fff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '3rem',
                                                        fontWeight: 'bold',
                                                        border: '3px solid var(--barber-border, #3f3f46)',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    {profileData.prim_nombre ? profileData.prim_nombre.charAt(0).toUpperCase() : 'B'}
                                                </div>
                                            )}

                                            <label
                                                htmlFor="photo-upload"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '5px',
                                                    right: '5px',
                                                    backgroundColor: '#bc2041',
                                                    color: 'white',
                                                    padding: '8px',
                                                    borderRadius: '50%',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 8px rgba(188,32,65,0.4)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Cambiar foto de perfil"
                                            >
                                                <Camera size={18} />
                                            </label>
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
                                                {photoMessage.text && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className={`ios-badge w-100 text-center d-flex align-items-center justify-content-center gap-2 ${photoMessage.type === 'error' ? 'danger' : 'success'}`}
                                                        style={{ padding: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}
                                                    >
                                                        {photoMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                                        {photoMessage.text}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {selectedFile && (
                                                <button
                                                    onClick={handleUploadPhoto}
                                                    disabled={photoLoading}
                                                    className="btn-ios w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                                                    style={{ cursor: photoLoading ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <Save size={18} />
                                                    {photoLoading ? 'Subiendo foto...' : 'Guardar Nueva Foto'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* ═══ Información Personal ═══ */}
                                <div className="ios-section-header">Información Personal</div>
                                <motion.div
                                    className="ios-card mb-4"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    style={{ maxWidth: '650px' }}
                                >
                                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ flex: '1 1 200px' }}>
                                                <label className="ios-item-subtitle mb-1 d-block">Primer Nombre *</label>
                                                <input
                                                    type="text"
                                                    name="prim_nombre"
                                                    value={profileData.prim_nombre}
                                                    onChange={handleProfileChange}
                                                    className="ios-search-bar w-100"
                                                    required
                                                />
                                            </div>
                                            <div style={{ flex: '1 1 200px' }}>
                                                <label className="ios-item-subtitle mb-1 d-block">Segundo Nombre</label>
                                                <input
                                                    type="text"
                                                    name="seg_nombre"
                                                    value={profileData.seg_nombre}
                                                    onChange={handleProfileChange}
                                                    className="ios-search-bar w-100"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ flex: '1 1 200px' }}>
                                                <label className="ios-item-subtitle mb-1 d-block">Primer Apellido *</label>
                                                <input
                                                    type="text"
                                                    name="apellido1"
                                                    value={profileData.apellido1}
                                                    onChange={handleProfileChange}
                                                    className="ios-search-bar w-100"
                                                    required
                                                />
                                            </div>
                                            <div style={{ flex: '1 1 200px' }}>
                                                <label className="ios-item-subtitle mb-1 d-block">Segundo Apellido</label>
                                                <input
                                                    type="text"
                                                    name="apellido2"
                                                    value={profileData.apellido2}
                                                    onChange={handleProfileChange}
                                                    className="ios-search-bar w-100"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="ios-item-subtitle mb-1 d-block">Correo Electrónico *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleProfileChange}
                                                className="ios-search-bar w-100"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="ios-item-subtitle mb-1 d-block">Teléfono</label>
                                            <input
                                                type="tel"
                                                name="telefono"
                                                value={profileData.telefono}
                                                onChange={handleProfileChange}
                                                className="ios-search-bar w-100"
                                                placeholder="Ej. 3001234567"
                                            />
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {profileMessage.text && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`ios-badge w-100 text-center d-flex align-items-center justify-content-center gap-2 ${profileMessage.type === 'error' ? 'danger' : 'success'}`}
                                                    style={{ padding: '10px', fontSize: '0.9rem' }}
                                                >
                                                    {profileMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                                    {profileMessage.text}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="d-flex justify-content-end mt-2">
                                            <button
                                                type="submit"
                                                disabled={profileLoading}
                                                className="btn-ios px-4 py-2 d-flex align-items-center gap-2"
                                            >
                                                <Save size={18} />
                                                {profileLoading ? 'Guardando...' : 'Guardar Información Personal'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>

                                {/* ═══ Información del Portafolio ═══ */}
                                <div className="ios-section-header">Información del Portafolio Profesional</div>
                                <motion.div
                                    className="ios-card mb-4"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{ maxWidth: '650px' }}
                                >
                                    <form onSubmit={handleUpdatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <div>
                                            <label className="ios-item-subtitle mb-1 d-block">Biografía (Sobre mí)</label>
                                            <textarea
                                                name="biografia"
                                                value={portfolioData.biografia}
                                                onChange={handlePortfolioChange}
                                                rows="4"
                                                className="ios-search-bar w-100"
                                                placeholder="Cuéntale a tus clientes acerca de tu estilo, trayectoria y experiencia..."
                                                style={{ resize: 'vertical' }}
                                            />
                                        </div>

                                        <div>
                                            <label className="ios-item-subtitle mb-1 d-block">Experiencia / Cargo</label>
                                            <input
                                                type="text"
                                                name="experiencia"
                                                value={portfolioData.experiencia}
                                                onChange={handlePortfolioChange}
                                                className="ios-search-bar w-100"
                                                placeholder="Ej. Barbero Profesional • 5 años de experiencia"
                                            />
                                        </div>

                                        <div>
                                            <label className="ios-item-subtitle mb-1 d-block">Especialidades</label>
                                            <input
                                                type="text"
                                                name="especialidades"
                                                value={portfolioData.especialidades}
                                                onChange={handlePortfolioChange}
                                                className="ios-search-bar w-100"
                                                placeholder="Ej. Corte Clásico, Degradado / Fade, Diseño de Barba, Freestyle"
                                            />
                                            <small className="text-white-50" style={{ marginTop: '0.25rem', display: 'block', fontSize: '0.8rem' }}>
                                                Separa las especialidades con comas (,).
                                            </small>
                                        </div>

                                        <div>
                                            <label className="ios-item-subtitle mb-1 d-block">Instagram</label>
                                            <input
                                                type="text"
                                                name="instagram"
                                                value={portfolioData.instagram}
                                                onChange={handlePortfolioChange}
                                                className="ios-search-bar w-100"
                                                placeholder="Ej. @tu_usuario_instagram"
                                            />
                                        </div>

                                        {/* Galería de Fotos del Portafolio */}
                                        <div>
                                            <label className="ios-item-subtitle mb-2 d-flex justify-content-between align-items-center">
                                                <span>Galería de Trabajos ({portfolioData.fotos_portafolio.length})</span>
                                                <label
                                                    htmlFor="gallery-upload"
                                                    className="btn-ios px-3 py-1"
                                                    style={{ fontSize: '0.8rem', cursor: uploadingGallery ? 'not-allowed' : 'pointer', margin: 0 }}
                                                >
                                                    <Plus size={14} className="me-1" />
                                                    {uploadingGallery ? 'Subiendo...' : 'Agregar Foto'}
                                                </label>
                                                <input
                                                    id="gallery-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAddGalleryPhoto}
                                                    disabled={uploadingGallery}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>

                                            {portfolioData.fotos_portafolio.length > 0 ? (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                                    {portfolioData.fotos_portafolio.map((foto, idx) => (
                                                        <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--barber-border, #3f3f46)' }}>
                                                            <img
                                                                src={foto}
                                                                alt={`Trabajo ${idx + 1}`}
                                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveGalleryPhoto(idx)}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '4px',
                                                                    right: '4px',
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50%',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer'
                                                                }}
                                                                title="Eliminar foto"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-3 text-center rounded" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                    <ImageIcon size={28} className="text-white-50 mb-1" />
                                                    <p className="text-white-50 small mb-0">Aún no has agregado fotos a tu galería de trabajos.</p>
                                                </div>
                                            )}
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {portfolioMessage.text && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`ios-badge w-100 text-center d-flex align-items-center justify-content-center gap-2 ${portfolioMessage.type === 'error' ? 'danger' : 'success'}`}
                                                    style={{ padding: '10px', fontSize: '0.9rem' }}
                                                >
                                                    {portfolioMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                                    {portfolioMessage.text}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="d-flex justify-content-end mt-2">
                                            <button
                                                type="submit"
                                                disabled={portfolioLoading}
                                                className="btn-ios px-4 py-2 d-flex align-items-center gap-2"
                                            >
                                                <Save size={18} />
                                                {portfolioLoading ? 'Guardando...' : 'Guardar Portafolio'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        );
                    };

                    export default BarberSettings;
                }
            }
