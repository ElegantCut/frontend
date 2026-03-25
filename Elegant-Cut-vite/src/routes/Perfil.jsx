import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/UseAuth.jsx';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';

function Perfil() {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    useEffect(() => {
        // Si ya cargó y no está autenticado, pa fuera
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        // Llenar el formulario con los datos globales del usuario
        if (user) {
            setFormData({
                nombre: user.nombre || user.name || '',
                apellido: user.apellido || '',
                email: user.email || '',
                telefono: user.telefono || '',
                direccion: user.direccion || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        console.log('Guardando cambios:', formData);
        setEditMode(false);
    };

    const handleLogout = () => {
        logout();
    };

    if (authLoading) {
        return (
            <div className="perfil-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AnimatedPage>
            <div className="perfil-container">
                <div className="perfil-wrapper">

                    {/* Header del perfil */}
                    <div className="perfil-header">
                        <div className="perfil-avatar">
                            <div className="avatar-circle">
                                <span className="avatar-initials">
                                    {(user.nombre || user.name)?.charAt(0)}{(user.apellido || '')?.charAt(0)}
                                </span>
                            </div>
                            <button className="avatar-edit-btn">
                                <i className="fas fa-camera"></i>
                            </button>
                        </div>
                        <div className="perfil-header-info">
                            <h1>{user.nombre || user.name} {user.apellido}</h1>
                            <p className="perfil-username">@{user.username}</p>
                            <span className={`perfil-role role-${user.role}`}>
                                {user.role === 'admin' ? 'Administrador' :
                                    user.role === 'barbero' ? 'Barbero' : 'Cliente'}
                            </span>
                        </div>
                    </div>

                    {/* Navegación de tabs */}
                    <div className="perfil-tabs">
                        <button className="tab-btn active">
                            <i className="fas fa-user"></i> Información Personal
                        </button>
                        <button className="tab-btn">
                            <i className="fas fa-calendar-alt"></i> Mis Citas
                        </button>
                        <button className="tab-btn">
                            <i className="fas fa-history"></i> Historial
                        </button>
                        <button className="tab-btn">
                            <i className="fas fa-cog"></i> Configuración
                        </button>
                    </div>

                    {/* Contenido principal */}
                    <AnimatedContainer className="perfil-content">

                        {/* Información personal */}
                        <AnimatedItem className="perfil-section">
                            <div className="section-header">
                                <h2>Información Personal</h2>
                                {!editMode ? (
                                    <button className="btn-edit" onClick={() => setEditMode(true)}>
                                        <i className="fas fa-edit"></i> Editar
                                    </button>
                                ) : (
                                    <div className="edit-actions">
                                        <button className="btn-cancel" onClick={() => setEditMode(false)}>
                                            Cancelar
                                        </button>
                                        <button className="btn-save" onClick={handleSaveChanges}>
                                            <i className="fas fa-save"></i> Guardar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Nombre</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <p>{user.nombre || user.name}</p>
                                    )}
                                </div>

                                <div className="info-item">
                                    <label>Apellido</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <p>{user.apellido}</p>
                                    )}
                                </div>

                                <div className="info-item">
                                    <label>Email</label>
                                    {editMode ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <p>{user.email}</p>
                                    )}
                                </div>

                                <div className="info-item">
                                    <label>Teléfono</label>
                                    {editMode ? (
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <p>{user.telefono || 'No especificado'}</p>
                                    )}
                                </div>

                                <div className="info-item full-width">
                                    <label>Dirección</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <p>{user.direccion || 'No especificada'}</p>
                                    )}
                                </div>

                                <div className="info-item">
                                    <label>Usuario</label>
                                    <p>{user.username}</p>
                                </div>

                                <div className="info-item">
                                    <label>Fecha de registro</label>
                                    <p>{new Date(user.created_at).toLocaleDateString('es-ES')}</p>
                                </div>
                            </div>
                        </AnimatedItem>

                        {/* Estadísticas (solo para clientes) */}
                        {user.role === 'cliente' && (
                            <AnimatedItem className="perfil-section">
                                <h2>Estadísticas</h2>
                                <AnimatedContainer className="stats-grid">
                                    <AnimatedItem className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fas fa-calendar-check"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>12</h3>
                                            <p>Citas realizadas</p>
                                        </div>
                                    </AnimatedItem>

                                    <AnimatedItem className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fas fa-clock"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>2</h3>
                                            <p>Citas pendientes</p>
                                        </div>
                                    </AnimatedItem>

                                    <AnimatedItem className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fas fa-star"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>4.8</h3>
                                            <p>Calificación promedio</p>
                                        </div>
                                    </AnimatedItem>

                                    <AnimatedItem className="stat-card">
                                        <div className="stat-icon">
                                            <i className="fas fa-gift"></i>
                                        </div>
                                        <div className="stat-info">
                                            <h3>150</h3>
                                            <p>Puntos acumulados</p>
                                        </div>
                                    </AnimatedItem>
                                </AnimatedContainer>
                            </AnimatedItem>
                        )}

                        {/* Acciones rápidas */}
                        <AnimatedItem className="perfil-section">
                            <h2>Acciones Rápidas</h2>
                            <AnimatedContainer className="quick-actions">
                                <AnimatedItem tag="button" className="action-btn" onClick={() => navigate('/Form_agenda')}>
                                    <i className="fas fa-calendar-plus"></i>
                                    <span>Agendar Cita</span>
                                </AnimatedItem>
                                <AnimatedItem tag="button" className="action-btn">
                                    <i className="fas fa-key"></i>
                                    <span>Cambiar Contraseña</span>
                                </AnimatedItem>
                                <AnimatedItem tag="button" className="action-btn">
                                    <i className="fas fa-bell"></i>
                                    <span>Notificaciones</span>
                                </AnimatedItem>
                                <AnimatedItem tag="button" className="action-btn danger" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Cerrar Sesión</span>
                                </AnimatedItem>
                            </AnimatedContainer>
                        </AnimatedItem>

                    </AnimatedContainer>
                </div>
            </div>
        </AnimatedPage>
    );
}

export default Perfil;
