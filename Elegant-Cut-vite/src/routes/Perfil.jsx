import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/UseAuth.jsx';
import api from '../lib/axios';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';
import CambiarContrasenaModal from '../components/shared/CambiarContrasenaModal';
import NotificacionesModal from '../components/shared/NotificacionesModal';
import '../components/shared/PerfilTabs.css';

function Perfil() {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        telefono: ''
    });
    const [stats, setStats] = useState({ citasRealizadas: 0, citasPendientes: 0, calificacionPromedio: 0, puntosAcumulados: 0 });
    const [fullUser, setFullUser] = useState(null); // Datos completos cargados de DB
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'citas', 'historial'
    const [misCitas, setMisCitas] = useState([]);
    const [historialCitas, setHistorialCitas] = useState([]);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);

    useEffect(() => {
        // Si ya cargó y no está autenticado, pa fuera
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (user) {
            const fetchAllData = async () => {
                try {
                    // userId es retornado por el authService del backend en login
                    const idToFetch = user.userId || user.id_usuario || user.id;
                    if (!idToFetch) return;

                    // Hacemos todas las peticiones en paralelo
                    const [profileRes, statsRes, apptRes] = await Promise.all([
                        api.get(`/users/${idToFetch}`),
                        api.get(`/users/${idToFetch}/stats`),
                        api.get(`/users/${idToFetch}/appointments`)
                    ]);

                    const dbUser = profileRes.data;
                    setFullUser(dbUser);
                    setStats(statsRes.data);
                    
                    if (apptRes.data) {
                        setMisCitas(apptRes.data.activas || []);
                        setHistorialCitas(apptRes.data.historial || []);
                    }

                    // Llenamos el formato solo con lo editable
                    setFormData({
                        username: dbUser.username || '',
                        telefono: dbUser.telefono || ''
                    });
                } catch (error) {
                    console.error("Error cargando perfil o estadísticas desde BD", error);
                }
            };
            fetchAllData();
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
        try {
            const idToUpdate = user.userId || user.id_usuario || user.id;
            await api.patch(`/users/${idToUpdate}`, {
                username: formData.username,
                telefono: formData.telefono
            });
            
            // Actualizar el local storage del usuario en curso (el token y estado actual)
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if(storedUser) {
                storedUser.username = formData.username; // update username
                storedUser.telefono = formData.telefono;
                localStorage.setItem('user', JSON.stringify(storedUser));
            }
            
            setEditMode(false);
            window.location.reload(); // Recargar para reflejar cambios en todo lado
        } catch (error) {
            console.error('Error guardando cambios:', error);
            alert("No se pudieron guardar los cambios");
        }
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
                                    {(user.prim_nombre || user.nombre || user.name)?.charAt(0)}{(user.apellido1 || user.apellido || '')?.charAt(0)}
                                </span>
                            </div>
                            <button className="avatar-edit-btn">
                                <i className="fas fa-camera"></i>
                            </button>
                        </div>
                        <div className="perfil-header-info">
                            <h1>{user.prim_nombre || user.nombre || user.name} {user.apellido1 || user.apellido}</h1>
                            <p className="perfil-username">@{user.username || 'usuario'}</p>
                            <span className={`perfil-role role-${user.role}`}>
                                {user.role === 'admin' ? 'Administrador' :
                                    user.role === 'barbero' ? 'Barbero' : 'Cliente'}
                            </span>
                        </div>
                    </div>

                    {/* Navegación de tabs */}
                    <div className="perfil-tabs">
                        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                            <i className="fas fa-user"></i> Información Personal
                        </button>
                        <button className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`} onClick={() => setActiveTab('citas')}>
                            <i className="fas fa-calendar-alt"></i> Mis Citas
                        </button>
                        <button className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
                            <i className="fas fa-history"></i> Historial
                        </button>
                    </div>

                    {/* Contenido principal */}
                    <AnimatedContainer className="perfil-content">

                        {activeTab === 'info' && (
                            <>
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
                                            <p>{fullUser?.prim_nombre || user?.name || ''}</p>
                                        </div>

                                        <div className="info-item">
                                            <label>Apellido</label>
                                            <p>{fullUser?.apellido1 || ''}</p>
                                        </div>

                                        <div className="info-item">
                                            <label>Email</label>
                                            <p>{fullUser?.email || user?.email || ''}</p>
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
                                                <p>{fullUser?.telefono || formData.telefono || 'No especificado'}</p>
                                            )}
                                        </div>

                                        <div className="info-item">
                                            <label>Usuario</label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                <p>{fullUser?.username || formData.username || ''}</p>
                                            )}
                                        </div>

                                        <div className="info-item">
                                            <label>Fecha de registro</label>
                                            <p>{fullUser?.created_at ? new Date(fullUser.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}</p>
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
                                                    <h3>{stats.citasRealizadas}</h3>
                                                    <p>Citas realizadas</p>
                                                </div>
                                            </AnimatedItem>

                                            <AnimatedItem className="stat-card">
                                                <div className="stat-icon">
                                                    <i className="fas fa-clock"></i>
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{stats.citasPendientes}</h3>
                                                    <p>Citas pendientes</p>
                                                </div>
                                            </AnimatedItem>

                                            <AnimatedItem className="stat-card">
                                                <div className="stat-icon">
                                                    <i className="fas fa-star"></i>
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{stats.calificacionPromedio}</h3>
                                                    <p>Calificación promedio</p>
                                                </div>
                                            </AnimatedItem>

                                            <AnimatedItem className="stat-card">
                                                <div className="stat-icon">
                                                    <i className="fas fa-gift"></i>
                                                </div>
                                                <div className="stat-info">
                                                    <h3>{stats.puntosAcumulados}</h3>
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
                                        <AnimatedItem tag="button" className="action-btn" onClick={() => setShowPasswordModal(true)}>
                                            <i className="fas fa-key"></i>
                                            <span>Cambiar Contraseña</span>
                                        </AnimatedItem>
                                        <AnimatedItem tag="button" className="action-btn" onClick={() => setShowNotificationsModal(true)}>
                                            <i className="fas fa-bell"></i>
                                            <span>Notificaciones</span>
                                        </AnimatedItem>
                                        <AnimatedItem tag="button" className="action-btn danger" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt"></i>
                                            <span>Cerrar Sesión</span>
                                        </AnimatedItem>
                                    </AnimatedContainer>
                                </AnimatedItem>
                            </>
                        )}

                        {activeTab === 'citas' && (
                            <AnimatedItem className="perfil-section">
                                <h2>Mis Citas Activas</h2>
                                {misCitas.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="fas fa-calendar-times"></i>
                                        <p>No tienes citas próximas agendadas.</p>
                                        <button className="primary-btn" style={{marginTop: '15px'}} onClick={() => navigate('/Form_agenda')}>
                                            Agendar mi primera cita
                                        </button>
                                    </div>
                                ) : (
                                    <div className="appointments-list">
                                        {misCitas.map(cita => (
                                            <div key={cita.id} className="appointment-card active-card">
                                                <div className="appointment-header">
                                                    <h4>{cita.servicio}</h4>
                                                    <span className="badge-status status-active">{cita.estado}</span>
                                                </div>
                                                <div className="appointment-body">
                                                    <p><i className="far fa-calendar"></i> {new Date(cita.fecha).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                    <p><i className="far fa-clock"></i> {new Date(cita.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' })}</p>
                                                    <p><i className="fas fa-cut"></i> {cita.barbero}</p>
                                                    <p className="price-tag">${cita.precio}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </AnimatedItem>
                        )}

                        {activeTab === 'historial' && (
                            <AnimatedItem className="perfil-section">
                                <h2>Historial de Citas</h2>
                                {historialCitas.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="fas fa-history"></i>
                                        <p>Aún no tienes registro de visitas previas.</p>
                                    </div>
                                ) : (
                                    <div className="appointments-list history-list">
                                        {historialCitas.map(cita => (
                                            <div key={cita.id} className="appointment-card history-card">
                                                <div className="appointment-header">
                                                    <h4>{cita.servicio}</h4>
                                                    <span className={`badge-status ${cita.estado === 'Cancelada' ? 'status-cancelled' : 'status-completed'}`}>
                                                        {cita.estado}
                                                    </span>
                                                </div>
                                                <div className="appointment-body">
                                                    <p><i className="far fa-calendar"></i> {new Date(cita.fecha).toLocaleDateString('es-ES')}</p>
                                                    <p><i className="fas fa-cut"></i> {cita.barbero}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </AnimatedItem>
                        )}

                    </AnimatedContainer>
                </div>
            </div>

            {/* Modales Interactivos del Perfil */}
            {fullUser && user && (
                <CambiarContrasenaModal 
                    isOpen={showPasswordModal} 
                    onClose={() => setShowPasswordModal(false)}
                    userEmail={fullUser?.email || user?.email}
                />
            )}
            
            {user && (
                <NotificacionesModal 
                    isOpen={showNotificationsModal} 
                    onClose={() => setShowNotificationsModal(false)}
                    userId={user?.userId || user?.id_usuario || user?.id}
                />
            )}

        </AnimatedPage>
    );
}

export default Perfil;
