import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import { AuthClient } from '../../auth/authClient';
import { Camera, Save, AlertCircle, CheckCircle, Plus, Trash2, Image as ImageIcon, Shield } from 'lucide-react';
import { getCloudinaryUrl } from '../../lib/utils/imageHelper';

const SettingsTab = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'portfolio', 'reports'
  const [step, setStep] = useState('edit'); // 'edit', 'verify'

  // --- Profile State ---
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    prim_nombre: '',
    seg_nombre: '',
    apellido1: '',
    apellido2: '',
    telefono: '',
    foto_perfil: '',
    password: '',
    confirmPassword: ''
  });
  const [initialData, setInitialData] = useState({});
  const [verificationCode, setVerificationCode] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState({ text: '', type: '' });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- Portfolio State ---
  const [portfolioData, setPortfolioData] = useState({
    biografia: '',
    experiencia: '',
    especialidades: '',
    instagram: '',
    fotos_portafolio: []
  });
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState({ text: '', type: '' });
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // --- Reports State ---
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadUserData = async () => {
    try {
      const response = await api.get('/users/me');
      const currentUser = response.data;
      setUser(currentUser);

      const initial = {
        username: currentUser.username || '',
        email: currentUser.email || '',
        prim_nombre: currentUser.prim_nombre || '',
        seg_nombre: currentUser.seg_nombre || '',
        apellido1: currentUser.apellido1 || '',
        apellido2: currentUser.apellido2 || '',
        telefono: currentUser.telefono || '',
        foto_perfil: currentUser.foto_perfil || '',
      };

      setFormData(prev => ({ ...prev, ...initial }));
      setInitialData(initial);

      // Cargar portafolio si existe para este usuario
      if (currentUser.id_usuario) {
        const portRes = await api.get(`/portabarbero/${currentUser.id_usuario}`);
        const port = portRes.data;
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
        }
      }
    } catch (e) {
      console.error("Error al cargar perfil en SettingsTab:", e);
    }
  };

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/dashboard/reports');
      const data = response.data;
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error("Error loading stats:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePortfolioChange = (e) => {
    setPortfolioData({ ...portfolioData, [e.target.name]: e.target.value });
  };

  // Subir foto de perfil
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setPhotoMessage({ text: 'Solo se permiten imágenes.', type: 'error' });
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPhotoMessage({ text: '', type: '' });
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    setPhotoLoading(true);
    setPhotoMessage({ text: '', type: '' });

    try {
      const targetId = user?.id_usuario || AuthClient.getUser()?.userId;
      const result = await AuthClient.uploadProfilePhoto(selectedFile, targetId);

      if (result.success) {
        setPhotoMessage({ text: 'Foto actualizada correctamente.', type: 'success' });
        setFormData(prev => ({ ...prev, foto_perfil: result.photoUrl }));
        setSelectedFile(null);
        setTimeout(() => setPhotoMessage({ text: '', type: '' }), 4000);
      } else {
        setPhotoMessage({ text: result.error || 'Error al subir imagen.', type: 'error' });
      }
    } catch (err) {
      setPhotoMessage({ text: 'Error de conexión.', type: 'error' });
    } finally {
      setPhotoLoading(false);
    }
  };

  // Guardar Cambios de Perfil
  const initiateUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        prim_nombre: formData.prim_nombre,
        seg_nombre: formData.seg_nombre,
        apellido1: formData.apellido1,
        apellido2: formData.apellido2,
        email: formData.email,
        telefono: formData.telefono,
      };

      const response = await api.patch('/users/profile', payload);

      if (response.status === 200 || response.data) {
        setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
        const updatedUser = { ...user, ...payload };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setInitialData(prev => ({ ...prev, ...payload }));
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const msg = error.response?.data?.message || 'Error al actualizar perfil';
      setMessage({ text: Array.isArray(msg) ? msg.join(', ') : msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Guardar Cambios de Portafolio
  const handleUpdatePortfolio = async (e) => {
    e.preventDefault();
    const targetUserId = user?.id_usuario || AuthClient.getUser()?.userId;

    if (!targetUserId) {
      setPortfolioMessage({ text: 'Error: ID de usuario no disponible.', type: 'error' });
      return;
    }

    setPortfolioLoading(true);
    setPortfolioMessage({ text: '', type: '' });

    try {
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

      if (response.status === 200 || response.status === 201 || response.data) {
        setPortfolioMessage({ text: 'Portafolio actualizado exitosamente.', type: 'success' });
        setTimeout(() => setPortfolioMessage({ text: '', type: '' }), 4000);
      }
    } catch (error) {
      console.error("Error updating portfolio:", error);
      const msg = error.response?.data?.message || 'Error al actualizar portafolio';
      setPortfolioMessage({ text: Array.isArray(msg) ? msg.join(', ') : msg, type: 'error' });
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Subir foto a la galería
  const handleAddGalleryPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingGallery(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const response = await api.post('/uploads/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.url) {
        const newPhotoUrl = response.data.url;
        const updatedPhotos = [...portfolioData.fotos_portafolio, newPhotoUrl];
        setPortfolioData(prev => ({ ...prev, fotos_portafolio: updatedPhotos }));

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
        setPortfolioMessage({ text: 'Foto agregada a la galería.', type: 'success' });
        setTimeout(() => setPortfolioMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      console.error(err);
      setPortfolioMessage({ text: 'Error al subir foto a la galería.', type: 'error' });
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

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
        setPortfolioMessage({ text: 'Foto eliminada de la galería.', type: 'success' });
        setTimeout(() => setPortfolioMessage({ text: '', type: '' }), 3000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Cambio de Contraseña mediante Código
  const requestPasswordChange = async () => {
    if (!formData.confirmUsername || !formData.confirmEmail) {
      setMessage({ text: 'Debe confirmar su usuario y email para proceder.', type: 'error' });
      return;
    }

    if (formData.confirmEmail.toLowerCase() !== initialData.email?.toLowerCase()) {
      setMessage({ text: 'El correo electrónico no coincide con su perfil actual.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await AuthClient.solicitarRecuperacion(formData.confirmEmail);
      if (res.success) {
        setStep('verify');
        setMessage({ text: 'Código enviado a: ' + formData.confirmEmail, type: 'info' });
      } else {
        setMessage({ text: 'Error: ' + res.error, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndSavePassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }
    if (formData.password.length < 6) {
      setMessage({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await AuthClient.verificarCodigoRecuperacion(formData.confirmEmail, verificationCode, formData.password);
      if (res.success) {
        setMessage({ text: 'Contraseña actualizada correctamente.', type: 'success' });
        setStep('edit');
        setVerificationCode('');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '', confirmUsername: '', confirmEmail: '' }));
      } else {
        setMessage({ text: res.error || 'Código incorrecto', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error al cambiar contraseña', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentPhotoSrc = preview || (formData.foto_perfil ? getCloudinaryUrl(formData.foto_perfil) : null);

  return (
    <div className="settings-container">
      <header className="tab-header">
        <h2>Configuración</h2>
      </header>

      {/* Segmented Control — Dark */}
      <div className="ios-segmented-control mb-4">
        <button
          className={`ios-segmented-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        <button
          className={`ios-segmented-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portafolio
        </button>
        <button
          className={`ios-segmented-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reportes
        </button>
      </div>

      {/* ════════ PESTAÑA PERFIL ════════ */}
      {activeTab === 'profile' && (
        <div className="ios-content">
          {message.text && (
            <div className={`ios-badge w-100 mb-3 text-center ${message.type === 'error' ? 'danger' : message.type === 'info' ? 'info' : 'success'}`} style={{ padding: '12px' }}>
              {message.text}
            </div>
          )}

          {step === 'edit' ? (
            <>
              {/* Foto de Perfil */}
              <div className="ios-section-header">Foto de Perfil</div>
              <div className="ios-card mb-4" style={{ maxWidth: '600px' }}>
                <div className="d-flex flex-column align-items-center gap-3">
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    {currentPhotoSrc ? (
                      <img
                        src={currentPhotoSrc}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--ios-separator, #3f3f46)' }}
                      />
                    ) : (
                      <div
                        style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#bc2041', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}
                      >
                        {formData.prim_nombre ? formData.prim_nombre.charAt(0).toUpperCase() : 'A'}
                      </div>
                    )}

                    <label
                      htmlFor="admin-photo-upload"
                      style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#bc2041', color: 'white', padding: '7px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Cambiar foto"
                    >
                      <Camera size={16} />
                    </label>
                    <input
                      id="admin-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {photoMessage.text && (
                    <div className={`ios-badge ${photoMessage.type === 'error' ? 'danger' : 'success'}`}>
                      {photoMessage.text}
                    </div>
                  )}

                  {selectedFile && (
                    <button
                      onClick={handleUploadPhoto}
                      disabled={photoLoading}
                      className="btn-ios px-4 py-2"
                    >
                      <Save size={16} className="me-1" />
                      {photoLoading ? 'Subiendo...' : 'Guardar Nueva Foto'}
                    </button>
                  )}
                </div>
              </div>

              {/* Información Personal */}
              <div className="ios-section-header">Información de la Cuenta</div>
              <div className="ios-list-group mb-4" style={{ maxWidth: '600px' }}>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Primer Nombre</span>
                    <input type="text" className="ios-inline-input" name="prim_nombre" value={formData.prim_nombre} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Segundo Nombre</span>
                    <input type="text" className="ios-inline-input" name="seg_nombre" value={formData.seg_nombre} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Primer Apellido</span>
                    <input type="text" className="ios-inline-input" name="apellido1" value={formData.apellido1} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Segundo Apellido</span>
                    <input type="text" className="ios-inline-input" name="apellido2" value={formData.apellido2} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Correo Electrónico</span>
                    <input type="email" className="ios-inline-input" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Teléfono</span>
                    <input type="tel" className="ios-inline-input" name="telefono" value={formData.telefono} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mb-5 pe-2" style={{ maxWidth: '600px' }}>
                <button className="btn-ios px-4 py-2 d-flex align-items-center gap-2" onClick={initiateUpdate} disabled={loading}>
                  <Save size={16} />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              {/* Seguridad */}
              <div className="ios-section-header">Seguridad y Acceso</div>
              <div className="ios-list-group" style={{ maxWidth: '600px' }}>
                <div className="p-3 ios-item-subtitle" style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--ios-separator)' }}>
                  Para cambiar su contraseña, confirme su correo para recibir un código de verificación seguro.
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Confirmar Usuario</span>
                    <input
                      type="text"
                      className="ios-inline-input"
                      placeholder="Username actual"
                      value={formData.confirmUsername || ''}
                      onChange={(e) => setFormData({ ...formData, confirmUsername: e.target.value })}
                    />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Confirmar Email</span>
                    <input
                      type="email"
                      className="ios-inline-input"
                      placeholder="Email actual"
                      value={formData.confirmEmail || ''}
                      onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  className="ios-list-item w-100 border-0 text-danger fw-bold justify-content-center"
                  onClick={requestPasswordChange}
                  disabled={loading}
                  style={{ background: 'transparent', cursor: 'pointer' }}
                >
                  <Shield size={16} className="me-2" />
                  {loading ? 'Enviando código...' : 'Solicitar Código de Cambio de Contraseña'}
                </button>
              </div>
            </>
          ) : (
            <div className="ios-card text-center py-5" style={{ maxWidth: '550px', margin: '0 auto' }}>
              <i className="bi bi-shield-lock text-danger mb-3" style={{ fontSize: '3rem' }}></i>
              <h4 className="ios-item-title mb-1">Verificación de Seguridad</h4>
              <p className="ios-item-subtitle mb-4">Ingresa el código enviado a tu correo.</p>

              <div className="mb-4">
                <input
                  type="text"
                  className="ios-search-bar text-center fs-2 fw-bold"
                  style={{ maxWidth: '220px', letterSpacing: '6px', margin: '0 auto' }}
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>

              <div className="ios-section-header text-start mt-4">Nuevas Credenciales</div>
              <div className="ios-list-group mb-4 text-start">
                <div className="ios-list-item">
                  <input
                    type="password"
                    className="ios-inline-input"
                    placeholder="Nueva Contraseña (mínimo 6 caracteres)"
                    name="password" value={formData.password} onChange={handleChange}
                  />
                </div>
                <div className="ios-list-item">
                  <input
                    type="password"
                    className="ios-inline-input"
                    placeholder="Confirmar Nueva Contraseña"
                    name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex flex-column gap-2 px-4">
                <button className="btn-ios w-100 py-3" onClick={verifyAndSavePassword} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                </button>
                <button className="btn-ios-secondary w-100" onClick={() => setStep('edit')}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════ PESTAÑA PORTAFOLIO ════════ */}
      {activeTab === 'portfolio' && (
        <div className="ios-content">
          <div className="ios-section-header">Portafolio Profesional</div>
          <div className="ios-card mb-4" style={{ maxWidth: '650px' }}>
            <form onSubmit={handleUpdatePortfolio} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="ios-item-subtitle mb-1 d-block">Biografía (Sobre mí)</label>
                <textarea
                  name="biografia"
                  value={portfolioData.biografia}
                  onChange={handlePortfolioChange}
                  rows="4"
                  className="ios-search-bar w-100"
                  placeholder="Descripción profesional..."
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
                  placeholder="Ej. Master Barber & Stylist • 8 años"
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
                  placeholder="Ej. Corte Caballero, Fade, Barba, Tratamientos"
                />
                <small className="text-white-50" style={{ marginTop: '0.25rem', display: 'block', fontSize: '0.8rem' }}>
                  Separa con comas (,).
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
                  placeholder="Ej. @tu_instagram"
                />
              </div>

              {/* Galería */}
              <div>
                <label className="ios-item-subtitle mb-2 d-flex justify-content-between align-items-center">
                  <span>Galería de Trabajos ({portfolioData.fotos_portafolio.length})</span>
                  <label
                    htmlFor="admin-gallery-upload"
                    className="btn-ios px-3 py-1"
                    style={{ fontSize: '0.8rem', cursor: uploadingGallery ? 'not-allowed' : 'pointer', margin: 0 }}
                  >
                    <Plus size={14} className="me-1" />
                    {uploadingGallery ? 'Subiendo...' : 'Agregar Foto'}
                  </label>
                  <input
                    id="admin-gallery-upload"
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
                      <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ios-separator, #3f3f46)' }}>
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
                    <p className="text-white-50 small mb-0">No hay fotos en la galería.</p>
                  </div>
                )}
              </div>

              {portfolioMessage.text && (
                <div className={`ios-badge w-100 text-center ${portfolioMessage.type === 'error' ? 'danger' : 'success'}`} style={{ padding: '10px' }}>
                  {portfolioMessage.text}
                </div>
              )}

              <div className="d-flex justify-content-end mt-2">
                <button
                  type="submit"
                  disabled={portfolioLoading}
                  className="btn-ios px-4 py-2 d-flex align-items-center gap-2"
                >
                  <Save size={16} />
                  {portfolioLoading ? 'Guardando...' : 'Guardar Portafolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ PESTAÑA REPORTES ════════ */}
      {activeTab === 'reports' && (
        <div className="ios-content">
          <div className="ios-section-header">Resumen de Clientes</div>
          <div className="ios-widget-grid">
            <div className="ios-widget">
              <h4 className="text-muted small">MES ACTUAL</h4>
              <p className="value" style={{ color: 'var(--ios-blue, #007aff)' }}>{stats?.newClientsCurrentMonth || 0}</p>
              <span className="ios-item-subtitle">Nuevos registros</span>
            </div>
            <div className="ios-widget">
              <h4 className="text-muted small">MES PASADO</h4>
              <p className="value text-secondary">{stats?.newClientsLastMonth || 0}</p>
              <span className="ios-item-subtitle">Comparativa mensual</span>
            </div>
            <div className="ios-widget" style={{ backgroundColor: '#bc2041', color: 'white' }}>
              <h4 className="text-white-50 small">TOTAL ACTIVOS</h4>
              <p className="value text-white">{stats?.totalActiveClients || 0}</p>
              <span className="text-white-50">Clientes actuales</span>
            </div>
          </div>

          <div className="ios-section-header mt-4">Predicción y Análisis</div>
          <div className="ios-card mt-2" style={{ maxWidth: '650px' }}>
            <h5 className="ios-item-title mb-2">Estado del Crecimiento</h5>
            <p className="ios-item-subtitle mb-0">
              Tu base de datos de clientes activos es de {stats?.totalActiveClients || 0}.
              El flujo de nuevos registros se mantiene constante.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;