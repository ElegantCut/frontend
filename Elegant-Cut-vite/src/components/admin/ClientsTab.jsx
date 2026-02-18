import React, { useState, useEffect } from 'react';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const ClientsTab = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/clients');
      const data = await response.json();

      if (data.success && data.data) {
        setClients(data.data);
      } else {
        setError('No se pudieron cargar los clientes');
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Desactivar este cliente?')) return;
    try {
      const response = await fetch(`http://localhost:3001/admin/clients/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        loadClients();
      } else {
        alert('No se pudo desactivar el cliente');
      }
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Directorio de Clientes</h2>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <AnimatedContainer component="tbody">
              {clients.length === 0 ? (
                <AnimatedItem tag="tr">
                  <td colSpan="4" className="text-center py-4">No hay clientes registrados</td>
                </AnimatedItem>
              ) : (
                clients.map(client => (
                  <AnimatedItem tag="tr" key={client.id_usuario}>
                    <td>
                      <div className="fw-bold">{client.prim_nombre} {client.apellido1}</div>
                      <div className="small text-muted">ID: {client.id_usuario}</div>
                    </td>
                    <td>
                      <div><i className="bi bi-envelope me-1"></i> {client.email}</div>
                      <div><i className="bi bi-telephone me-1"></i> {client.telefono || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`badge ${client.estado === 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {client.estado === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeactivate(client.id_usuario)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </AnimatedItem>
                ))
              )}
            </AnimatedContainer>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsTab;
