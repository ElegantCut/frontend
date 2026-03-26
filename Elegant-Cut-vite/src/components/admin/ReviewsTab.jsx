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
        <div style={{ padding: '20px', background: 'transparent' }}>
            {/* Header Manual Storing styles to avoid CSS issues */}
            <div style={{
                background: 'white', padding: '20px', borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px'
            }}>
                <h2 style={{ margin: 0, color: COLORS.negro, fontWeight: '600' }}>Gestión de Reseñas</h2>
                <p style={{ margin: '5px 0 0 0', color: COLORS.gris }}>Modera los comentarios y calificaciones</p>
            </div>

            {/* Contenedor Principal */}
            <div style={{
                background: 'white', padding: '25px', borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {/* Search & Filters */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => setFilter('all')} style={{ padding: '8px 15px', borderRadius: '5px', border: `1px solid ${COLORS.borde}`, background: filter === 'all' ? COLORS.negro : 'white', color: filter === 'all' ? 'white' : COLORS.negro, cursor: 'pointer' }}>Todas</button>
                        <button onClick={() => setFilter('approved')} style={{ padding: '8px 15px', borderRadius: '5px', border: `1px solid ${COLORS.borde}`, background: filter === 'approved' ? '#28a745' : 'white', color: filter === 'approved' ? 'white' : COLORS.negro, cursor: 'pointer' }}>Aprobadas</button>
                        <button onClick={() => setFilter('spam')} style={{ padding: '8px 15px', borderRadius: '5px', border: `1px solid ${COLORS.borde}`, background: filter === 'spam' ? COLORS.rojo : 'white', color: filter === 'spam' ? 'white' : COLORS.negro, cursor: 'pointer' }}>Spam</button>
                    </div>
                    <input
                        placeholder="Buscar cliente o comentario..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '5px', border: `1px solid ${COLORS.borde}`, minWidth: '200px' }}
                    />
                </div>

                {error && <div style={{ color: COLORS.rojo, padding: '10px', background: '#fee', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

                {loading ? <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: COLORS.bgTable }}>
                                    <th style={{ padding: '12px', borderBottom: `2px solid ${COLORS.borde}` }}>Cliente</th>
                                    <th style={{ padding: '12px', borderBottom: `2px solid ${COLORS.borde}` }}>Calificación</th>
                                    <th style={{ padding: '12px', borderBottom: `2px solid ${COLORS.borde}` }}>Comentario</th>
                                    <th style={{ padding: '12px', borderBottom: `2px solid ${COLORS.borde}` }}>Acciones</th>
                                </tr>
                            </thead>
                            <AnimatedContainer tag="tbody">
                                {filtered.map(r => (
                                    <AnimatedItem tag="tr" key={r.id_resena} style={{ borderBottom: `1px solid ${COLORS.borde}` }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '600' }}>{r.nombre_cliente || 'Anónimo'}</div>
                                            <div style={{ fontSize: '0.8rem', color: COLORS.gris }}>{r.email_cliente}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>{renderStars(r.calificacion)}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ maxWidth: '300px', fontSize: '0.9rem' }}>{r.comentario}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    onClick={() => handleStatusChange(r.id_resena, r.estado === 1 ? 0 : 1)}
                                                    style={{ border: 'none', background: r.estado === 1 ? '#f59e0b' : '#10b981', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    {r.estado === 1 ? '🚫 Spam' : '✓ Aprobar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r.id_resena)}
                                                    style={{ border: 'none', background: COLORS.rojo, color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </AnimatedItem>
                                ))}
                            </AnimatedContainer>
                        </table>
                        {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: COLORS.gris }}>No hay reseñas que coincidan.</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsTab;
