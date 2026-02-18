import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '../../components/shared/AnimatedList';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Edit } from 'lucide-react';
import { AuthClient } from '../../lib/utils/authClient';

const BarberAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

    // Estados para Reprogramación (Aplazar)
    const [showModal, setShowModal] = useState(false);
    const [selectedApt, setSelectedApt] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Cargar horarios cuando cambia la fecha en el modal
    useEffect(() => {
        if (newDate && selectedApt) {
            fetchAvailableSlots();
        }
    }, [newDate]);

    const fetchAppointments = async () => {
        try {
            const token = AuthClient.getToken();
            const response = await fetch('http://localhost:3001/api/barber-panel/my-appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data.data || []);
            } else {
                console.error('Error fetching appointments');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        try {
            const barberId = AuthClient.getUser()?.userId;
            const response = await fetch(`http://localhost:3001/api/appointments/availability?date=${newDate}&barberId=${barberId}`);
            if (response.ok) {
                const slots = await response.json();
                setAvailableSlots(slots);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            const token = AuthClient.getToken();
            const response = await fetch(`http://localhost:3001/api/barber-panel/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newStatus })
            });

            if (response.ok) {
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
            const token = AuthClient.getToken();
            const response = await fetch(`http://localhost:3001/api/barber-panel/appointments/${selectedApt.id_reservas}/reschedule`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newDate, newTime })
            });

            if (response.ok) {
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
    };

    const getStatusBadge = (statusId) => {
        const statuses = {
            1: { label: 'Pendiente', color: '#f39c12', bgColor: '#fef5e7' },
            2: { label: 'Completada', color: '#27ae60', bgColor: '#eafaf1' },
            3: { label: 'Cancelada', color: '#e74c3c', bgColor: '#fadbd8' }
        };

        const status = statuses[statusId] || { label: 'Desconocido', color: '#95a5a6', bgColor: '#ecf0f1' };

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                color: status.color,
                backgroundColor: status.bgColor
            }}>
                {status.label}
            </span>
        );
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true;
        if (filter === 'pending') return apt.id_estado_cita === 1;
        if (filter === 'completed') return apt.id_estado_cita === 2;
        if (filter === 'cancelled') return apt.id_estado_cita === 3;
        return true;
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando citas...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Mis Citas
                </h1>
                <p style={{ color: '#666' }}>
                    Gestiona tus citas asignadas
                </p>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { value: 'all', label: 'Todas' },
                    { value: 'pending', label: 'Pendientes' },
                    { value: 'completed', label: 'Completadas' },
                    { value: 'cancelled', label: 'Canceladas' }
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: filter === f.value ? '2px solid #3498db' : '1px solid #ddd',
                            backgroundColor: filter === f.value ? '#ebf5fb' : 'white',
                            color: filter === f.value ? '#3498db' : '#666',
                            cursor: 'pointer',
                            fontWeight: filter === f.value ? 'bold' : 'normal'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista de citas */}
            {filteredAppointments.length === 0 ? (
                <AnimatedItem>
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <Calendar size={48} style={{ color: '#bdc3c7', marginBottom: '1rem' }} />
                        <p style={{ color: '#7f8c8d', fontSize: '1.125rem' }}>
                            No tienes citas {filter !== 'all' ? 'en esta categoría' : 'asignadas'}
                        </p>
                    </div>
                </AnimatedItem>
            ) : (
                <AnimatedContainer style={{ display: 'grid', gap: '1.5rem' }}>
                    {filteredAppointments.map(apt => (
                        <AnimatedItem
                            key={apt.id_reservas}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid #ecf0f1'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Calendar size={18} style={{ color: '#3498db' }} />
                                        <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                                            {new Date(apt.fecha).toLocaleDateString('es-CO', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={18} style={{ color: '#9b59b6' }} />
                                        <span style={{ fontSize: '1rem', color: '#666' }}>
                                            {apt.hora_inicio_formatted}
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(apt.id_estado_cita)}
                            </div>

                            <div style={{
                                borderTop: '1px solid #ecf0f1',
                                paddingTop: '1rem',
                                display: 'grid',
                                gap: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={18} style={{ color: '#34495e' }} />
                                    <span><strong>Cliente:</strong> {apt.cliente_nombre}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Phone size={18} style={{ color: '#16a085' }} />
                                    <span><strong>Teléfono:</strong> {apt.cliente_telefono}</span>
                                </div>

                                {apt.cliente_email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Mail size={18} style={{ color: '#e67e22' }} />
                                        <span><strong>Email:</strong> {apt.cliente_email}</span>
                                    </div>
                                )}

                                <div>
                                    <strong>Servicios:</strong> {apt.servicios || 'N/A'}
                                </div>

                                {apt.observaciones && (
                                    <div style={{ fontStyle: 'italic', backgroundColor: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
                                        <strong>Obs:</strong> {apt.observaciones}
                                    </div>
                                )}
                            </div>

                            {/* Botones de acción */}
                            {apt.id_estado_cita === 1 && (
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    marginTop: '1.5rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid #ecf0f1'
                                }}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleStatusUpdate(apt.id_reservas, 2)}
                                        style={{
                                            flex: 2,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: '#27ae60',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <CheckCircle size={18} />
                                        Completar
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openRescheduleModal(apt)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #3498db',
                                            backgroundColor: 'white',
                                            color: '#3498db',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Edit size={18} />
                                        Aplazar
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleStatusUpdate(apt.id_reservas, 3)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: '#fadbd8',
                                            color: '#e74c3c',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <XCircle size={18} />
                                        Cancelar
                                    </motion.button>
                                </div>
                            )}
                        </AnimatedItem>
                    ))}
                </AnimatedContainer>
            )}

            {/* Modal de Reprogramación (Aplazar) */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '12px',
                                width: '90%',
                                maxWidth: '400px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                Aplazar Cita
                            </h2>

                            <form onSubmit={handleReschedule}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Nueva Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd'
                                        }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Nuevo Horario
                                    </label>
                                    <select
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd'
                                        }}
                                        disabled={loadingSlots || !newDate}
                                        required
                                    >
                                        <option value="">Selecciona una hora</option>
                                        {availableSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                    {loadingSlots && <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Cargando disponibilidad...</p>}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            backgroundColor: '#f8f9fa',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cerrar
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: '#3498db',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
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
