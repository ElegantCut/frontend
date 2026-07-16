import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const AdminsTab = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    prim_nombre: '',
    seg_nombre: '',
    apellido1: '',
    apellido2: '',
    telefono: ''
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await api.get('/admin/administrators');
      const data = response.data;

      if (data.success && data.data) {
        setAdmins(data.data);
      } else {
        setError('No se pudieron cargar los administradores');
      }
    } catch (err) {
      console.error('Error loading admins:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `/admin/administrators/${editingId}`
        : '/admin/administrators';

      const method = editingId ? 'patch' : 'post';

      // Si estamos editando y no hay contraseña, la quitamos del objeto para no sobreescribirla
      const payload = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password;
      }

      // Mapeamos password a password_hash si el backend lo requiere
      if (payload.password) {
        payload.password_hash = payload.password;
        delete payload.password;
      }

      const response = await api[method](url, payload);
      const data = response.data;

      if (data.success || data.id_usuario) { // NestJS a veces devuelve el objeto creado directamente
        setSuccessMessage(editingId ? 'Administrador actualizado con éxito' : 'Administrador creado con éxito');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadAdmins();
        setShowModal(false);
        resetForm();
      } else {
        setError(data.error || 'Error al guardar');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      const msg = error.response?.data?.message;

      if (Array.isArray(msg)) {
        setError(msg.join('\n'));
      } else if (typeof msg === 'object') {
        setError(JSON.stringify(msg, null, 2));
      } else {
        setError(msg || 'Error de conexión');
      }
      setTimeout(() => setError(null), 3000);
    }

  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Seguro que deseas ${action} este administrador?`)) return;

    try {
      const response = await api.put(`/admin/administrators/${id}/toggle`);
      const data = response.data;

      // data es el objeto usuario actualizado
      if (data) {
        loadAdmins();
      }
    } catch (error) {
      console.error('Error toggling admin:', error);
      alert('Error al cambiar el estado');
    }
  };

  const handleEdit = (admin) => {
    setEditingId(admin.id_usuario);
    setFormData({
      username: admin.username,
      password: '',
      email: admin.email,
      prim_nombre: admin.prim_nombre,
      seg_nombre: admin.seg_nombre || '',
      apellido1: admin.apellido1,
      apellido2: admin.apellido2 || '',
      telefono: admin.telefono || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      prim_nombre: '',
      seg_nombre: '',
      apellido1: '',
      apellido2: '',
      telefono: ''
    });
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="admins-container">
      <header className="tab-header">
        <h2>Administradores</h2>
        <div className="action-buttons">
          <button className="btn-ios" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="bi bi-person-plus me-1"></i> Nuevo Admin
          </button>
        </div>
      </header>

      {!showModal && error && <div className="alert alert-danger m-3">{error}</div>}
      {!showModal && successMessage && <div className="alert alert-success m-3">{successMessage}</div>}

      <AnimatePresence>
        {showModal && (
          <div className="admin-overlay d-flex align-items-center justify-content-center p-3">
            <motion.div
              className="ios-card w-100 shadow-lg"
              style={{ maxWidth: '550px', borderRadius: '24px', overflow: 'hidden' }}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
            >
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center sticky-top" style={{ backgroundColor: 'var(--ios-card)' }}>
                <h3 className="ios-item-title fs-5 m-0">{editingId ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
                <button className="btn-close" style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }} onClick={() => setShowModal(false)}></button>
              </div>

              {error && <div className="alert alert-danger m-3">{error}</div>}
              {successMessage && <div className="alert alert-success m-3">{successMessage}</div>}

              <form onSubmit={handleSubmit} className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto', backgroundColor: 'var(--ios-card)' }}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="ios-label">Usuario</label>
                    <input type="text" className="ios-input" required
                      placeholder="Username..."
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="ios-label">Contraseña</label>
                    <input type="password" className="ios-input"
                      required={!editingId}
                      placeholder={editingId ? 'Sin cambios...' : '••••••••'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="ios-label">Nombre</label>
                    <input type="text" className="ios-input" required
                      placeholder="Nombre..."
                      value={formData.prim_nombre}
                      onChange={e => setFormData({ ...formData, prim_nombre: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="ios-label">Apellido</label>
                    <input type="text" className="ios-input" required
                      placeholder="Apellido..."
                      value={formData.apellido1}
                      onChange={e => setFormData({ ...formData, apellido1: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="ios-label">Correo Electrónico</label>
                    <input type="email" className="ios-input" required
                      placeholder="email@ejemplo.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-5 d-flex gap-2 justify-content-end">
                  <button type="button" className="btn-ios-secondary px-4 py-2" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-ios px-4 py-2">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="ios-section-header">Directorio de Staff</div>
      <div className="ios-list-group">
        <AnimatedContainer>
          {admins.map(admin => (
            <AnimatedItem key={admin.id_usuario} className="ios-list-item">
              <div className="ios-item-content">
                <span className="ios-item-title">{admin.prim_nombre} {admin.apellido1}</span>
                <span className="ios-item-subtitle">@{admin.username} • {admin.email}</span>
              </div>

              <div className="ios-item-actions">
                <span className={`ios-badge ${admin.estado ? 'success' : 'neutral'}`}>
                  {admin.estado ? 'Activo' : 'Inactivo'}
                </span>

                <button className="ios-icon-btn ms-2" onClick={() => handleEdit(admin)}>
                  <i className="bi bi-pencil"></i>
                </button>

                <button
                  className={`ios-icon-btn ${admin.estado ? 'danger' : 'success'}`}
                  onClick={() => handleToggleStatus(admin.id_usuario, admin.estado)}
                >
                  <i className={`bi ${admin.estado ? 'bi-person-x' : 'bi-person-check'}`}></i>
                </button>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      </div>
    </div>
  );
};
export default AdminsTab;

