import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const BarbersTab = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newBarber, setNewBarber] = useState({
    username: '',
    password_hash: '',
    email: '',
    prim_nombre: '',
    seg_nombre: '',
    apellido1: '',
    apellido2: '',
    telefono: '',
    biografia: '',
    experiencia: '',
    especialidades: '',
    image: null
  });

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const response = await api.get('/barbers/all');
      const data = response.data;
      if (data.success && data.data) {
        setBarbers(data.data);
      } else {
        setError('No se pudieron cargar los barberos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBarber(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea estrictamente menor a 2 MB
      if (file.size >= 2 * 1024 * 1024) {
        setError('La imagen de perfil debe pesar menos de 2 MB. Por favor, selecciona una más ligera.');
        setTimeout(() => setError(null), 5000);
        e.target.value = ''; // Limpiar el input
        setNewBarber(prev => ({ ...prev, image: null }));
        return;
      }
      setNewBarber(prev => ({ ...prev, image: file }));
    } else {
      setNewBarber(prev => ({ ...prev, image: null }));
    }
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newBarber).forEach(key => {
        if (key === 'image' && newBarber[key]) {
          formData.append('image', newBarber[key]);
        } else if (key === 'especialidades' && newBarber[key]) {
          const arr = newBarber[key].split(',').map(item => item.trim()).filter(Boolean);
          formData.append('especialidades', JSON.stringify(arr));
        } else if (key !== 'image') {
          formData.append(key, newBarber[key]);
        }
      });

      const response = await api.post('/barbers/create', formData);

      const data = response.data;
      if (data.success) {
        setSuccessMessage('Barbero creado correctamente');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowModal(false);
        setNewBarber({
          username: '', password_hash: '', email: '',
          prim_nombre: '', seg_nombre: '', apellido1: '', apellido2: '',
          telefono: '', biografia: '', experiencia: '', especialidades: '', image: null
        });
        loadBarbers();
      } else {
        setError('Error: ' + data.message);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Error al crear barbero');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} este barbero?`)) return;
    try {
      const response = await api.put(`/barbers/${id}/toggle`);
      const data = response.data;
      if (data.success) {
        setBarbers(barbers.map(b =>
          b.id_usuario === id ? { ...b, estado: data.newStatus } : b
        ));
      } else {
        alert('Error al cambiar estado');
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="barbers-container">
      <header className="tab-header">
        <h2>Barberos</h2>
        <div className="action-buttons">
          <button className="btn-ios" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus me-1"></i> Nuevo Barbero
          </button>
        </div>
      </header>

      {!showModal && error && <div className="alert alert-danger m-3">{error}</div>}
      {!showModal && successMessage && <div className="alert alert-success m-3">{successMessage}</div>}

      <AnimatePresence>
        {showModal && (
          <div className="admin-overlay d-flex align-items-center justify-content-center p-3">
            <motion.div
              className="ios-card w-100"
              style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="ios-item-title fs-4">Nuevo Barbero</h3>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              {error && <div className="alert alert-danger m-3">{error}</div>}
              {successMessage && <div className="alert alert-success m-3">{successMessage}</div>}

              <form onSubmit={handleAddBarber}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Usuario</label>
                    <input type="text" className="ios-search-bar" name="username" value={newBarber.username} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Email</label>
                    <input type="email" className="ios-search-bar" name="email" value={newBarber.email} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Nombre</label>
                    <input type="text" className="ios-search-bar" name="prim_nombre" value={newBarber.prim_nombre} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Apellido</label>
                    <input type="text" className="ios-search-bar" name="apellido1" value={newBarber.apellido1} onChange={handleInputChange} required />
                  </div>

                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Telefono</label>
                    <input type="text" className="ios-search-bar" name="telefono" value={newBarber.telefono} onChange={handleInputChange} required />
                  </div>

                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Biografia</label>
                    <input type="text" className="ios-search-bar" name="biografia" value={newBarber.biografia}
                      onChange={handleInputChange} required />
                  </div>

                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Experiencia</label>
                    <input type="text" className="ios-search-bar" name="experiencia" value={newBarber.experiencia} onChange={handleInputChange} required />
                  </div>

                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Especialidades</label>
                    <input type="text" className="ios-search-bar" name="especialidades" value={newBarber.especialidades} onChange={handleInputChange} required />
                  </div>

                  <div className="col-12">
                    <label className="ios-item-subtitle mb-1 d-block">Contraseña</label>
                    <input type="password" className="ios-search-bar" name="password_hash" value={newBarber.password_hash} onChange={handleInputChange} required />
                  </div>
                  <div className="col-12">
                    <label className="ios-item-subtitle mb-1 d-block">Foto de Perfil (Max 2 MB)</label>
                    <input type="file" className="ios-search-bar p-2" name="image" onChange={handleFileChange} accept="image/*" />
                  </div>
                </div>

                <div className="mt-4 d-flex gap-2 justify-content-end">
                  <button type="button" className="btn-ios-secondary px-4" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-ios px-4">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="ios-section-header">Equipo de Barberos</div>
      <div className="ios-list-group">
        <AnimatedContainer>
          {barbers.map(barber => (
            <AnimatedItem key={barber.id_usuario} className="ios-list-item">
              <div className="ios-item-content">
                <span className="ios-item-title">{barber.prim_nombre} {barber.apellido1}</span>
                <span className="ios-item-subtitle">{barber.email} • {barber.telefono || 'Sin teléfono'}</span>
              </div>

              <div className="ios-item-actions">
                <span className={`ios-badge ${barber.estado ? 'success' : 'danger'}`}>
                  {barber.estado ? 'Activo' : 'Inactivo'}
                </span>

                <button
                  className={`ios-icon-btn ${barber.estado ? 'danger' : 'success'}`}
                  onClick={() => handleToggleStatus(barber.id_usuario, barber.estado)}
                  title={barber.estado ? "Desactivar" : "Activar"}
                >
                  <i className={`bi ${barber.estado ? 'bi-person-x' : 'bi-person-check'}`}></i>
                </button>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      </div>
    </div>
  );
};
export default BarbersTab;
