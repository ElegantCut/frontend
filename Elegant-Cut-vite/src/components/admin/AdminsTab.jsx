import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const AdminsTab = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

            const method = editingId ? 'put' : 'post';

            const response = await api[method](url, formData);

            const data = response.data;

            if (data.success) {
                loadAdmins();
                setShowModal(false);
                resetForm();
            } else {
                alert(data.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            alert('Error de conexión');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus === 1 ? 'desactivar' : 'activar';
        if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} este administrador?`)) return;

        try {
            const response = await api.put(`/admin/administrators/${id}/toggle`);
            const data = response.data;

            if (data.success) {
                setAdmins(admins.map(a =>
                    a.id_usuario === id ? { ...a, estado: data.newStatus } : a
                ));
            } else {
                alert(data.error || 'Error al cambiar estado');
            }
        } catch (error) {
            console.error('Error toggling admin:', error);
            alert('Error de conexión');
        }
    };

    const handleEdit = (admin) => {
        setEditingId(admin.id_usuario);
        setFormData({
            username: admin.username,
            password: '', // Password not shown
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
    if (error) return <div className="alert alert-warning m-3">{error}</div>;

    return (
    <div className="admins-container">
      <header className="tab-header">
        <h2>Administradores</h2>
        <div className="action-buttons">
          <button className="btn-ios" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="bi bi-plus-lg me-1"></i> Nuevo Admin
          </button>
        </div>
      </header>

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
                 <h3 className="ios-item-title fs-4">{editingId ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
                 <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Usuario</label>
                    <input type="text" className="ios-search-bar" required
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Contraseña</label>
                    <input type="password" className="ios-search-bar"
                      required={!editingId}
                      placeholder={editingId ? 'Sin cambios...' : '••••••••'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Nombre</label>
                    <input type="text" className="ios-search-bar" required
                      value={formData.prim_nombre}
                      onChange={e => setFormData({ ...formData, prim_nombre: e.target.value })}
                    />
                  </div>
                   <div className="col-md-6">
                    <label className="ios-item-subtitle mb-1 d-block">Apellido</label>
                    <input type="text" className="ios-search-bar" required
                      value={formData.apellido1}
                      onChange={e => setFormData({ ...formData, apellido1: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                     <label className="ios-item-subtitle mb-1 d-block">Email</label>
                     <input type="email" className="ios-search-bar" required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                     />
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
                <span className={`ios-badge ${admin.estado === 1 ? 'success' : 'neutral'}`}>
                  {admin.estado === 1 ? 'Activo' : 'Inactivo'}
                </span>
                
                <button className="ios-icon-btn ms-2" onClick={() => handleEdit(admin)}>
                  <i className="bi bi-pencil"></i>
                </button>

                <button 
                  className={`ios-icon-btn ${admin.estado === 1 ? 'danger' : 'success'}`}
                  onClick={() => handleToggleStatus(admin.id_usuario, admin.estado)}
                >
                   <i className={`bi ${admin.estado === 1 ? 'bi-person-x' : 'bi-person-check'}`}></i>
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

