import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

// Note: Assuming AnimatedList is in the same directory or adjust path accordingly. 
// Since BarbersTab is in Componentes, and AnimatedList is in Componentes.

const BarbersTab = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newBarber, setNewBarber] = useState({
    username: '',
    password: '',
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
      const response = await fetch('http://localhost:3001/api/barbers/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      const data = await response.json();
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
    setNewBarber(prev => ({ ...prev, image: e.target.files[0] }));
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

      const response = await fetch('http://localhost:3001/api/barbers', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data', // NO AGREGAR ESTO MANUALMENTE CON FORMDATA, EL BROWSER LO HACE
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert('Barbero creado correctamente');
        setShowModal(false);
        setNewBarber({
          username: '', password: '', email: '',
          prim_nombre: '', seg_nombre: '', apellido1: '', apellido2: '',
          telefono: '', biografia: '', experiencia: '', especialidades: '', image: null
        });
        loadBarbers();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error al crear barbero');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} este barbero?`)) return;
    try {
      const response = await fetch(`http://localhost:3001/api/barbers/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      const data = await response.json();
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
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Barberos</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus me-2"></i> Nuevo Barbero
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Barbero</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <AnimatedContainer component="tbody">
              {barbers.map(barber => (
                <AnimatedItem tag="tr" key={barber.id_usuario}>
                  <td>
                    <div className="fw-bold">{barber.prim_nombre} {barber.apellido1}</div>
                    <div className="small text-muted">{barber.email}</div>
                  </td>
                  <td>{barber.telefono || 'N/A'}</td>
                  <td>
                    <span className={`badge ${barber.estado ? 'bg-success' : 'bg-danger'}`}>
                      {barber.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${barber.estado ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => handleToggleStatus(barber.id_usuario, barber.estado)}
                      title={barber.estado ? "Desactivar" : "Activar"}
                    >
                      <i className={`bi ${barber.estado ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                    </button>
                  </td>
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          </table>
        </div>
      </div>

      {/* Modal para Nuevo Barbero */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-dialog modal-lg"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title">Agregar Nuevo Barbero</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleAddBarber}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Username *</label>
                        <input type="text" className="form-control" name="username" value={newBarber.username} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Contraseña *</label>
                        <input type="password" className="form-control" name="password" value={newBarber.password} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-control" name="email" value={newBarber.email} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Teléfono</label>
                        <input type="text" className="form-control" name="telefono" value={newBarber.telefono} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Primer Nombre *</label>
                        <input type="text" className="form-control" name="prim_nombre" value={newBarber.prim_nombre} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Segundo Nombre</label>
                        <input type="text" className="form-control" name="seg_nombre" value={newBarber.seg_nombre} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Primer Apellido *</label>
                        <input type="text" className="form-control" name="apellido1" value={newBarber.apellido1} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Segundo Apellido</label>
                        <input type="text" className="form-control" name="apellido2" value={newBarber.apellido2} onChange={handleInputChange} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Foto de Perfil</label>
                        <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                        <div className="form-text">Formatos: JPG, PNG. Máx 5MB.</div>
                      </div>
                      <div className="col-12 mt-4">
                        <h6 className="border-bottom pb-2">Información del Portafolio</h6>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Biografía (Sobre mí)</label>
                        <textarea className="form-control" name="biografia" value={newBarber.biografia} onChange={handleInputChange} rows="3" placeholder="Ej. Profesional con más de 5 años de experiencia en cortes clásicos..."></textarea>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Experiencia</label>
                        <input type="text" className="form-control" name="experiencia" value={newBarber.experiencia} onChange={handleInputChange} placeholder="Ej. Senior Barber" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Especialidades</label>
                        <input type="text" className="form-control" name="especialidades" value={newBarber.especialidades} onChange={handleInputChange} placeholder="Ej. Corte Clásico, Fade, Barba" />
                        <div className="form-text">Separadas por comas.</div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar Barbero</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default BarbersTab;
