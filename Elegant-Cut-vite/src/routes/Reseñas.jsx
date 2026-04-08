import api from '../lib/axios';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/UseAuth';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';
import './Reseñas.css';

const Reseñas = () => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [formData, setFormData] = useState({
    id_cliente: '',
    calificacion: '5',
    comentario: '',
    dirigido_a: 'establecimiento',
    id_barbero: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await api.get('/barbers/all');
      const data = response.data?.data || response.data || [];
      if (Array.isArray(data)) {
        setBarbers(data);
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        id_cliente: user.userId || user.id_usuario || user.id || ''
      }));
    }
  }, [isAuthenticated, user]);

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      const response = await api.post('/reviews', formData);

      setStatus({ type: 'success', message: '¡Gracias por tu reseña!' });
      setFormData({
        id_cliente: (isAuthenticated && (user?.userId || user?.id_usuario || user?.id)) || '',
        calificacion: '5',
        comentario: '',
        dirigido_a: 'establecimiento',
        id_barbero: ''
      });
      fetchReviews();

      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'Error al enviar la reseña' });
    }
  };

  const renderStars = (rating) => {
    try {
      const stars = [];
      const numRating = parseInt(rating) || 0;
      const validRating = Math.min(5, Math.max(0, numRating));
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <span key={i} className={`star ${i <= validRating ? '' : 'empty'}`}>
            ★
          </span>
        );
      }
      return stars;
    } catch (e) {
      return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Error fecha';
    }
  };

  return (
    <AnimatedPage>
      <div className="reviews-page">
        <div className="reviews-main-container">
          {/* LEFT SIDE - REVIEWS LIST */}
          <section className="reviews-section">
            <h2>Todas las Reseñas</h2>

            {loading ? (
              <div className="loading-spinner">Cargando reseñas...</div>
            ) : (
              <AnimatedContainer className="reviews-grid">
                {reviews.length > 0 ? (
                  reviews.map((review) => {
                    try {
                      if (!review || !review.id_resena) return null;
                      const nombre = review.usuarios_resenas_id_clienteTousuarios?.prim_nombre || 'Cliente Anónimo';

                      return (
                        <AnimatedItem key={review.id_resena} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-avatar">
                              {nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="reviewer-info">
                              <span className="reviewer-name">{nombre}</span>
                              <span className="review-date">
                                {formatDate(review.fecha_resena)}
                              </span>
                              {review.barbero && (
                                <span className="review-target" style={{display: 'block', fontSize: '0.85rem', color: '#888', marginTop: '2px'}}>
                                  Dirigido a: {review.barbero.prim_nombre} {review.barbero.apellido1}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="review-rating">
                            {renderStars(review.calificacion)}
                          </div>
                          <p className="review-comment">{review.comentario || 'Sin comentario'}</p>
                        </AnimatedItem>
                      );
                    } catch (e) {
                      console.error('Error rendering individual review:', e);
                      return null;
                    }
                  })
                ) : (
                  <div className="no-reviews">
                    <p>Aún no hay reseñas.</p>
                    <p>¡Sé el primero en compartir tu experiencia!</p>
                  </div>
                )}
              </AnimatedContainer>
            )}
          </section>

          {/* RIGHT SIDE - REVIEW FORM */}
          <aside className="form-section">
            <h2>Deja tu Reseña</h2>

            {!isAuthenticated && (
              <div className="alert alert-warning shadow-sm border-0 mb-4" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                  <div>
                    <strong>¡Inicia sesión para comentar!</strong><br />
                    Para poder publicar una reseña, necesitas <a href="/login" className="alert-link">iniciar sesión</a> o <a href="/login" className="alert-link">crear una cuenta</a>.
                  </div>
                </div>
              </div>
            )}

            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className={`review-form ${!isAuthenticated ? 'form-disabled' : ''}`}>


              <div className="form-group">
                <label htmlFor="calificacion">Calificación</label>
                <select
                  id="calificacion"
                  name="calificacion"
                  value={formData.calificacion}
                  onChange={handleChange}
                  disabled={!isAuthenticated}
                >
                  <option value="5">★★★★★ Excelente</option>
                  <option value="4">★★★★☆ Muy Bueno</option>
                  <option value="3">★★★☆☆ Bueno</option>
                  <option value="2">★★☆☆☆ Regular</option>
                  <option value="1">★☆☆☆☆ Malo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Hacia quién va dirigida</label>
                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="dirigido_a"
                      value="establecimiento"
                      checked={formData.dirigido_a === 'establecimiento'}
                      onChange={handleChange}
                      disabled={!isAuthenticated}
                      style={{ margin: 0 }}
                    />
                    Al Establecimiento
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="dirigido_a"
                      value="barbero"
                      checked={formData.dirigido_a === 'barbero'}
                      onChange={handleChange}
                      disabled={!isAuthenticated}
                      style={{ margin: 0 }}
                    />
                    A un Barbero
                  </label>
                </div>
              </div>

              {formData.dirigido_a === 'barbero' && (
                <div className="form-group">
                  <label htmlFor="id_barbero">Selecciona el Barbero</label>
                  <select
                    id="id_barbero"
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
              )}

              <div className="form-group">
                <label htmlFor="comentario">Tu Reseña</label>
                <textarea
                  id="comentario"
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleChange}
                  required
                  disabled={!isAuthenticated}
                  placeholder={isAuthenticated ? "Cuéntanos sobre tu experiencia..." : "Inicia sesión para escribir tu reseña..."}
                ></textarea>
              </div>

              <button
                type="submit"
                className="review-submit-btn"
                disabled={status.type === 'loading' || !isAuthenticated}
              >
                {status.type === 'loading' ? 'Enviando...' : 'Publicar Reseña'}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Reseñas;