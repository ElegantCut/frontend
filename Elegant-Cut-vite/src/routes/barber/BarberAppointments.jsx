import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '../../components/shared/AnimatedList';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Edit, ShieldAlert } from 'lucide-react';
import { appointmentService } from '../../lib/appointmentService';
import api from '../../lib/axios';
import { useAuth } from '../../auth/UseAuth.jsx';

const BarberAppointments = () => {
    const { barberId } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
    const [hasPermission, setHasPermission] = useState(true);

    // Estados para Reprogramación (Aplazar)
    const { user, token } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [selectedApt, setSelectedApt] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        const loggedInId = user?.userId || user?.id;
        if (barberId && Number(barberId) !== Number(loggedInId)) {
            setHasPermission(false);
            setLoading(false);
        } else {
            setHasPermission(true);
            fetchAppointments();
        }
    }, [barberId, user]);

    // Cargar horarios cuando cambia la fecha en el modal
    useEffect(() => {
        if (newDate && selectedApt) {
            fetchAvailableSlots();
        }
    }, [newDate]);

    const fetchAppointments = async () => {
        try {
            const loggedInId = user?.userId || user?.id;
            const barberIdToUse = barberId ? Number(barberId) : loggedInId;

            if (!barberIdToUse) return;

            // Llamada a tu NUEVA ruta en NestJS
            const rawData = await appointmentService.getAppointmentsByBarber(barberIdToUse);

            // Garantizar que sea un arreglo (si Nest retorna { data: [...] } lo extraemos)
            const aptList = Array.isArray(rawData) ? rawData : (rawData.data || []);

            const mappedAppointments = aptList.map(apt => {
                // Formato de Hora (extraído de apt.horarios.hora_inicio que viene como int ej. 900 -> "09:00")
                let formattedTime = "00:00";
                if (apt.horarios?.hora_inicio) {
                    let hFormat = apt.horarios.hora_inicio.toString().padStart(4, '0');
                    formattedTime = `${hFormat.slice(0, 2)}:${hFormat.slice(2, 4)}`;
                } else if (apt.hora_inicio_formatted) {
                    formattedTime = apt.hora_inicio_formatted;
                }

                // Formato de Servicio(s)
                let serviceNames = 'Servicio Barbería';
                if (apt.detalle_cita_servicio && apt.detalle_cita_servicio.length > 0) {
                    serviceNames = apt.detalle_cita_servicio
                        .map(d => d.servicios?.nombre)
                        .filter(Boolean)
                        .join(', ');
                }

                // Usuario
                const userObj = apt.usuarios || apt.usuario;

                return {
                    id_reservas: apt.id_reservas || apt.id,
                    fecha: apt.fecha,
                    hora_inicio_formatted: formattedTime,
                    id_estado_cita: apt.id_estado_cita || apt.estado || 1,
                    cliente_nombre: apt.cliente_nombre || (userObj ? `${userObj.prim_nombre || ''} ${userObj.apellido1 || ''}`.trim() : 'Cliente Sin Nombre'),
                    cliente_telefono: apt.cliente_telefono || (userObj ? userObj.telefono : 'N/A'),
                    cliente_email: apt.cliente_email || (userObj ? userObj.email : ''),
                    servicios: serviceNames,
                    observaciones: apt.observaciones || apt.notas || ''
                };
            });

            setAppointments(mappedAppointments);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        try {
            const loggedInId = user?.userId || user?.id;
            const barberIdToUse = barberId ? Number(barberId) : loggedInId;
            const response = await api.get(`/appointments/availability?date=${newDate}&barberId=${barberIdToUse}`);
            setAvailableSlots(response.data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            const response = await api.patch(`/appointments/${appointmentId}`, { id_estado_cita: newStatus });

            if (response.status === 200) {
                alert('Estado actualizado correctamente');
                fetchAppointments(); // Recargar lista
            } else {
                alert('Error al actualizar el estado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    const handleReschedule = async (e) => {
        e.preventDefault();
        if (!newDate || !newTime) return alert('Selecciona fecha y hora');

        try {
            const response = await api.patch(`/appointments/${selectedApt.id_reservas}`, { fecha: newDate, id_horarios: parseInt(newTime) });

            if (response.status === 200) {
                alert('Cita reprogramada exitosamente');
                setShowModal(false);
                fetchAppointments();
            } else {
                const data = await response.json();
                alert('Error: ' + (data.message || 'No se pudo reprogramar'));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const openRescheduleModal = (apt) => {
        setSelectedApt(apt);
        setNewDate(new Date(apt.fecha).toISOString().split('T')[0]);
        setNewTime(apt.hora_inicio_formatted);
        setShowModal(true);
    };    const getStatusBadge = (statusId) => {
        const statuses = {
            1: { label: 'Pendiente', className: 'barber-badge-pending' },
            2: { label: 'Completada', className: 'barber-badge-completed' },
            3: { label: 'Cancelada', className: 'barber-badge-cancelled' }
        };

        const status = statuses[statusId] || { label: 'Desconocido', className: 'barber-badge-pending' };

        return (
            <span className={status.className}>
                {status.label}
            </span>
        );
    };

    const filteredAppointments = appointments.filter(apt => {
        // Excluimos definitivamente las citas completadas según el requerimiento ("eliminarlas")
        if (apt.id_estado_cita === 2) return false;
        
        if (filter === 'all') return true;
        if (filter === 'pending') return apt.id_estado_cita === 1;
        if (filter === 'cancelled') return apt.id_estado_cita === 3;
        return true;
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-white">Cargando citas...</p>
            </div>
        );
    }

    if (!hasPermission) {
        return (
            <div style={{ padding: '2rem' }}>
                <header className="tab-header">
                    <div>
                        <h2>Seguridad de Acceso</h2>
                        <p className="ios-item-subtitle" style={{ marginTop: '0.25rem' }}>
                            Validación de permisos
                        </p>
                    </div>
                </header>
                <div className="alert alert-danger d-flex align-items-center gap-3 p-4 rounded-3" style={{ borderLeft: '5px solid #ff453a', background: 'rgba(255, 69, 58, 0.1)', marginTop: '2rem' }}>
                    <ShieldAlert size={40} className="text-danger flex-shrink-0" />
                    <div>
                        <h4 className="alert-heading fw-bold mb-1 text-white">Acceso Denegado</h4>
                        <p className="mb-0 text-white-50" style={{ fontSize: '1rem' }}>
                            No tienes permisos para consultar las citas asignadas a otro barbero.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <header className="tab-header">
                <div>
                    <h2>Mis Citas</h2>
                    <p className="ios-item-subtitle" style={{ marginTop: '0.25rem' }}>
                        Gestiona tus citas asignadas
                    </p>
                </div>
            </header>

            {/* Filtros */}
            <div className="d-flex gap-2 mb-4">
                {[
                    { value: 'all', label: 'Todas' },
                    { value: 'pending', label: 'Pendientes' },
                    { value: 'cancelled', label: 'Canceladas' }
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`ios-btn ${filter === f.value ? 'primary' : 'secondary'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista de citas */}
            {filteredAppointments.length === 0 ? (
                <AnimatedItem>
                    <div className="ios-card text-center p-5">
                        <Calendar size={48} className="text-muted mb-3" />
                        <p className="text-muted mb-0" style={{ fontSize: '1.125rem' }}>
                            No tienes citas {filter !== 'all' ? 'en esta categoría' : 'asignadas'}
                        </p>
                    </div>
                </AnimatedItem>
            ) : (
                <AnimatedContainer className="row g-4">
                    {filteredAppointments.map(apt => (
                        <AnimatedItem
                            key={apt.id_reservas}
                            className="col-md-6 col-lg-4"
                        >
                            <div className="ios-card h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Calendar size={18} style={{ color: 'var(--barber-red)' }} />
                                                <span className="fw-bold text-white">
                                                    {new Date(apt.fecha).toLocaleDateString('es-CO', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        timeZone: 'UTC'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Clock size={18} className="text-muted" />
                                                <span className="text-muted">
                                                    {apt.hora_inicio_formatted}
                                                </span>
                                            </div>
                                        </div>
                                        {getStatusBadge(apt.id_estado_cita)}
                                    </div>

                                    <div className="border-top pt-3 mt-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <User size={18} className="text-muted" />
                                            <span><strong>Cliente:</strong> {apt.cliente_nombre}</span>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <Phone size={18} className="text-muted" />
                                            <span><strong>Teléfono:</strong> {apt.cliente_telefono}</span>
                                        </div>

                                        {apt.cliente_email && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Mail size={18} className="text-muted" />
                                                <span><strong>Email:</strong> {apt.cliente_email}</span>
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <strong className="d-block mb-1 text-muted small text-uppercase" style={{ letterSpacing: '0.5px' }}>Servicios:</strong>
                                            <span className="badge bg-rojo text-white p-2" style={{ fontSize: '0.85rem' }}>{apt.servicios}</span>
                                        </div>

                                        {apt.observaciones && (
                                            <div className="mt-3 p-2 rounded" style={{ fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.05)', borderLeft: '3px solid var(--barber-red)' }}>
                                                <strong>Notas:</strong> {apt.observaciones}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                {apt.id_estado_cita === 1 && (
                                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleStatusUpdate(apt.id_reservas, 2)}
                                            className="ios-btn primary p-2"
                                            style={{
                                                flex: 2,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem',
                                                backgroundColor: 'var(--ios-green)'
                                            }}
                                        >
                                            <CheckCircle size={16} />
                                            Completar
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => openRescheduleModal(apt)}
                                            className="btn-ios-secondary p-2"
                                            style={{
                                                flex: 1.2,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            <Edit size={16} />
                                            Aplazar
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleStatusUpdate(apt.id_reservas, 3)}
                                            className="ios-btn secondary p-2"
                                            style={{
                                                flex: 1.2,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem',
                                                backgroundColor: 'rgba(255, 69, 58, 0.15)',
                                                color: '#ff453a',
                                                border: 'none'
                                            }}
                                        >
                                            <XCircle size={16} />
                                            Cancelar
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </AnimatedItem>
                    ))}
                </AnimatedContainer>
            )}

            {/* Modal de Reprogramación (Aplazar) */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="ios-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="ios-modal"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="ios-modal-header">
                                <h3>Aplazar Cita</h3>
                                <button className="close-btn" onClick={() => setShowModal(false)}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            <form onSubmit={handleReschedule} className="ios-modal-form">
                                <div className="form-group">
                                    <label className="ios-label">Nueva Fecha</label>
                                    <input
                                        type="date"
                                        className="ios-input"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="ios-label">Nuevo Horario</label>
                                    <select
                                        className="ios-input"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        disabled={loadingSlots || !newDate}
                                        required
                                    >
                                        <option value="">Selecciona una hora</option>
                                        {Array.isArray(availableSlots) && availableSlots.filter(s => s.isAvailable).map(slot => (
                                            <option key={slot.id} value={slot.id}>{slot.time}</option>
                                        ))}
                                    </select>
                                    {loadingSlots && <p className="text-muted extra-small mt-1">Cargando disponibilidad...</p>}
                                </div>

                                <div className="ios-modal-footer">
                                    <button
                                        type="button"
                                        className="ios-btn secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cerrar
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="ios-btn primary"
                                    >
                                        Confirmar
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BarberAppointments;
