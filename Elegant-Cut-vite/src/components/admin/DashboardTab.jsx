import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { AnimatedContainer, AnimatedItem } from '../shared/AnimatedList';
import { motion } from 'framer-motion';

const DashboardTab = () => {
  const [stats, setStats] = useState({
    citasHoy: 0,
    ingresosHoy: 0,
    clientesNuevos: 0,
    citasPendientes: 0,
    citasCompletadas: 0,
    citasCanceladas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      const data = response.data;

      if (data.success && data.data) {
        setStats(data.data);
      } else {
        setError('No se pudieron cargar las estadísticas');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="mb-4">Panel de Control</h2>

      <AnimatedContainer className="row g-4 mb-4">
        <AnimatedItem className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Citas Hoy</p>
                  <h3 className="mb-0">{stats.citasHoy}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-calendar-check text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        <AnimatedItem className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Ingresos Hoy</p>
                  <h3 className="mb-0">${stats.ingresosHoy.toLocaleString()}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cash-stack text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        <AnimatedItem className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Clientes Nuevos</p>
                  <h3 className="mb-0">{stats.clientesNuevos}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-person-plus text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        <AnimatedItem className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Pendientes</p>
                  <h3 className="mb-0">{stats.citasPendientes}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-clock-history text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>
      </AnimatedContainer>

      <AnimatedContainer className="row g-4">
        <AnimatedItem className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Resumen del Día</h5>
              <div className="row text-center g-3">
                <div className="col-12 col-sm-4">
                  <div className="mb-2">
                    <i className="bi bi-check-circle text-success fs-3"></i>
                  </div>
                  <h4>{stats.citasCompletadas}</h4>
                  <p className="text-muted small mb-0">Completadas</p>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="mb-2">
                    <i className="bi bi-hourglass-split text-warning fs-3"></i>
                  </div>
                  <h4>{stats.citasPendientes}</h4>
                  <p className="text-muted small mb-0">Pendientes</p>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="mb-2">
                    <i className="bi bi-x-circle text-danger fs-3"></i>
                  </div>
                  <h4>{stats.citasCanceladas}</h4>
                  <p className="text-muted small mb-0">Canceladas</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        <AnimatedItem className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Acciones Rápidas</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-calendar-plus me-2"></i>Nueva Cita
                </button>
                <button className="btn btn-outline-success">
                  <i className="bi bi-person-plus me-2"></i>Nuevo Cliente
                </button>
                <button className="btn btn-outline-info">
                  <i className="bi bi-file-earmark-text me-2"></i>Ver Reportes
                </button>
              </div>
            </div>
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </div>
  );
};

export default DashboardTab;