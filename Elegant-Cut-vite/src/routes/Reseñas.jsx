import React, { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { useAuth } from '../auth/UseAuth';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AlertCircle, CheckCircle2, Star, User, Scissors, MessageSquare } from 'lucide-react';
import './Reseñas.css';

// Subcomponente para la columna de reseñas infinita
const ReviewColumn = ({ reviews, duration = 20, className = "" }) => {
  if (!reviews || reviews.length === 0) return null;
  return (
    <div className={`it-column-container ${className}`} style={{ flex: 1, maxWidth: '350px' }}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1.5rem' }}
      >
        {[...new Array(2).fill(0)].map((_, index) => (
          <Fragment key={index}>
            {reviews.map((r, i) => {
              const nombre = r.usuarios_resenas_id_clienteTousuarios?.prim_nombre || r.nombre_cliente || 'Cliente Anónimo';
              const target = r.barbero ? `A: ${r.barbero.prim_nombre}` : 'A: ElegantCut';
              
              return (
                <div className="it-card" key={`${index}-${i}`}>
                  <div className="it-card-text" style={{ fontSize: '0.95rem' }}>"{r.comentario}"</div>
                  <div className="it-card-footer">
                    <div className="it-card-avatar">
                      {nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="it-card-info">
                      <span className="it-card-name">{nombre}</span>
                      <span className="it-card-role">{target}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </motion.div>
    </div>
  );
};

const Reseñas = () => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [formData, setFormData] = useState({
    id_cliente: '',
    calificacion: '5',
    comentario: '',
    dirigido_a: 'establecimiento',
    id_barbero: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchReviews();
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        id_cliente: user.userId || user.id_usuario || user.id || ''
      }));
    }
  }, [isAuthenticated, user]);

  const fetchBarbers = async () => {
    try {
      const response = await api.get('/barbers/public');
      const data = response.data?.data || response.data || [];
      if (Array.isArray(data)) setBarbers(data);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      await api.post('/reviews', formData);
      setStatus({ type: 'success', message: '¡Gracias por tu reseña!' });
      setFormData({
        id_cliente: (isAuthenticated && (user?.userId || user?.id_usuario || user?.id)) || '',
        calificacion: '5',
        comentario: '',
        dirigido_a: 'establecimiento',
        id_barbero: ''
      });
      fetchReviews();
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'Error al enviar la reseña' });
    }
  };

  // Preparar columnas infinitas
  const expandedReviews = reviews.length > 0 ? [...reviews, ...reviews, ...reviews, ...reviews].slice(0, 12) : [];
  const col1 = expandedReviews.slice(0, 4);
  const col2 = expandedReviews.slice(4, 8);

  return (
    <AnimatedPage>
      <div className="reviews-page-root">
        <div className="reviews-split-layout">
          
          {/* ── COLUMNA IZQUIERDA: FORMULARIO ── */}
          <div className="reviews-form-col">
            <div className="rf-header">
              <h1 className="rf-title">Tu Opinión</h1>
              <p className="rf-subtitle">
                Comparte tu experiencia en ElegantCut. Valoramos cada detalle para 
                seguir perfeccionando nuestro arte.
              </p>
            </div>

            {!isAuthenticated && (
              <div className="rf-alert warning">
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <div>
                  Debes <a href="/login">iniciar sesión</a> para poder escribir 
                  y publicar una reseña.
                </div>
              </div>
            )}

            {status.message && status.type === 'success' && (
              <div className="rf-alert success">
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <div>{status.message}</div>
              </div>
            )}

            <motion.div 
              className="rf-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <form onSubmit={handleSubmit} style={{ opacity: isAuthenticated ? 1 : 0.6 }}>
                
                {/* ── SECCIÓN: Calificación ── */}
                <motion.div 
                  className="rf-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="rf-label">Calificación</h3>
                  <div className="rf-info-container">
                    <Star className="rf-input-icon" />
                    <div className="rf-stars" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`rf-star-btn ${star <= (hoverRating || Number(formData.calificacion)) ? 'active' : ''}`}
                          onClick={() => isAuthenticated && setFormData(prev => ({ ...prev, calificacion: star.toString() }))}
                          onMouseEnter={() => isAuthenticated && setHoverRating(star)}
                          disabled={!isAuthenticated}
                        >
                          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        </button>
                      ))}
                      <span className="rf-star-label">
                        {Number(hoverRating || formData.calificacion) === 5 ? '¡Excelente!' :
                         Number(hoverRating || formData.calificacion) === 4 ? 'Muy Bueno' :
                         Number(hoverRating || formData.calificacion) === 3 ? 'Bueno' :
                         Number(hoverRating || formData.calificacion) === 2 ? 'Regular' : 'Malo'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* ── SECCIÓN: Destinatario ── */}
                <motion.div 
                  className="rf-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="rf-label">Destinatario</h3>
                  <div className="rf-flex-row">
                    <button 
                      type="button" 
                      onClick={() => isAuthenticated && setFormData(prev => ({...prev, dirigido_a: 'establecimiento', id_barbero: ''}))}
                      className={`rf-info-button ${formData.dirigido_a === 'establecimiento' ? 'active' : ''}`}
                      disabled={!isAuthenticated}
                    >
                      <User className="rf-input-icon" />
                      <span>Establecimiento</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => isAuthenticated && setFormData(prev => ({...prev, dirigido_a: 'barbero'}))}
                      className={`rf-info-button ${formData.dirigido_a === 'barbero' ? 'active' : ''}`}
                      disabled={!isAuthenticated}
                    >
                      <Scissors className="rf-input-icon" />
                      <span>A un Barbero</span>
                    </button>
                  </div>
                </motion.div>

                {/* ── SECCIÓN: Selección de Barbero ── */}
                {formData.dirigido_a === 'barbero' && (
                  <motion.div 
                    className="rf-group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="rf-label">Selecciona el Barbero</h3>
                    <div className="rf-input-wrapper">
                      <Scissors className="rf-input-icon absolute" />
                      <select
                        className="rf-select-icon"
                        name="id_barbero"
                        value={formData.id_barbero}
                        onChange={handleChange}
                        disabled={!isAuthenticated}
                        required={formData.dirigido_a === 'barbero'}
                      >
                        <option value="">-- Elige un barbero --</option>
                        {barbers.filter(b => b.estado).map(barbero => (
                          <option key={barbero.id_usuario} value={barbero.id_usuario}>
                            {barbero.prim_nombre} {barbero.apellido1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* ── SECCIÓN: Reseña ── */}
                <motion.div 
                  className="rf-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="rf-label">Tu Reseña</h3>
                  <div className="rf-input-wrapper">
                    <MessageSquare className="rf-input-icon absolute top" />
                    <textarea
                      className="rf-textarea-icon"
                      name="comentario"
                      value={formData.comentario}
                      onChange={handleChange}
                      required
                      disabled={!isAuthenticated}
                      placeholder={isAuthenticated ? "Cuéntanos sobre tu experiencia..." : "Inicia sesión para escribir tu reseña..."}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="rf-submit"
                    disabled={status.type === 'loading' || !isAuthenticated}
                  >
                    {status.type === 'loading' ? 'Enviando...' : 'Publicar Reseña'}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>

          {/* ── COLUMNA DERECHA: INFINITE SCROLL ── */}
          <div className="reviews-list-col">
            {loading ? (
              <div style={{ textAlign: 'center', color: '#c9a84c', marginTop: '4rem' }}>
                Cargando reseñas...
              </div>
            ) : reviews.length > 0 ? (
              <div className="rl-mask">
                <ReviewColumn reviews={col1} duration={18} />
                <ReviewColumn reviews={col2} duration={24} className="hidden-mobile" />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: '4rem' }}>
                Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
              </div>
            )}
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
};

export default Reseñas;