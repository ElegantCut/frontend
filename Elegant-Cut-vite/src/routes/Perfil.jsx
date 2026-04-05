import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthClient } from '../auth/authClient';
import api from '../lib/axios';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';
import { motion, AnimatePresence } from 'framer-motion';

function Perfil() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'citas', 'historial', 'config'
    const [editMode, setEditMode] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    
    // Estado para cambio de contraseña
    const [showPassModal, setShowPassModal] = useState(false);
    const [passStep, setPassStep] = useState(1); // 1: Solicitar, 2: Verificar
    const [passData, setPassData] = useState({
        codigo: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
    });
    const [passMessage, setPassMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        if (!AuthClient.isLoggedIn()) {
            navigate('/login');
            return;
        }

        const storedUser = AuthClient.getUser();
        if (!storedUser?.userId) {
            setLoading(false);
            return;
        }

        try {
            // Obtener perfil completo
            const userResponse = await api.get(`/users/${storedUser.userId}`);
            const fullData = userResponse.data;
            setUser(fullData);
            setFormData({
                nombre: fullData.prim_nombre || '',
                apellido: fullData.apellido1 || '',
                email: fullData.email || '',
                telefono: fullData.telefono || '',
            });

            // Obtener citas
            setLoadingAppointments(true);
            const appointmentsResponse = await api.get(`/appointments/user/${parseInt(storedUser.userId)}`);
            if (appointmentsResponse.data.success) {
                setAppointments(appointmentsResponse.data.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setLoadingAppointments(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        try {
            const userId = user.id_usuario;
            const updateData = {
                prim_nombre: formData.nombre,
                apellido1: formData.apellido,
                email: formData.email,
                telefono: formData.telefono,
            };

            const response = await api.patch(`/users/${userId}`, updateData);
            if (response.status === 200) {
                setUser({ ...user, ...updateData });
                setEditMode(false);
                alert('Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error("Error saving changes:", error);
            alert('Error al guardar los cambios');
        }
    };

    // Lógica de cambio de contraseña
    const handleRequestCode = async () => {
        setPassMessage({ type: 'info', text: 'Enviando código...' });
        const result = await AuthClient.solicitarRecuperacion(user.email);
        if (result.success) {
            setPassMessage({ type: 'success', text: result.message });
            setPassStep(2);
        } else {
            setPassMessage({ type: 'error', text: result.error });
        }
    };

    const handleVerifyAndChange = async () => {
        if (passData.nuevaContrasena !== passData.confirmarContrasena) {
            setPassMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        if (passData.nuevaContrasena.length < 6) {
            setPassMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setPassMessage({ type: 'info', text: 'Verificando y cambiando contraseña...' });
        const result = await AuthClient.verificarCodigoRecuperacion(
            user.email,
            passData.codigo,
            passData.nuevaContrasena
        );

        if (result.success) {
            setPassMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
            setTimeout(() => {
                setShowPassModal(false);
                setPassStep(1);
                setPassData({ codigo: '', nuevaContrasena: '', confirmarContrasena: '' });
                setPassMessage({ type: '', text: '' });
            }, 2000);
        } else {
            setPassMessage({ type: 'error', text: result.error });
        }
    };

    const handleLogout = () => {
        AuthClient.logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeNum) => {
        if (!timeNum) return '';
        let timeStr = timeNum.toString().padStart(4, '0');
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
    };

    if (loading) {
        return (
            <div className="perfil-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando datos del perfil...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Separar citas de forma más robusta
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día de hoy

    const upcomingCitas = appointments.filter(c => {
        const citaDate = new Date(c.fecha);
        // Si la cita es hoy o en el futuro, y no está cancelada (3) ni completada (2)
        return citaDate >= today && c.id_estado_cita !== 3 && c.id_estado_cita !== 2;
    });

    const historyCitas = appointments.filter(c => {
        const citaDate = new Date(c.fecha);
        // Si la cita es anterior a hoy, o está cancelada (3) o completada (2)
        return citaDate < today || c.id_estado_cita === 3 || c.id_estado_cita === 2;
    });

    return (
        <AnimatedPage>
            <div className="perfil-container">
                <div className="perfil-wrapper">

                    {/* Header del perfil */}
                    <div className="perfil-header">
                        <div className="perfil-avatar">
                            <div className="avatar-circle">
                                <span className="avatar-initials">
                                    {user.prim_nombre?.charAt(0)}{user.apellido1?.charAt(0)}
                                </span>
                            </div>
                            <button className="avatar-edit-btn">
                                <i className="fas fa-camera"></i>
                            </button>
                        </div>
                        <div className="perfil-header-info">
                            <h1>{user.prim_nombre} {user.apellido1}</h1>
                            <p className="perfil-username">@{user.username}</p>
                            <span className="perfil-role role-badge">
                                {user.rol?.nombre_rol === 'Administrador' ? 'ADMINISTRADOR' : 
                                 user.rol?.nombre_rol === 'Barbero' ? 'BARBERO' : 'CLIENTE'}
                            </span>
                        </div>
                    </div>

                    {/* Navegación de tabs */}
                    <div className="perfil-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <i className="fas fa-user"></i> Información Personal
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`}
                            onClick={() => setActiveTab('citas')}
                        >
                            <i className="fas fa-calendar-alt"></i> Mis Citas
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                            onClick={() => setActiveTab('historial')}
                        >
                            <i className="fas fa-history"></i> Historial
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                            onClick={() => setActiveTab('config')}
                        >
                            <i className="fas fa-cog"></i> Configuración
                        </button>
                    </div>

                    {/* Contenido principal */}
                    <AnimatedContainer className="perfil-content">
                        <AnimatePresence mode="wait">
                            {activeTab === 'info' && (
                                <motion.div
                                    key="info-tab"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
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
                                                <label>NOMBRE</label>
                                                {editMode ? (
                                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="edit-input" />
                                                ) : <p>{user.prim_nombre}</p>}
                                            </div>

                                            <div className="info-item">
                                                <label>APELLIDO</label>
                                                {editMode ? (
                                                    <input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} className="edit-input" />
                                                ) : <p>{user.apellido1}</p>}
                                            </div>

                                            <div className="info-item">
                                                <label>EMAIL</label>
                                                {editMode ? (
                                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="edit-input" />
                                                ) : <p>{user.email}</p>}
                                            </div>

                                            <div className="info-item">
                                                <label>TELÉFONO</label>
                                                {editMode ? (
                                                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="edit-input" />
                                                ) : <p>{user.telefono || 'No especificado'}</p>}
                                            </div>

                                            <div className="info-item">
                                                <label>USUARIO</label>
                                                <p>{user.username}</p>
                                            </div>

                                            <div className="info-item">
                                                <label>FECHA DE REGISTRO</label>
                                                <p>{formatDate(user.created_at)}</p>
                                            </div>
                                        </div>
                                    </AnimatedItem>

                                    {/* Acciones rápidas (Solo en pestaña info para no recargar otras) */}
                                    <AnimatedItem className="perfil-section">
                                        <h2>Acciones Rápidas</h2>
                                        <AnimatedContainer className="quick-actions">
                                            <AnimatedItem tag="button" className="action-btn" onClick={() => navigate('/Form_agenda')}>
                                                <i className="fas fa-calendar-plus" style={{ color: '#d4af37' }}></i>
                                                <span>Agendar Cita</span>
                                            </AnimatedItem>
                                            <AnimatedItem tag="button" className="action-btn danger" onClick={() => {setShowPassModal(true); setPassStep(1); setPassMessage({type:'', text:''})}}>
                                                <i className="fas fa-key"></i>
                                                <span>Cambiar Contraseña</span>
                                            </AnimatedItem>
                                            <AnimatedItem tag="button" className="action-btn">
                                                <i className="fas fa-bell" style={{ color: '#d4af37' }}></i>
                                                <span>Notificaciones</span>
                                            </AnimatedItem>
                                            <AnimatedItem tag="button" className="action-btn danger" onClick={handleLogout}>
                                                <i className="fas fa-sign-out-alt"></i>
                                                <span>Cerrar Sesión</span>
                                            </AnimatedItem>
                                        </AnimatedContainer>
                                    </AnimatedItem>
                                </motion.div>
                            )}

                            {activeTab === 'citas' && (
                                <motion.div
                                    key="citas-tab"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="perfil-section"
                                >
                                    <h2>Próximas Citas</h2>
                                    {loadingAppointments ? <p>Cargando citas...</p> : (
                                        upcomingCitas.length > 0 ? (
                                            <div className="appointments-list">
                                                {upcomingCitas.map(cita => (
                                                    <div key={cita.id_reservas} className="appointment-card">
                                                        <div className="apt-date">
                                                            <span className="day">{new Date(cita.fecha).getDate()}</span>
                                                            <span className="month">{new Date(cita.fecha).toLocaleString('es-ES', { month: 'short' }).toUpperCase()}</span>
                                                        </div>
                                                        <div className="apt-details">
                                                            <h3>{cita.detalle_cita_servicio?.[0]?.servicios?.nombre || 'Servicio'}</h3>
                                                            <p><i className="far fa-clock"></i> {formatTime(cita.horarios?.hora_inicio)}</p>
                                                            <p><i className="far fa-user"></i> Barbero: {cita.id_empleado ? `Cita #${cita.id_reservas}` : 'Por asignar'}</p>
                                                        </div>
                                                        <div className="apt-status">
                                                            <span className={`status-badge st-${cita.estado_cita?.id_estado_cita}`}>
                                                                {cita.id_estado_cita === 1 ? 'Pendiente' : cita.id_estado_cita === 2 ? 'Confirmada' : 'Otro'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <i className="fas fa-calendar-times"></i>
                                                <p>No tienes citas programadas próximamente.</p>
                                                <button className="btn-save" onClick={() => navigate('/Form_agenda')} style={{ marginTop: '1rem' }}>Agendar ahora</button>
                                            </div>
                                        )
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'historial' && (
                                <motion.div
                                    key="history-tab"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="perfil-section"
                                >
                                    <h2>Historial de Citas</h2>
                                    {loadingAppointments ? <p>Cargando historial...</p> : (
                                        historyCitas.length > 0 ? (
                                            <div className="history-table-container">
                                                <table className="history-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Fecha</th>
                                                            <th>Servicio</th>
                                                            <th>Hora</th>
                                                            <th>Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {historyCitas.map(cita => (
                                                            <tr key={cita.id_reservas}>
                                                                <td>{formatDate(cita.fecha)}</td>
                                                                <td>{cita.detalle_cita_servicio?.[0]?.servicios?.nombre || 'N/A'}</td>
                                                                <td>{formatTime(cita.horarios?.hora_inicio)}</td>
                                                                <td>
                                                                    <span className={`status-text st-${cita.id_estado_cita}`}>
                                                                        {cita.id_estado_cita === 2 ? 'Completada' : cita.id_estado_cita === 3 ? 'Cancelada' : 'Finalizada'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : <p>Aún no tienes historial de citas.</p>
                                    )}
                                </motion.div>
                            )}
                            
                            {activeTab === 'config' && (
                                <motion.div
                                    key="config-tab"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="perfil-section"
                                >
                                    <h2>Configuración de la Cuenta</h2>
                                    <div className="config-list">
                                        <div className="config-item">
                                            <div className="config-info">
                                                <h3>Notificaciones por correo</h3>
                                                <p>Recibe recordatorios de tus citas y promociones.</p>
                                            </div>
                                            <div className="toggle-switch">
                                                <input type="checkbox" id="notif-mail" defaultChecked />
                                                <label htmlFor="notif-mail"></label>
                                            </div>
                                        </div>
                                        <div className="config-item">
                                            <div className="config-info">
                                                <h3>Privacidad del perfil</h3>
                                                <p>Permitir que el barbero vea fotos de tu historial para sugerencias.</p>
                                            </div>
                                            <div className="toggle-switch">
                                                <input type="checkbox" id="privacy-profile" />
                                                <label htmlFor="privacy-profile"></label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </AnimatedContainer>
                </div>

                {/* Modal de Cambio de Contraseña */}
                {showPassModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            className="modal-card"
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="modal-header">
                                <h3>Cambiar Contraseña</h3>
                                <button className="close-btn" onClick={() => setShowPassModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {passMessage.text && (
                                    <div className={`alert-msg ${passMessage.type}`}>
                                        {passMessage.text}
                                    </div>
                                )}

                                {passStep === 1 ? (
                                    <div className="step-content">
                                        <p>Para cambiar tu contraseña, enviaremos un código de verificación a: <strong>{user.email}</strong></p>
                                        <button className="btn-save full-width" onClick={handleRequestCode} style={{ marginTop: '1.5rem' }}>
                                            Enviar código al correo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="step-content">
                                        <div className="form-group">
                                            <label>Código de verificación (6 dígitos)</label>
                                            <input 
                                                type="text" 
                                                maxLength="6"
                                                className="edit-input" 
                                                value={passData.codigo}
                                                onChange={(e) => setPassData({...passData, codigo: e.target.value})}
                                                placeholder="Ej: 123456"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Nueva Contraseña</label>
                                            <input 
                                                type="password" 
                                                className="edit-input" 
                                                value={passData.nuevaContrasena}
                                                onChange={(e) => setPassData({...passData, nuevaContrasena: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirmar Nueva Contraseña</label>
                                            <input 
                                                type="password" 
                                                className="edit-input" 
                                                value={passData.confirmarContrasena}
                                                onChange={(e) => setPassData({...passData, confirmarContrasena: e.target.value})}
                                            />
                                        </div>
                                        <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                            <button className="btn-cancel" onClick={() => setPassStep(1)}>Atrás</button>
                                            <button className="btn-save" onClick={handleVerifyAndChange}>Confirmar Cambio</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .perfil-role.role-badge {
                    background: #d4af371a;
                    color: #d4af37;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    border: 1px solid #d4af374d;
                    display: inline-block;
                    margin-top: 8px;
                }
                .empty-state { text-align: center; padding: 3rem 1rem; color: #666; }
                .empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
                
                .appointments-list { display: grid; gap: 1rem; margin-top: 1rem; }
                .appointment-card {
                    display: flex;
                    align-items: center;
                    background: white;
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    border: 1px solid #eee;
                }
                .apt-date {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: #fafafa;
                    padding: 8px 12px;
                    border-radius: 8px;
                    min-width: 60px;
                    margin-right: 1.5rem;
                }
                .apt-date .day { font-size: 1.25rem; font-weight: 800; color: #333; }
                .apt-date .month { font-size: 0.7rem; color: #888; }
                .apt-details h3 { font-size: 1rem; margin: 0 0 4px 0; }
                .apt-details p { margin: 0; font-size: 0.85rem; color: #666; display: flex; align-items: center; gap: 6px; }
                .apt-status { margin-left: auto; }
                .status-badge { font-size: 0.7rem; padding: 4px 10px; border-radius: 12px; font-weight: 600; }
                .st-1 { background: #fff8e1; color: #f57f17; } /* Pendiente */
                .st-2 { background: #e8f5e9; color: #2e7d32; } /* Confirmada */
                .st-3 { background: #ffebee; color: #c62828; } /* Cancelada */
                
                .history-table-container { overflow-x: auto; margin-top: 1rem; }
                .history-table { width: 100%; border-collapse: collapse; }
                .history-table th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; font-size: 0.85rem; color: #888; }
                .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem; }
                .action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    gap: 15px;
                    width: 100%;
                    outline: none;
                    text-decoration: none;
                    -webkit-tap-highlight-color: transparent;
                }
                .action-btn * { pointer-events: none; }
                .action-btn:hover { 
                    background: #fff; 
                    transform: translateY(-4px); 
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
                    border-color: #d4af37;
                }
                .action-btn i { font-size: 1.8rem; }
                .action-btn span { font-size: 0.95rem; font-weight: 600; color: #444; }
                
                .action-btn.danger { border-color: #ff000033; }
                .action-btn.danger i { color: #f21d1d; }
                .action-btn.danger:hover { background: #fffdfd; border-color: #f21d1d; }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
                    padding: 1rem;
                }
                .modal-card {
                    background: white; width: 100%; max-width: 450px; border-radius: 16px; padding: 1.5rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #888; }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 6px; font-size: 0.8rem; font-weight: 600; color: #888; }
                .alert-msg { padding: 10px; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.85rem; }
                .alert-msg.info { background: #e3f2fd; color: #1565c0; }
                .alert-msg.success { background: #e8f5e9; color: #2e7d32; }
                .alert-msg.error { background: #ffebee; color: #c62828; }
                .full-width { width: 100%; }
            ` }} />
        </AnimatedPage>
    );
}

export default Perfil;
