import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import './PerfilModals.css';

function NotificacionesModal({ isOpen, onClose, userId }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            api.get(`/users/${userId}/notifications`)
                .then(res => {
                    setNotificaciones(res.data);
                })
                .catch(err => {
                    console.error('Error obteniendo notificaciones:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    return (
        <div className="perfil-modal-overlay">
            <div className="perfil-modal-content notificaciones-content">
                <button className="perfil-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
                <h2>Mis Notificaciones</h2>
                
                <div className="notificaciones-list">
                    {loading ? (
                        <p className="notif-loading">Cargando tus notificaciones...</p>
                    ) : notificaciones.length === 0 ? (
                        <p className="notif-empty">Aún no tienes notificaciones de tus citas.</p>
                    ) : (
                        notificaciones.map((notif) => (
                            <div key={notif.id} className={`notif-item ${notif.tipo}`}>
                                <div className="notif-icon">
                                    <i className={`fas ${notif.tipo === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
                                </div>
                                <div className="notif-body">
                                    <h4>{notif.titulo}</h4>
                                    <p>{notif.mensaje}</p>
                                    <span className="notif-date">{new Date(notif.fecha).toLocaleString('es-ES')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificacionesModal;
