import api from '../../lib/axios';
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
      const response = await api.get('/clients');
      const data = response.data;

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
      const response = await api.delete(`/clients/${id}`);
      const data = response.data;
      if (data.success) {
        loadClients();
      } else {
        alert('No se pudo desactivar el cliente');
      }
    } catch (error) { console.error(error); }
  };

  const handleActivate = async (id) => {
    try {
      const response = await api.patch(`/clients/${id}/activate`);
      const data = response.data;
      if (data.success) {
        loadClients();
      } else {
        alert('No se pudo activar el cliente');
      }
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="admin-tab-wrapper w-100">
      <header className="tab-header">
        <h2>Clientes</h2>
        <div className="action-buttons">
          <button className="btn-ios-secondary" onClick={loadClients}>
             <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
          </button>
        </div>
      </header>

      <div className="ios-section-header">Directorio de Clientes</div>
      <div className="ios-list-group">
        <AnimatedContainer>
          {clients.length === 0 ? (
            <div className="p-5 text-center text-muted">No hay clientes registrados</div>
          ) : (
            clients.map(client => (
              <AnimatedItem key={client.id_usuario} className="ios-list-item">
                <div className="ios-item-content">
                  <span className="ios-item-title">{client.prim_nombre} {client.apellido1}</span>
                  <span className="ios-item-subtitle d-flex gap-2">
                    <span>{client.email}</span>
                    {client.telefono && <span>• {client.telefono}</span>}
                  </span>
                </div>

                <div className="ios-item-actions">
                  <span className={`ios-badge ${client.estado ? 'success' : 'neutral'}`}>
                    {client.estado ? 'Activo' : 'Inactivo'}
                  </span>
                  {!client.estado ? (
                    <button 
                      className="ios-icon-btn success" 
                      onClick={() => handleActivate(client.id_usuario)}
                      title="Activar"
                    >
                      <i className="bi bi-check-circle"></i>
                    </button>
                  ) : (
                    <button 
                      className="ios-icon-btn danger" 
                      onClick={() => handleDeactivate(client.id_usuario)}
                      title="Desactivar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
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

export default ClientsTab;
