import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthClient } from '../auth/authClient';
import api from '../lib/axios';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';
import { motion, AnimatePresence } from 'framer-motion';
import { appointmentService } from '../lib/appointmentService';

const FALLBACK_HORARIOS = [
    { id_horarios: 1, hora_inicio: 900, hora_fin: 930 },
    { id_horarios: 2, hora_inicio: 930, hora_fin: 1000 },
    { id_horarios: 3, hora_inicio: 1000, hora_fin: 1030 },
    { id_horarios: 4, hora_inicio: 1030, hora_fin: 1100 },
    { id_horarios: 5, hora_inicio: 1100, hora_fin: 1130 },
    { id_horarios: 6, hora_inicio: 1130, hora_fin: 1200 },
    { id_horarios: 7, hora_inicio: 1230, hora_fin: 1300 },
    { id_horarios: 8, hora_inicio: 1300, hora_fin: 1330 },
    { id_horarios: 9, hora_inicio: 1330, hora_fin: 1400 },
    { id_horarios: 10, hora_inicio: 1400, hora_fin: 1430 },
    { id_horarios: 11, hora_inicio: 1430, hora_fin: 1500 },
    { id_horarios: 12, hora_inicio: 1500, hora_fin: 1530 },
    { id_horarios: 13, hora_inicio: 1530, hora_fin: 1600 },
    { id_horarios: 14, hora_inicio: 1600, hora_fin: 1630 },
    { id_horarios: 15, hora_inicio: 1630, hora_fin: 1700 },
    { id_horarios: 16, hora_inicio: 1700, hora_fin: 1730 },
    { id_horarios: 17, hora_inicio: 1800, hora_fin: 1830 },
    { id_horarios: 18, hora_inicio: 1830, hora_fin: 1900 },
    { id_horarios: 19, hora_inicio: 1900, hora_fin: 1930 },
    { id_horarios: 20, hora_inicio: 1930, hora_fin: 2000 },
    { id_horarios: 21, hora_inicio: 2000, hora_fin: 2030 },
];

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

    // Estado para reagendar cita
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleAppt, setRescheduleAppt] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTimeId, setRescheduleTimeId] = useState('');
    const [availableHorarios, setAvailableHorarios] = useState([]);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [rescheduleMsg, setRescheduleMsg] = useState({ type: '', text: '' });
    const [fetchingHorarios, setFetchingHorarios] = useState(false);

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
            const userResponse = await api.get(`/users/me`);
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
            const updateData = {
                prim_nombre: formData.nombre,
                apellido1: formData.apellido,
                email: formData.email,
                telefono: formData.telefono,
            };

            const response = await api.patch('/users/profile', updateData);
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

    const handleOpenReschedule = async (cita) => {
        setRescheduleAppt(cita);
        setRescheduleDate('');
        setRescheduleTimeId('');
        setRescheduleMsg({ type: '', text: '' });
        setAvailableHorarios([]);
        setShowRescheduleModal(true);
        setFetchingHorarios(true);
        try {
            const res = await appointmentService.getHorarios();
            const horarios = Array.isArray(res) ? res : (res?.data || []);
            setAvailableHorarios(horarios);
        } catch (err) {
            console.error('Error al cargar horarios:', err);
        } finally {
            setFetchingHorarios(false);
        }
    };

    const handleDateChange = async (e) => {
        const date = e.target.value;
        setRescheduleDate(date);
        setRescheduleTimeId('');
    };

    const handleConfirmReschedule = async () => {
        if (!rescheduleDate || !rescheduleTimeId) {
            setRescheduleMsg({ type: 'error', text: 'Selecciona una nueva fecha y hora.' });
            return;
        }
        const apptId = rescheduleAppt.id || rescheduleAppt.id_reservas;
        if (!apptId) {
            setRescheduleMsg({ type: 'error', text: 'Error: ID de cita no encontrado.' });
            return;
        }
        setRescheduleLoading(true);
        setRescheduleMsg({ type: '', text: '' });
        try {
            await appointmentService.reschedule(apptId, {
                userId: parseInt(user.id_usuario),
                fecha: rescheduleDate,
                id_horarios: parseInt(rescheduleTimeId),
            });
            setRescheduleMsg({ type: 'success', text: 'Cita reagendada exitosamente.' });
            setTimeout(() => {
                setShowRescheduleModal(false);
                fetchData();
            }, 1500);
        } catch (error) {
            const errData = error.response?.data;
            const errMsg = typeof errData?.message === 'string' ? errData.message :
                           typeof errData?.error === 'string' ? errData.error :
                           errData?.message?.message || 'Error al reagendar la cita.';
            setRescheduleMsg({ type: 'error', text: errMsg });
        } finally {
            setRescheduleLoading(false);
        }
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
            <div className="perfil-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#09090b' }}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p style={{ color: '#f4f4f4' }}>Cargando datos del perfil...</p>
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
                                                <i className="fas fa-calendar-plus" style={{ color: '#c9a84c' }}></i>
                                                <span>Agendar Cita</span>
                                            </AnimatedItem>
                                            <AnimatedItem tag="button" className="action-btn danger" onClick={() => {setShowPassModal(true); setPassStep(1); setPassMessage({type:'', text:''})}}>
                                                <i className="fas fa-key"></i>
                                                <span>Cambiar Contraseña</span>
                                            </AnimatedItem>
                                            <AnimatedItem tag="button" className="action-btn">
                                                <i className="fas fa-bell" style={{ color: '#c9a84c' }}></i>
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
                                                            <button className="btn-reschedule" onClick={() => handleOpenReschedule(cita)} title="Reagendar cita">
                                                                <i className="fas fa-calendar-alt"></i>
                                                            </button>
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
                
                {/* Modal de Reagendar Cita */}
                {showRescheduleModal && rescheduleAppt && (
                    <div className="modal-overlay">
                        <motion.div 
                            className="modal-card"
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="modal-header">
                                <h3>Reagendar Cita</h3>
                                <button className="close-btn" onClick={() => setShowRescheduleModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p style={{ marginBottom: '1rem' }}>
                                    Reagendando cita del <strong>{formatDate(rescheduleAppt.fecha)}</strong> - <strong>{formatTime(rescheduleAppt.horarios?.hora_inicio)}</strong>
                                </p>
                                
                                {rescheduleMsg.text && (
                                    <div className={`alert-msg ${rescheduleMsg.type}`}>
                                        {rescheduleMsg.text}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Nueva fecha</label>
                                    <input 
                                        type="date" 
                                        className="edit-input" 
                                        value={rescheduleDate}
                                        onChange={handleDateChange}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Nuevo horario</label>
                                    {fetchingHorarios ? (
                                        <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Cargando horarios...</p>
                                    ) : (
                                        <select 
                                            className="edit-input" 
                                            value={rescheduleTimeId}
                                            onChange={(e) => setRescheduleTimeId(e.target.value)}
                                        >
                                            <option value="">-- Selecciona un horario --</option>
                                            {(availableHorarios.length > 0 ? availableHorarios : FALLBACK_HORARIOS).map(h => (
                                                <option key={h.id_horarios} value={h.id_horarios}>
                                                    {formatTime(h.hora_inicio)} - {formatTime(h.hora_fin)}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                                    <button className="btn-cancel" onClick={() => setShowRescheduleModal(false)}>Cancelar</button>
                                    <button 
                                        className="btn-save" 
                                        onClick={handleConfirmReschedule}
                                        disabled={rescheduleLoading}
                                    >
                                        {rescheduleLoading ? 'Reagendando...' : 'Confirmar Reagendación'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .perfil-container {
                    background: #09090b !important;
                    min-height: 100vh;
                    color: #f4f4f4;
                    font-family: 'Inter', sans-serif;
                }
                .perfil-wrapper {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }
                .perfil-header {
                    display: flex !important;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: #18181b !important;
                    border: 1px solid #27272a;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                }
                .perfil-avatar { position: relative; flex-shrink: 0; }
                .avatar-circle {
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #bc2041, #d1264e);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 14px rgba(188,32,65,0.35);
                }
                .avatar-initials {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #fff;
                }
                .avatar-edit-btn {
                    position: absolute;
                    bottom: 0; right: 0;
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: #18181b;
                    border: 2px solid #27272a;
                    color: #c9a84c;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 0.7rem;
                }
                .perfil-header-info h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #f4f4f4;
                    margin: 0;
                }
                .perfil-username {
                    color: #a1a1aa;
                    font-size: 0.9rem;
                    margin: 4px 0 0 0;
                }
                .perfil-tabs {
                    display: flex;
                    gap: 0;
                    margin-bottom: 2rem;
                    background: #18181b !important;
                    border: 1px solid #27272a;
                    border-radius: 16px;
                    padding: 0.25rem;
                    overflow-x: auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                }
                .tab-btn {
                    background: transparent !important;
                    border: none !important;
                    padding: 0.75rem 1.25rem;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #a1a1aa !important;
                    cursor: pointer;
                    border-radius: 12px;
                    transition: all 0.2s;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                    justify-content: center;
                }
                .tab-btn:hover { color: #f4f4f4 !important; background: rgba(255,255,255,0.03) !important; }
                .tab-btn.active {
                    color: #f4f4f4 !important;
                    background: #bc2041 !important;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(188,32,65,0.3);
                }
                .tab-btn.active i { color: #f4f4f4 !important; }
                .perfil-content {
                    min-height: 300px;
                }
                .perfil-section {
                    background: #18181b !important;
                    border: 1px solid #27272a !important;
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                }
                .perfil-section h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #f4f4f4;
                    margin: 0 0 1rem 0;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .section-header h2 { margin: 0; }
                .btn-edit {
                    background: transparent;
                    border: 1px solid #27272a;
                    color: #c9a84c;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: all 0.2s;
                }
                .btn-edit:hover {
                    background: rgba(201,168,76,0.1);
                    border-color: #c9a84c;
                }
                .edit-actions { display: flex; gap: 0.5rem; }
                .btn-cancel {
                    background: transparent;
                    border: 1px solid #3f3f46;
                    color: #a1a1aa;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cancel:hover {
                    border-color: #71717a;
                    color: #f4f4f4;
                }
                .btn-save {
                    background: #bc2041;
                    border: none;
                    color: #fff;
                    padding: 0.5rem 1.25rem;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: all 0.2s;
                    box-shadow: 0 2px 10px rgba(188,32,65,0.3);
                }
                .btn-save:hover {
                    background: #d1264e;
                    box-shadow: 0 4px 18px rgba(188,32,65,0.45);
                }
                .btn-save:disabled {
                    background: #3f3f46 !important;
                    color: #71717a !important;
                    cursor: not-allowed !important;
                    box-shadow: none !important;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .info-item { }
                .info-item label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #71717a;
                    letter-spacing: 0.08em;
                    margin-bottom: 4px;
                }
                .info-item p {
                    color: #f4f4f4;
                    font-size: 0.95rem;
                    margin: 0;
                    font-weight: 500;
                }
                .edit-input {
                    width: 100%;
                    background: #27272a !important;
                    border: 1px solid #3f3f46 !important;
                    color: #f4f4f4 !important;
                    padding: 0.6rem 0.8rem;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .edit-input:focus {
                    border-color: #bc2041 !important;
                    box-shadow: 0 0 0 3px rgba(188,32,65,0.2) !important;
                }
                .edit-input::placeholder { color: #71717a !important; }

                .perfil-role.role-badge {
                    background: rgba(201, 168, 76, 0.1);
                    color: #c9a84c;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    border: 1px solid rgba(201, 168, 76, 0.3);
                    display: inline-block;
                    margin-top: 8px;
                }
                .empty-state { text-align: center; padding: 3rem 1rem; color: #a1a1aa; }
                .empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
                
                .appointments-list { display: grid; gap: 1rem; margin-top: 1rem; }
                .appointment-card {
                    display: flex;
                    align-items: center;
                    background: #18181b;
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                    border: 1px solid #27272a;
                }
                .apt-date {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: #27272a;
                    padding: 8px 12px;
                    border-radius: 8px;
                    min-width: 60px;
                    margin-right: 1.5rem;
                }
                .apt-date .day { font-size: 1.25rem; font-weight: 800; color: #f4f4f4; }
                .apt-date .month { font-size: 0.7rem; color: #71717a; }
                .apt-details h3 { font-size: 1rem; margin: 0 0 4px 0; color: #f4f4f4; }
                .apt-details p { margin: 0; font-size: 0.85rem; color: #a1a1aa; display: flex; align-items: center; gap: 6px; }
                .apt-status { margin-left: auto; display: flex; align-items: center; gap: 0.75rem; }
                .status-badge { font-size: 0.7rem; padding: 4px 10px; border-radius: 12px; font-weight: 600; }
                .st-1 { background: rgba(255, 149, 0, 0.15); color: #ff9500; } /* Pendiente */
                .st-2 { background: rgba(16, 185, 129, 0.15); color: #10b981; } /* Confirmada */
                .st-3 { background: rgba(239, 68, 68, 0.15); color: #ef4444; } /* Cancelada */
                .btn-reschedule {
                    background: transparent;
                    border: 1px solid #3f3f46;
                    color: #c9a84c;
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }
                .btn-reschedule:hover {
                    background: rgba(201,168,76,0.1);
                    border-color: #c9a84c;
                    transform: scale(1.1);
                }
                select.edit-input {
                    appearance: auto;
                    cursor: pointer;
                }
                select.edit-input option {
                    background: #18181b !important;
                    color: #f4f4f4 !important;
                }
                
                .history-table-container { overflow-x: auto; margin-top: 1rem; }
                .history-table { width: 100%; border-collapse: collapse; }
                .history-table th { text-align: left; padding: 12px; border-bottom: 2px solid #27272a; font-size: 0.85rem; color: #71717a; font-weight: 600; }
                .history-table td { padding: 12px; border-bottom: 1px solid #27272a; font-size: 0.85rem; color: #d4d4d8; }
                .history-table tr:hover td { background: rgba(255,255,255,0.02); }
                .status-text { font-weight: 600; font-size: 0.8rem; }
                .status-text.st-2 { color: #10b981; }
                .status-text.st-3 { color: #ef4444; }
                .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem; }
                .action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                    background: #18181b;
                    border: 1px solid #27272a;
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
                    background: #1e1e22; 
                    transform: translateY(-4px); 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
                    border-color: #c9a84c;
                }
                .action-btn i { font-size: 1.8rem; }
                .action-btn span { font-size: 0.95rem; font-weight: 600; color: #f4f4f4; }
                
                .action-btn.danger { border-color: rgba(239, 68, 68, 0.2); }
                .action-btn.danger i { color: #ef4444; }
                .action-btn.danger:hover { background: #1e1e22; border-color: #ef4444; }

                /* Modal Styles */
                .config-list { display: flex; flex-direction: column; gap: 1rem; }
                .config-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 0;
                    border-bottom: 1px solid #27272a;
                }
                .config-item:last-child { border-bottom: none; }
                .config-info h3 {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #f4f4f4;
                    margin: 0 0 4px 0;
                }
                .config-info p {
                    font-size: 0.8rem;
                    color: #a1a1aa;
                    margin: 0;
                }
                .toggle-switch {
                    position: relative;
                    width: 48px;
                    height: 26px;
                    flex-shrink: 0;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .toggle-switch label {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #3f3f46;
                    border-radius: 26px;
                    transition: all 0.3s;
                }
                .toggle-switch label::before {
                    content: '';
                    position: absolute;
                    width: 20px; height: 20px;
                    left: 3px; bottom: 3px;
                    background: #fff;
                    border-radius: 50%;
                    transition: all 0.3s;
                }
                .toggle-switch input:checked + label {
                    background: #bc2041;
                }
                .toggle-switch input:checked + label::before {
                    transform: translateX(22px);
                }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;
                    padding: 1rem; backdrop-filter: blur(12px);
                }
                .modal-card {
                    background: #18181b; width: 100%; max-width: 450px; border-radius: 16px; padding: 1.5rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    border: 1px solid #27272a;
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #a1a1aa; }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 6px; font-size: 0.8rem; font-weight: 600; color: #a1a1aa; }
                .alert-msg { padding: 10px; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.85rem; }
                .alert-msg.info { background: rgba(21, 101, 192, 0.15); color: #90caf9; border: 1px solid rgba(21, 101, 192, 0.3); }
                .alert-msg.success { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
                .alert-msg.error { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
                .full-width { width: 100%; }
                .modal-body { color: #d4d4d8; }
                .modal-body p { color: #a1a1aa; font-size: 0.9rem; line-height: 1.5; }
                .modal-header h3 { font-family: 'Playfair Display', serif; color: #f4f4f4; margin: 0; font-size: 1.3rem; }
                .step-content { }
                .step-content strong { color: #f4f4f4; }
                .modal-actions { display: flex; gap: 1rem; }
                .loading-spinner { text-align: center; }
                .spinner {
                    width: 40px; height: 40px;
                    border: 3px solid #27272a;
                    border-top-color: #c9a84c;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            ` }} />
        </AnimatedPage>
    );
}

export default Perfil;
