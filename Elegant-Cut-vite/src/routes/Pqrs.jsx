import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import AnimatedPage from '../components/shared/AnimatedPage';
import '../styles/pqrs/pqrs.css';
import { AuthClient } from '../lib/utils/authClient';

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
  const [activeTab, setActiveTab] = useState("form-tab");
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  // Animaciones suaves basadas en scroll
  const navOpacity = useTransform(scrollY, [0, 150], [1, 0.4]);
  const navScale = useTransform(scrollY, [0, 150], [1, 0.95]);
  const navY = useTransform(scrollY, [0, 150], [0, 10]);

  // Detectar dirección para mostrar/ocultar completamente si es necesario
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 200) {
      if (isVisible) setIsVisible(false);
    } else {
      if (!isVisible) setIsVisible(true);
    }
  });

  // Verificar sesión al cargar
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








  const consultPqrsStatus = async () => {
    if (!radicadoSearch.trim()) {
      alert('Por favor ingrese un número de radicado');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/pqrs/status/${radicadoSearch}`);
      const result = await response.json();

      if (result.success) {
        setTrackResult(result.data);
      } else {
        setTrackResult(null);
        alert('No se encontró el radicado: ' + result.error);
      }
    } catch (error) {
      console.error("Error consultando estado:", error);
      alert('Error al consultar el estado');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // si no hay usuario logueado, no se puede enviar la pqrs
    if (!currentUser) {
      setShowAuthError(true);
      window.scrollTo(0, 200); // Scroll hacia arriba para ver la alerta
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/pqrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`PQRS enviada con éxito. Su radicado es: ${result.radicado}`);
        window.scrollTo(0, 200); // Scroll arriba
        setFormData({
          requestType: '',
          userName: '',
          userId: '',
          userEmail: '',
          userPhone: '',
          subject: '',
          description: '',
          responseMedium: 'email'
        });
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al enviar la PQRS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div>
        <main>

          {/* Contenido de las pestañas */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "form-tab" && (
                <section className="tab-content active" id="form-tab">
                  <h2>Formulario de PQRS</h2>

                  {showAuthError && (
                    <div className="alert alert-login alert-dismissible fade show" role="alert">
                      <strong>¡Atención!</strong> Para enviar una PQRS debes iniciar sesión primero.
                      <button type="button" className="btn-close" onClick={() => setShowAuthError(false)} aria-label="Close"></button>
                      <div className="mt-2">
                        <Link to="/login" className="btn btn-sm btn-outline-danger">Iniciar Sesión</Link>
                      </div>
                    </div>
                  )}

                  {successMessage && (
                    <div className="alert alert-success-custom alert-dismissible fade show" role="alert">
                      <strong>¡Éxito!</strong> {successMessage}
                      <button type="button" className="btn-close" onClick={() => setSuccessMessage("")} aria-label="Close"></button>
                    </div>
                  )}

                  <form id="pqrs-form" onSubmit={handleSubmit}>
                    {/* Tipo de solicitud */}
                    <div className="form-group">
                      <label htmlFor="request-type">Tipo de solicitud <span className="required">*</span></label>
                      <select
                        id="request-type"
                        name="requestType"
                        required
                        value={formData.requestType}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="peticion">Petición</option>
                        <option value="queja">Queja</option>
                        <option value="reclamo">Reclamo</option>
                        <option value="sugerencia">Sugerencia</option>
                      </select>
                    </div>

                    {/* Datos del usuario */}
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="user-name">Nombre completo <span className="required">*</span></label>
                        <input
                          type="text"
                          id="user-name"
                          name="userName"
                          required
                          value={formData.userName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="user-id">Identificación <span className="required">*</span></label>
                        <input
                          type="text"
                          id="user-id"
                          name="userId"
                          required
                          value={formData.userId}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="user-email">Email <span className="required">*</span></label>
                        <input
                          type="email"
                          id="user-email"
                          name="userEmail"
                          required
                          value={formData.userEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="user-phone">Teléfono <span className="required">*</span></label>
                        <input
                          type="tel"
                          id="user-phone"
                          name="userPhone"
                          required
                          value={formData.userPhone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Asunto y descripción */}
                    <div className="form-group">
                      <label htmlFor="subject">Asunto <span className="required">*</span></label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        maxLength="100"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                      />
                      <div className="char-counter"><span>{formData.subject.length}</span>/100</div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Descripción detallada <span className="required">*</span></label>
                      <textarea
                        id="description"
                        name="description"
                        rows="6"
                        maxLength="1000"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                      <div className="char-counter"><span>{formData.description.length}</span>/1000</div>
                    </div>

                    {/* Medio de respuesta */}
                    <div className="form-group">
                      <label>Medio de respuesta preferido <span className="required">*</span></label>
                      <div className="radio-group">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="responseMedium"
                            value="email"
                            checked={formData.responseMedium === 'email'}
                            onChange={handleInputChange}
                          />
                          <span className="radio-checkmark"></span>
                          Email
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="responseMedium"
                            value="phone"
                            checked={formData.responseMedium === 'phone'}
                            onChange={handleInputChange}
                          />
                          <span className="radio-checkmark"></span>
                          Teléfono
                        </label>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div className="form-group checkbox-group">
                      <label className="checkbox-option">
                        <input type="checkbox" id="terms" name="terms" required />
                        <span className="checkbox-checkmark"></span>
                        Acepto los{" "}
                        <a href="#" id="terms-link">términos y condiciones</a>{" "}
                        y la{" "}
                        <a href="#" id="policy-link">política de tratamiento de datos</a>{" "}
                        <span className="required">*</span>
                      </label>
                    </div>

                    {/* Botones */}
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setFormData({
                          requestType: '', userName: '', userId: '', userEmail: '', userPhone: '', subject: '', description: '', responseMedium: 'email'
                        })}
                      >
                        Limpiar
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar PQRS'}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {activeTab === "track-tab" && (
                <section className="tab-content active" id="track-tab">
                  <h2>Consultar Estado de PQRS</h2>
                  <div className="track-form">
                    <div className="form-group">
                      <label htmlFor="tracking-number">Número de radicado</label>
                      <input
                        type="text"
                        id="tracking-number"
                        name="tracking-number"
                        placeholder="Ej: PQRS-2023-001234"
                        value={radicadoSearch}
                        onChange={(e) => setRadicadoSearch(e.target.value)}
                      />
                      <button id="track-btn" className="btn btn-primary" onClick={consultPqrsStatus}>Consultar</button>
                    </div>
                  </div>

                  {trackResult && (
                    <div id="tracking-result" className="tracking-result" style={{ display: 'block' }}>
                      <h3>Estado de su solicitud</h3>
                      <p><strong>Radicado:</strong> {radicadoSearch}</p>
                      <p><strong>Fecha:</strong> {new Date(trackResult.fecha_creacion).toLocaleDateString()}</p>
                      <p><strong>Estado:</strong> <span className={`status-badge status-${trackResult.estado}`}>{trackResult.estado.replace('_', ' ')}</span></p>
                      {trackResult.respuesta && (
                        <div style={{ marginTop: '15px', padding: '10px', background: '#e9ecef', borderRadius: '5px' }}>
                          <strong>Respuesta:</strong>
                          <p>{trackResult.respuesta}</p>
                          <small className="text-muted">Fecha respuesta: {new Date(trackResult.fecha_respuesta).toLocaleDateString()}</small>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "info-tab" && (
                <section className="tab-content active" id="info-tab">
                  <h2>Información Adicional</h2>
                  <div className="info-content">
                    <div className="info-section">
                      <h3>Tiempos de Respuesta</h3>
                      <ul>
                        <li><strong>Peticiones:</strong> 15 días hábiles</li>
                        <li><strong>Quejas:</strong> 15 días hábiles</li>
                        <li><strong>Reclamos:</strong> 30 días hábiles</li>
                        <li><strong>Sugerencias:</strong> 10 días hábiles</li>
                      </ul>
                    </div>
                    <div className="info-section">
                      <h3>Canales Alternativos de Contacto</h3>
                      <ul>
                        <li><strong>Teléfono:</strong> (01) 800-123-4567</li>
                        <li><strong>Correo electrónico:</strong> pqrs@empresa.com</li>
                        <li><strong>Dirección:</strong> Cra. 6 Este #90 d - 34 sur, Bogotá</li>
                        <li><strong>Horario de atención:</strong> Lunes a Viernes 8:00 AM - 6:00 PM</li>
                      </ul>
                    </div>
                    <div className="info-section">
                      <h3>Política de Tratamiento de Datos</h3>
                      <p>
                        Sus datos personales serán tratados de acuerdo con la Ley de Protección de Datos Personales.
                        Solo serán utilizados para el procesamiento de su PQRS y no serán compartidos con terceros sin su autorización.
                      </p>
                    </div>
                    <div className="info-section">
                      <h3>Términos y Condiciones</h3>
                      <p>
                        Al enviar una PQRS, usted acepta que la información proporcionada es veraz y autoriza su tratamiento para los fines relacionados con la gestión de su solicitud.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* NAVEGACIÓN TIPO IPHONE REFINADA */}
        <motion.div
          className="floating-nav-container"
          style={{
            opacity: navOpacity,
            scale: navScale,
            y: navY
          }}
        >
          <nav className="iphone-nav">
            <button
              className={`nav-item ${activeTab === "form-tab" ? "active" : ""}`}
              onClick={() => setActiveTab("form-tab")}
            >
              <i className="bi bi-plus-circle"></i>
              <AnimatePresence>
                {isVisible && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    Nueva
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              className={`nav-item ${activeTab === "track-tab" ? "active" : ""}`}
              onClick={() => setActiveTab("track-tab")}
            >
              <i className="bi bi-search"></i>
              <AnimatePresence>
                {isVisible && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    Estado
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              className={`nav-item ${activeTab === "info-tab" ? "active" : ""}`}
              onClick={() => setActiveTab("info-tab")}
            >
              <i className="bi bi-info-circle"></i>
              <AnimatePresence>
                {isVisible && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    Info
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </nav>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
