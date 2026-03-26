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
      const response = await api.get('/services');
      const data = response.data;
      if (data.success && data.data) {
        setServices(data.data);
      } else {
        setError('No se pudieron cargar los servicios');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-warning m-3">{error}</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Servicios</h2>
        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>Nuevo Servicio
        </button>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <AnimatedContainer component="tbody">
              {services.map(service => (
                <AnimatedItem tag="tr" key={service.id_servicio}>
                  <td>
                    <div className="fw-bold">{service.nombre_servicio}</div>
                    <div className="small text-muted">{service.descripcion}</div>
                  </td>
                  <td>${parseInt(service.precio).toLocaleString()}</td>
                  <td>{service.duracion_minutos} min</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="bi bi-trash"></i>
                    </button>
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
export default ServicesTab;