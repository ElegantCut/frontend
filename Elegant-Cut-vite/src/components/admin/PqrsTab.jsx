import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';

const PqrsTab = () => {
  const [pqrsList, setPqrsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedPqrs, setSelectedPqrs] = useState(null);
  const [respuestaAdmin, setRespuestaAdmin] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    loadPqrs();
  }, []);

  const loadPqrs = async () => {
    try {
      const response = await api.get('/pqrs');
      const data = response.data;
      if (Array.isArray(data)) {
        setPqrsList(data);
      } else if (data.data) {
        setPqrsList(data.data);
      } else {
        setPqrsList([]);
      }
    } catch (err) {
      console.error('Error loading pqrs:', err);
      setError('Error al cargar las PQRS');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pqrs) => {
    setSelectedPqrs(pqrs);
    setRespuestaAdmin(pqrs.respuesta_admin || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPqrs(null);
    setRespuestaAdmin('');
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!respuestaAdmin.trim()) {
      alert('La respuesta no puede estar vacía');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        estado: 'Resuelto',
        respuesta_admin: respuestaAdmin,
      };

      await api.patch(`/pqrs/${selectedPqrs.id_pqrs}`, payload);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 4000);
      loadPqrs();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving pqrs response:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message;
      if (Array.isArray(msg)) {
        alert(msg.join('\n'));
      } else if (typeof msg === 'object') {
        alert(JSON.stringify(msg, null, 2));
      } else {
        alert(msg || 'Error al enviar la respuesta');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="pqrs-container">
      <div className="tab-header">
        <h2>Gestión de PQRS</h2>
      </div>

      {showSuccessAlert && (
        <div 
          className="alert alert-success d-flex align-items-center gap-2 mb-4 p-3 rounded-3" 
          role="alert"
          style={{ 
            borderLeft: '5px solid #24b263', 
            background: 'rgba(36, 178, 99, 0.15)', 
            color: '#24b263',
            borderColor: 'rgba(36, 178, 99, 0.3)'
          }}
        >
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>
            <strong>¡PQRS respondida!</strong> La respuesta se ha guardado correctamente.
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && selectedPqrs && (
          <div 
            className="admin-overlay d-flex align-items-center justify-content-center p-3"
            onClick={handleCloseModal}
          >
            <motion.div 
              className="ios-card w-100 shadow-lg"
              style={{ maxWidth: '600px', borderRadius: '24px', overflow: 'hidden' }}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
            >
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center sticky-top" style={{ backgroundColor: 'var(--ios-card)' }}>
                <h3 className="ios-item-title fs-5 m-0">
                  {selectedPqrs.tipo} #{selectedPqrs.id_pqrs}
                </h3>
                <button className="btn-close" style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }} onClick={handleCloseModal}></button>
              </div>

              <div className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto', backgroundColor: 'var(--ios-card)' }}>
                <div className="mb-4">
                  <h4 className="ios-label mb-2">Información del Cliente</h4>
                  <p className="mb-1 text-white">
                    <strong>Nombre:</strong> {selectedPqrs.usuarios?.prim_nombre} {selectedPqrs.usuarios?.apellido1}
                  </p>
                  <p className="mb-1 text-white">
                    <strong>Email:</strong> {selectedPqrs.usuarios?.email}
                  </p>
                  <p className="mb-1 text-white">
                    <strong>Teléfono:</strong> {selectedPqrs.usuarios?.telefono || 'No registrado'}
                  </p>
                  <p className="text-muted small">
                    Radicado el {new Date(selectedPqrs.fecha_creacion).toLocaleDateString()}
                  </p>
                </div>

                <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'var(--ios-bg)' }}>
                  <h4 className="ios-label text-danger mb-2">Asunto: {selectedPqrs.asunto}</h4>
                  <p className="text-white m-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedPqrs.descripcion}
                  </p>
                </div>

                <form onSubmit={handleSubmitResponse}>
                  <div className="mb-4">
                    <label className="ios-label">Respuesta del Administrador</label>
                    <textarea 
                      className="ios-input" 
                      required
                      rows="5"
                      placeholder="Escribe la respuesta aquí..."
                      value={respuestaAdmin}
                      onChange={e => setRespuestaAdmin(e.target.value)}
                      disabled={selectedPqrs.estado === 'Resuelto'}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button type="button" className="btn-ios-secondary px-4 py-2" onClick={handleCloseModal}>
                      {selectedPqrs.estado === 'Resuelto' ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {selectedPqrs.estado !== 'Resuelto' && (
                      <button type="submit" className="btn-ios px-4 py-2" disabled={saving}>
                        {saving ? 'Enviando...' : 'Responder y Resolver'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pqrs-list">
        <AnimatedContainer className="row g-4">
          {pqrsList.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              No hay PQRS registradas en el sistema.
            </div>
          ) : (
            pqrsList.map(pqrs => (
              <AnimatedItem key={pqrs.id_pqrs} className="col-12 col-lg-6">
                <div className="ios-card d-flex flex-column h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="ios-item-title mb-1">
                        {pqrs.tipo} - {pqrs.asunto}
                      </h3>
                      <span className="ios-item-subtitle d-block">
                        <i className="bi bi-person me-1"></i>
                        {pqrs.usuarios?.prim_nombre} ({pqrs.usuarios?.email})
                      </span>
                      <span className="ios-item-subtitle small d-block mt-1">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(pqrs.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`ios-badge ${pqrs.estado === 'Pendiente' ? 'danger' : 'success'}`}>
                      {pqrs.estado}
                    </span>
                  </div>

                  <div className="mt-auto pt-3 d-flex justify-content-end border-top" style={{ borderColor: 'var(--ios-separator) !important' }}>
                    <button 
                      className="btn-ios px-3 py-1 text-sm" 
                      onClick={() => handleOpenModal(pqrs)}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {pqrs.estado === 'Pendiente' ? 'Responder' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>
              </AnimatedItem>
            ))
          )}
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default PqrsTab;
