import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const AppointmentsTab = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/appointments/admin/all');
      const data = response.data;
      if (data.success && data.data) {
        setAppointments(data.data);
      } else {
        setError('No se pudieron cargar las citas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`/appointments/admin/${id}/status`, { nuevoEstado: newStatus });
      const data = response.data;
      if (data.success) {
        loadAppointments();
      } else {
        alert(data.message || 'Error actualizando cita');
      }
    } catch (e) { 
      console.error(e);
      alert('Error de conexión al actualizar la cita'); 
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="appointments-container">
      <header className="tab-header">
        <h2>Citas</h2>
      </header>

      <div className="ios-section-header">Agenda del Sistema</div>
      <div className="ios-list-group">
        <AnimatedContainer>
          {appointments.length === 0 ? (
            <div className="p-5 text-center text-muted">No hay citas registradas</div>
          ) : (
            appointments.map(apt => (
              <AnimatedItem key={apt.id_reservas} className="ios-list-item">
                <div className="ios-item-content">
                  <span className="ios-item-title">
                    {typeof apt.cliente === 'object' && apt.cliente
                      ? `${apt.cliente.prim_nombre} ${apt.cliente.apellido1}`
                      : (apt.cliente || 'Cliente')}
                  </span>
                  <span className="ios-item-subtitle">
                    {apt.servicio} • {apt.fecha ? new Date(apt.fecha).toLocaleDateString() : 'Cita'} a las {apt.hora_inicio || '--:--'}
                  </span>
                </div>

                <div className="ios-item-actions">
                  <span className={`ios-badge ${
                    apt.estado === 'Completada' ? 'success' :
                    apt.estado === 'Cancelada' ? 'danger' : 'neutral'
                  }`}>
                    {apt.estado}
                  </span>

                  {apt.estado === 'Pendiente' && (
                    <div className="d-flex gap-1">
                      <button 
                        className="ios-icon-btn success" 
                        onClick={() => handleStatusChange(apt.id_reservas, 2)}
                        title="Completar"
                      >
                        <i className="bi bi-check-circle"></i>
                      </button>
                      <button 
                        className="ios-icon-btn danger" 
                        onClick={() => handleStatusChange(apt.id_reservas, 3)}
                        title="Cancelar"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedItem>
            ))
          )}
        </AnimatedContainer>
      </div>
    </div>
  );
};
export default AppointmentsTab;