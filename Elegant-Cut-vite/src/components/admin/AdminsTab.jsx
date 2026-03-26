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
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Administradores</h2>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <i className="bi bi-plus-lg me-2"></i>Nuevo Administrador
                </button>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal d-block"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-dialog modal-lg"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingId ? 'Editar Administrador' : 'Nuevo Administrador'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Usuario *</label>
                                                <input type="text" className="form-control" required
                                                    value={formData.username}
                                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Contraseña {editingId && '(Dejar en blanco para mantener)'}</label>
                                                <input type="password" className="form-control"
                                                    required={!editingId}
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Primer Nombre *</label>
                                                <input type="text" className="form-control" required
                                                    value={formData.prim_nombre}
                                                    onChange={e => setFormData({ ...formData, prim_nombre: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Segundo Nombre</label>
                                                <input type="text" className="form-control"
                                                    value={formData.seg_nombre}
                                                    onChange={e => setFormData({ ...formData, seg_nombre: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Primer Apellido *</label>
                                                <input type="text" className="form-control" required
                                                    value={formData.apellido1}
                                                    onChange={e => setFormData({ ...formData, apellido1: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Segundo Apellido</label>
                                                <input type="text" className="form-control"
                                                    value={formData.apellido2}
                                                    onChange={e => setFormData({ ...formData, apellido2: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Email *</label>
                                                <input type="email" className="form-control" required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Teléfono</label>
                                                <input type="tel" className="form-control"
                                                    value={formData.telefono}
                                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary">Guardar</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Administrador</th>
                                <th>Contacto</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <AnimatedContainer component="tbody">
                            {admins.map(admin => (
                                <AnimatedItem tag="tr" key={admin.id_usuario}>
                                    <td>
                                        <div className="fw-bold">{admin.prim_nombre} {admin.apellido1}</div>
                                        <div className="small text-muted">@{admin.username}</div>
                                    </td>
                                    <td>
                                        <div><i className="bi bi-envelope me-1"></i> {admin.email}</div>
                                        <div><i className="bi bi-telephone me-1"></i> {admin.telefono || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${admin.estado === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                            {admin.estado === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary" onClick={() => handleEdit(admin)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className={`btn ${admin.estado === 1 ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                onClick={() => handleToggleStatus(admin.id_usuario, admin.estado)}
                                                title={admin.estado === 1 ? "Desactivar" : "Activar"}
                                            >
                                                <i className={`bi ${admin.estado === 1 ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                                            </button>
                                        </div>
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
export default AdminsTab;

