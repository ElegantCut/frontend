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
      const response = await fetch('http://localhost:3001/admin/appointments');
      const data = await response.json();
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
      const response = await fetch(`http://localhost:3001/admin/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado: newStatus })
      });
      const data = await response.json();
      if (data.success) loadAppointments();
    } catch (e) { alert('Error actualizando cita'); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="p-4">
      <h2>Gestión de Citas</h2>
      <div className="card border-0 shadow-sm mt-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <AnimatedContainer component="tbody">
              {appointments.map(apt => (
                <AnimatedItem tag="tr" key={apt.id_reservas}>
                  <td>
                    <div>{new Date(apt.fecha).toLocaleDateString()}</div>
                    <div className="small text-muted">{apt.hora_inicio}</div>
                  </td>
                  <td>{apt.cliente}</td>
                  <td>{apt.servicio}</td>
                  <td>
                    <span className={`badge ${apt.estado === 'Completada' ? 'bg-success' :
                      apt.estado === 'Cancelada' ? 'bg-danger' : 'bg-warning'
                      }`}>{apt.estado}</span>
                  </td>
                  <td>
                    {apt.estado === 'Pendiente' && (
                      <>
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleStatusChange(apt.id_reservas, 2)}>
                          <i className="bi bi-check"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatusChange(apt.id_reservas, 3)}>
                          <i className="bi bi-x"></i>
                        </button>
                      </>
                    )}
                  </td>
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AppointmentsTab;