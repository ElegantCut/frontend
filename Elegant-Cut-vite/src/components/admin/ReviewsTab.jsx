import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewsTab = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Colores del sistema Elegant Cut
    const COLORS = {
        negro: '#111205',
        rojo: '#bc2041',
        blanco: '#f4f4f4',
        gris: '#666',
        borde: '#e9ecef',
        bgTable: '#f8f9fa'
    };

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = filter === 'all'
                ? '/reviews/admin/all'
                : `/reviews/admin/all?status=${filter}`;

            const response = await api.get(url);

            const data = response.data;
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('No se pudieron cargar las reseñas.');
            console.error('Error loading reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await api.patch(`/reviews/admin/${id}/status`, { estado: newStatus });
            if (response.status === 200) {
                setReviews(prev => prev.map(r => r.id_resena === id ? { ...r, estado: newStatus } : r));
            }
        } catch (err) { alert('Error de conexión'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar permanentemente?')) return;
        try {
            const response = await api.delete(`/reviews/admin/${id}`);
            if (response.status === 200) {
                setReviews(prev => prev.filter(r => r.id_resena !== id));
            }
        } catch (err) { alert('Error de conexión'); }
    };

    const renderStars = (rating) => {
        const num = parseInt(rating) || 0;
        const v = Math.min(5, Math.max(0, num));
        return <span style={{ color: '#ffc107', fontSize: '1.1rem' }}>{'★'.repeat(v)}{'☆'.repeat(5 - v)}</span>;
    };

    const filtered = reviews.filter(r => {
        if (!r) return false;
        const term = (searchTerm || '').toLowerCase();
        return (r.nombre_cliente || '').toLowerCase().includes(term) ||
            (r.comentario || '').toLowerCase().includes(term);
    });

    return (
    <div className="reviews-container">
      <header className="tab-header">
        <div>
          <h2>Reseñas</h2>
          <p className="ios-item-subtitle">Modera los comentarios y calificaciones</p>
        </div>
        <div className="action-buttons d-flex gap-2">
          <button 
            className={filter === 'all' ? 'btn-ios px-4' : 'btn-ios-secondary px-4'} 
            onClick={() => setFilter('all')}
          >Todas</button>
          <button 
            className={filter === 'approved' ? 'btn-ios px-4' : 'btn-ios-secondary px-4'} 
            style={filter === 'approved' ? {backgroundColor: 'var(--ios-green)'} : {}}
            onClick={() => setFilter('approved')}
          >Aprobadas</button>
        </div>
      </header>

      <div className="ios-section-header">Moderación de Comentarios</div>
      <div className="ios-card mb-4 p-2">
        <div className="position-relative">
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input
            className="ios-search-bar ps-5"
            placeholder="Buscar por cliente o mensaje..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="ios-list-group">
        <AnimatedContainer>
          {loading ? (
            <div className="p-5 text-center text-muted">Cargando reseñas...</div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">No hay reseñas para mostrar</div>
          ) : (
            filtered.map(r => (
              <AnimatedItem key={r.id_resena} className="ios-list-item">
                <div className="ios-item-content">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="ios-item-title">{r.nombre_cliente || 'Anónimo'}</span>
                    <span style={{ color: '#ffc107', fontSize: '1rem' }}>{'★'.repeat(parseInt(r.calificacion))}{'☆'.repeat(5-parseInt(r.calificacion))}</span>
                  </div>
                  <span className="ios-item-subtitle mb-2 d-block">{r.email_cliente}</span>
                  <p className="mb-0 text-dark small" style={{lineHeight: '1.4'}}>{r.comentario}</p>
                </div>

                <div className="ios-item-actions align-self-start pt-1">
                  <span className={`ios-badge ${r.estado === 1 ? 'success' : 'neutral'}`}>
                    {r.estado === 1 ? 'Activa' : 'Oculta'}
                  </span>
                  
                  <div className="d-flex gap-1">
                    <button 
                      className={`ios-icon-btn ${r.estado === 1 ? 'neutral' : 'success'}`}
                      onClick={() => handleStatusChange(r.id_resena, r.estado === 1 ? 0 : 1)}
                      title={r.estado === 1 ? 'Ocultar' : 'Aprobar'}
                    >
                      <i className={`bi ${r.estado === 1 ? 'bi-eye-slash' : 'bi-eye-fill'}`}></i>
                    </button>
                    <button 
                      className="ios-icon-btn danger" 
                      onClick={() => handleDelete(r.id_resena)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </AnimatedItem>
            ))
          )}
        </AnimatedContainer>
      </div>
    </div>
    );
};

export default ReviewsTab;
