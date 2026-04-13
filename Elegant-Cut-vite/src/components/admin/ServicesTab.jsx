import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const ServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    id_categoria: ''
  });

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/services/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Convertir valores a números
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio),
        duracion: parseInt(formData.duracion),
        id_categoria: parseInt(formData.id_categoria)
      };

      const response = await api.post('/services', payload);
      if (response.data) {
        alert('Servicio creado con éxito');
        setShowModal(false);
        setFormData({ nombre: '', descripcion: '', precio: '', duracion: '', id_categoria: '' });
        loadServices(); // Recargar lista
      }
    } catch (err) {
      console.error('Error creating service:', err);
      alert('Error al crear el servicio: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="services-container">
      <header className="tab-header">
        <h2>Servicios</h2>
        <div className="action-buttons">
          <button className="btn-ios" onClick={() => {
            loadCategories(); // Asegurar recarga antes de abrir
            setShowModal(true);
          }}>
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

      {/* Modal de Nuevo Servicio */}
      {showModal && (
        <div className="ios-modal-overlay">
          <div className="ios-modal">
            <div className="ios-modal-header">
              <h3>Nuevo Servicio</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="ios-modal-form">
              <div className="form-group">
                <label>Nombre del Servicio</label>
                <input 
                  type="text" 
                  required 
                  className="ios-input" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Corte Degradado"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  required 
                  className="ios-input" 
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Describe brevemente el servicio..."
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Precio ($)</label>
                  <input 
                    type="number" 
                    required 
                    className="ios-input" 
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    placeholder="25000"
                  />
                </div>
                <div className="form-group half">
                  <label>Duración (min)</label>
                  <input 
                    type="number" 
                    required 
                    className="ios-input" 
                    value={formData.duracion}
                    onChange={(e) => setFormData({...formData, duracion: e.target.value})}
                    placeholder="45"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Categoría y Género</label>
                <select 
                  required 
                  className="ios-input"
                  value={formData.id_categoria}
                  onChange={(e) => setFormData({...formData, id_categoria: e.target.value})}
                >
                  <option value="">Seleccione una categoría...</option>
                  {categories.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre} - {cat.genero_servicio?.nombre || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ios-modal-footer">
                <button type="button" className="ios-btn secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="ios-btn primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ServicesTab;