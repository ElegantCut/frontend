import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Info, Send, CheckCircle2, AlertCircle, ChevronRight, User, Mail, Phone, FileText, FileQuestion } from 'lucide-react';
import api from '../lib/axios';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AuthClient } from '../auth/authClient';
import '../styles/pqrs/pqrs.css';

// Variantes de animación
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Pqrs() {
  const [formData, setFormData] = useState({
    requestType: '',
    userName: '',
    userId: '',
    userEmail: '',
    userPhone: '',
    subject: '',
    description: '',
    responseMedium: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [radicadoSearch, setRadicadoSearch] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [activeTab, setActiveTab] = useState("form"); // form, track, info
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    const user = AuthClient.getUser();
    if (user) {
      setCurrentUser(user);
      setFormData(prev => ({
        ...prev,
        userName: user.name || user.prim_nombre + ' ' + (user.apellido1 || ''),
        userEmail: user.email || user.username,
        userPhone: user.telefono || '',
        userId: user.userId || user.id || ''
      }));
    }
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  const consultPqrsStatus = async () => {
    if (!radicadoSearch.trim()) {
      showNotification('error', 'Por favor ingrese un número de radicado');
      return;
    }

    try {
      const response = await api.get(`/pqrs/status/${radicadoSearch}`);
      const result = response.data;

      if (result.success) {
        setTrackResult(result.data);
      } else {
        setTrackResult(null);
        showNotification('error', 'No se encontró el radicado: ' + result.error);
      }
    } catch (error) {
      console.error("Error consultando estado:", error);
      showNotification('error', 'Error al consultar el estado');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showNotification('error', 'Debes iniciar sesión para enviar una PQRS.');
      return;
    }

    setLoading(true);
    try {
      const mapRequestType = {
        'peticion': 'Peticion', 'queja': 'Queja', 'reclamo': 'Reclamo', 'sugerencia': 'Sugerencia'
      };

      const payload = {
        id_usuario: Number(currentUser?.id || currentUser?.userId || currentUser?.id_usuario || 0),
        tipo_solicitud: mapRequestType[formData.requestType] || 'Peticion',
        nombre_completo: formData.userName,
        identificacion: formData.userId,
        email: formData.userEmail,
        telefono: formData.userPhone,
        asunto: formData.subject,
        descripcion: formData.description,
        medio_respuesta: formData.responseMedium
      };

      const response = await api.post('/pqrs', payload);
      if (response.data.success) {
        showNotification('success', `PQRS enviada con éxito. Su radicado es: ${response.data.radicado}`);
        setFormData({
          requestType: '', userName: '', userId: '', userEmail: '', userPhone: '', subject: '', description: '', responseMedium: 'email'
        });
        setActiveTab('track');
        setRadicadoSearch(response.data.radicado);
      } else {
        showNotification('error', 'Error: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error de conexión o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'form', label: 'Nueva Solicitud', icon: MessageSquare, desc: 'Radica una Petición, Queja, Reclamo o Sugerencia.' },
    { id: 'track', label: 'Rastrear Estado', icon: Search, desc: 'Consulta el avance de tu PQRS con tu radicado.' },
    { id: 'info', label: 'Centro de Ayuda', icon: Info, desc: 'Políticas, tiempos de respuesta y canales alternos.' }
  ];

  return (
    <AnimatedPage>
      <main className="pqrs-modern-layout" style={{ maxWidth: '100%', margin: 0, padding: '120px 20px 60px', background: '#060606', width: '100%' }}>
        <div className="pqrs-container">
          
          {/* Sidebar / Navegación */}
          <aside className="pqrs-sidebar">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="sidebar-header">
              <h1 className="pqrs-title">Servicio al Cliente</h1>
              <p className="pqrs-subtitle">Estamos aquí para escucharte y mejorar tu experiencia.</p>
            </motion.div>

            <nav className="pqrs-nav-menu">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                  >
                    <div className="nav-tab-icon">
                      <Icon size={20} />
                    </div>
                    <div className="nav-tab-text">
                      <span className="nav-tab-label">{tab.label}</span>
                      <span className="nav-tab-desc">{tab.desc}</span>
                    </div>
                    {isActive && (
                      <motion.div className="nav-tab-indicator" layoutId="activeTabIndicator" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Área de Contenido Principal */}
          <section className="pqrs-content-area">
            {/* Sistema de Notificaciones */}
            <AnimatePresence>
              {notification.show && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`pqrs-alert ${notification.type === 'error' ? 'alert-danger' : 'alert-success'}`}
                >
                  <div className="alert-icon">
                    {notification.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div className="alert-content">
                    <h4>{notification.type === 'error' ? 'Atención' : '¡Éxito!'}</h4>
                    <p>{notification.message}</p>
                    {notification.type === 'error' && !currentUser && (
                      <Link to="/login" className="alert-action-link">Iniciar Sesión <ChevronRight size={16} /></Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* TAB 1: FORMULARIO */}
              {activeTab === 'form' && (
                <motion.div
                  key="form"
                  variants={containerVariants}
                  initial="hidden" animate="visible" exit={{ opacity: 0, y: 20 }}
                  className="pqrs-panel form-panel"
                >
                  <motion.div variants={itemVariants} className="panel-header">
                    <h2>Radicar Solicitud</h2>
                    <p>Completa el formulario a continuación con el mayor detalle posible.</p>
                  </motion.div>

                  <form onSubmit={handleSubmit} className="premium-form">
                    <motion.div variants={itemVariants} className="form-group-modern">
                      <label><FileQuestion size={16} /> Tipo de solicitud <span className="required">*</span></label>
                      <select name="requestType" required value={formData.requestType} onChange={handleInputChange}>
                        <option value="" disabled>Seleccione una opción</option>
                        <option value="peticion">Petición (Información o consulta)</option>
                        <option value="queja">Queja (Insatisfacción con un servicio)</option>
                        <option value="reclamo">Reclamo (Problema con un producto/servicio)</option>
                        <option value="sugerencia">Sugerencia (Propuesta de mejora)</option>
                      </select>
                    </motion.div>

                    <div className="form-grid-2">
                      <motion.div variants={itemVariants} className="form-group-modern">
                        <label><User size={16} /> Nombre completo <span className="required">*</span></label>
                        <input type="text" name="userName" required value={formData.userName} onChange={handleInputChange} placeholder="Ej. Juan Pérez" />
                      </motion.div>
                      <motion.div variants={itemVariants} className="form-group-modern">
                        <label><FileText size={16} /> Identificación <span className="required">*</span></label>
                        <input type="text" name="userId" required value={formData.userId} onChange={handleInputChange} placeholder="CC o NIT" />
                      </motion.div>
                    </div>

                    <div className="form-grid-2">
                      <motion.div variants={itemVariants} className="form-group-modern">
                        <label><Mail size={16} /> Correo Electrónico <span className="required">*</span></label>
                        <input type="email" name="userEmail" required value={formData.userEmail} onChange={handleInputChange} placeholder="ejemplo@correo.com" />
                      </motion.div>
                      <motion.div variants={itemVariants} className="form-group-modern">
                        <label><Phone size={16} /> Teléfono de Contacto <span className="required">*</span></label>
                        <input type="tel" name="userPhone" required value={formData.userPhone} onChange={handleInputChange} placeholder="Ej. 300 123 4567" />
                      </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="form-group-modern">
                      <label>Asunto Principal <span className="required">*</span></label>
                      <input type="text" name="subject" maxLength="100" required value={formData.subject} onChange={handleInputChange} placeholder="Resumen corto de la solicitud" />
                      <div className="char-count">{formData.subject.length}/100</div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-group-modern">
                      <label>Descripción Detallada <span className="required">*</span></label>
                      <textarea name="description" rows="5" maxLength="1000" required value={formData.description} onChange={handleInputChange} placeholder="Explica tu caso con detalle..." />
                      <div className="char-count">{formData.description.length}/1000</div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-group-modern">
                      <label>Canal de Respuesta Preferido <span className="required">*</span></label>
                      <div className="radio-cards">
                        <label className={`radio-card ${formData.responseMedium === 'email' ? 'selected' : ''}`}>
                          <input type="radio" name="responseMedium" value="email" checked={formData.responseMedium === 'email'} onChange={handleInputChange} />
                          <Mail size={20} />
                          <span>Correo Electrónico</span>
                        </label>
                        <label className={`radio-card ${formData.responseMedium === 'phone' ? 'selected' : ''}`}>
                          <input type="radio" name="responseMedium" value="phone" checked={formData.responseMedium === 'phone'} onChange={handleInputChange} />
                          <Phone size={20} />
                          <span>Vía Telefónica</span>
                        </label>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-actions-modern">
                      <label className="checkbox-modern">
                        <input type="checkbox" required />
                        <div className="checkbox-box"><CheckCircle2 size={16} /></div>
                        <span>Acepto las <a href="#">políticas de privacidad</a> y tratamiento de datos. <span className="required">*</span></span>
                      </label>
                      <button type="submit" className="btn-submit-premium" disabled={loading}>
                        {loading ? <span className="loader-spin"></span> : <><Send size={18} /> Enviar Solicitud</>}
                      </button>
                    </motion.div>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: RASTREO */}
              {activeTab === 'track' && (
                <motion.div
                  key="track"
                  variants={containerVariants}
                  initial="hidden" animate="visible" exit={{ opacity: 0, y: 20 }}
                  className="pqrs-panel track-panel"
                >
                  <motion.div variants={itemVariants} className="panel-header">
                    <h2>Rastrear PQRS</h2>
                    <p>Ingresa tu número de radicado para conocer el estado actual de tu solicitud.</p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="search-box-premium">
                    <div className="search-input-wrapper">
                      <Search size={20} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Ej. PQRS-2026-00123" 
                        value={radicadoSearch}
                        onChange={(e) => setRadicadoSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && consultPqrsStatus()}
                      />
                    </div>
                    <button onClick={consultPqrsStatus} className="btn-search-premium">Consultar</button>
                  </motion.div>

                  <AnimatePresence>
                    {trackResult && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="tracking-result-card"
                      >
                        <div className="result-header">
                          <div>
                            <span className="result-label">Radicado</span>
                            <h3 className="result-value">{radicadoSearch}</h3>
                          </div>
                          <div className={`status-badge-modern status-${trackResult.estado.toLowerCase()}`}>
                            {trackResult.estado.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="result-body">
                          <div className="result-row">
                            <span className="label">Fecha de creación:</span>
                            <span className="value">{new Date(trackResult.fecha_creacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          {trackResult.respuesta_admin && (
                            <div className="admin-response-box">
                              <span className="label"><MessageSquare size={16} /> Respuesta del Administrador:</span>
                              <p className="response-text">{trackResult.respuesta_admin}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* TAB 3: INFO */}
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  variants={containerVariants}
                  initial="hidden" animate="visible" exit={{ opacity: 0, y: 20 }}
                  className="pqrs-panel info-panel"
                >
                  <motion.div variants={itemVariants} className="panel-header">
                    <h2>Centro de Ayuda</h2>
                    <p>Conoce nuestros tiempos de respuesta y canales de comunicación oficiales.</p>
                  </motion.div>

                  <div className="info-cards-grid">
                    <motion.div variants={itemVariants} className="info-card-premium">
                      <div className="info-icon-wrapper"><FileText size={24} /></div>
                      <h3>Tiempos de Respuesta</h3>
                      <ul className="info-list">
                        <li><span>Peticiones:</span> 15 días hábiles</li>
                        <li><span>Quejas:</span> 15 días hábiles</li>
                        <li><span>Reclamos:</span> 30 días hábiles</li>
                        <li><span>Sugerencias:</span> 10 días hábiles</li>
                      </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="info-card-premium">
                      <div className="info-icon-wrapper"><Phone size={24} /></div>
                      <h3>Canales de Contacto</h3>
                      <ul className="info-list">
                        <li><span>Línea Gratuita:</span> 01 8000 123 456</li>
                        <li><span>Email:</span> servicio@elegantcut.com</li>
                        <li><span>Atención:</span> Lunes a Sábado, 8AM - 8PM</li>
                      </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="info-card-premium full-width">
                      <div className="info-icon-wrapper"><Info size={24} /></div>
                      <h3>Tratamiento de Datos Personales</h3>
                      <p className="info-text">
                        En cumplimiento de la Ley Estatutaria 1581 de 2012 de Protección de Datos Personales, 
                        te informamos que los datos suministrados serán tratados de forma confidencial y utilizados 
                        exclusivamente para la gestión y respuesta de tu solicitud PQRS. No serán compartidos con terceros sin autorización explícita.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </main>
    </AnimatedPage>
  );
}
