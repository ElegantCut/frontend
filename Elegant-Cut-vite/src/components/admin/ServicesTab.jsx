import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const ServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services/admin/all');
      const data = response.data;
      
      console.log('Services API Response:', data); // Debug logging

      if (data && data.success && Array.isArray(data.data)) {
        setServices(data.data);
        if (data.data.length === 0) {
          console.warn('API returned success but data array is empty.');
        }
      } else if (Array.isArray(data)) {
        setServices(data);
      } else {
        setError(`Formato de datos no reconocido o sin servicios. ${data?.message || ''}`);
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(`Error de conexión al cargar servicios: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('¿Eliminar este servicio del catálogo?')) return;
    try {
      const response = await api.delete(`/services/${id}`);
      if (response.data.success) {
        setServices(services.filter(s => s.id_servicio !== id));
      } else {
        alert(response.data.message || 'Error eliminando el servicio.');
      }
    } catch (e) { alert('Error de conexión'); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="services-container">
      <header className="tab-header">
        <h2>Servicios</h2>
        <div className="action-buttons">
          <button className="btn-ios" onClick={() => alert('Función "Nuevo Servicio" en desarrollo.')}>
            <i className="bi bi-plus-lg me-1"></i> Nuevo Servicio
          </button>
        </div>
      </header>

      <div className="ios-section-header">Catálogo de Servicios</div>
      <div className="ios-list-group">
        <AnimatedContainer>
          {services.length === 0 ? (
            <div className="p-5 text-center text-muted">No hay servicios registrados</div>
          ) : (
            services.map(service => (
              <AnimatedItem key={service.id_servicio} className="ios-list-item">
                <div className="ios-item-content">
                  <span className="ios-item-title">{service.nombre_servicio}</span>
                  <span className="ios-item-subtitle">{service.descripcion}</span>
                  <div className="mt-1">
                    <span className="ios-badge success me-2">${parseInt(service.precio).toLocaleString()}</span>
                    <span className="ios-badge neutral">{service.duracion_minutos} min</span>
                  </div>
                </div>

                <div className="ios-item-actions">
                  <button 
                    className="ios-icon-btn danger" 
                    onClick={() => handleDeleteService(service.id_servicio)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </AnimatedItem>
            ))
          )}
        </AnimatedContainer>
      </div>
    </div>
  );
};
export default ServicesTab;