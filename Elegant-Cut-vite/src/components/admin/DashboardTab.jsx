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
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const response = await api.get('/dashboard/stats/pdf', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fecha = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');

      link.setAttribute('download', `Reporte_Estadisticas_${fecha}.pdf`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('No se pudo descargar el reporte en PDF');
    } finally {
      setDownloadingPdf(false);
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
    <div className="dashboard-container">
      <header className="tab-header">
        <h2>Panel de Control</h2>
        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-ios-secondary"
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            title="Exportar Reporte a PDF"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {downloadingPdf ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-file-earmark-pdf"></i>
            )}
            <span>Exportar PDF</span>
          </button>
          <button className="btn-ios-secondary" onClick={loadStats}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </header>

      <AnimatedContainer className="ios-widget-grid">
        <AnimatedItem className="ios-widget">
          <div className="ios-widget-icon" style={{ backgroundColor: 'rgba(0,122,255,0.1)', color: 'var(--ios-blue)' }}>
            <i className="bi bi-calendar-check"></i>
          </div>
          <h4>Citas Hoy</h4>
          <p className="value">{stats.citasHoy}</p>
        </AnimatedItem>

        <AnimatedItem className="ios-widget">
          <div className="ios-widget-icon" style={{ backgroundColor: 'rgba(52,199,89,0.1)', color: 'var(--ios-green)' }}>
            <i className="bi bi-cash-stack"></i>
          </div>
          <h4>Ingresos Hoy</h4>
          <p className="value">${stats.ingresosHoy.toLocaleString()}</p>
        </AnimatedItem>

        <AnimatedItem className="ios-widget">
          <div className="ios-widget-icon" style={{ backgroundColor: 'rgba(188,32,65,0.1)', color: 'var(--ios-red)' }}>
            <i className="bi bi-person-plus"></i>
          </div>
          <h4>Clientes Nuevos</h4>
          <p className="value">{stats.clientesNuevos}</p>
        </AnimatedItem>

        <AnimatedItem className="ios-widget">
          <div className="ios-widget-icon" style={{ backgroundColor: 'rgba(255,149,0,0.1)', color: 'var(--ios-orange)' }}>
            <i className="bi bi-clock-history"></i>
          </div>
          <h4>Pendientes</h4>
          <p className="value">{stats.citasPendientes}</p>
        </AnimatedItem>
      </AnimatedContainer>

      <div className="row g-4">
        <AnimatedItem className="col-md-8">
          <div className="ios-card h-100">
            <h5 className="ios-item-title mb-4">Resumen del Estado</h5>
            <div className="row text-center g-3">
              <div className="col-4">
                <div className="mb-2">
                  <i className="bi bi-check-circle text-success fs-3"></i>
                </div>
                <h4 className="fw-bold">{stats.citasCompletadas}</h4>
                <p className="ios-item-subtitle mb-0">Completadas</p>
              </div>
              <div className="col-4">
                <div className="mb-2">
                  <i className="bi bi-hourglass-split text-warning fs-3"></i>
                </div>
                <h4 className="fw-bold">{stats.citasPendientes}</h4>
                <p className="ios-item-subtitle mb-0">Pendientes</p>
              </div>
              <div className="col-4">
                <div className="mb-2">
                  <i className="bi bi-x-circle text-danger fs-3"></i>
                </div>
                <h4 className="fw-bold">{stats.citasCanceladas}</h4>
                <p className="ios-item-subtitle mb-0">Canceladas</p>
              </div>
            </div>
          </div>
        </AnimatedItem>

        <AnimatedItem className="col-md-4">
          <div className="ios-card h-100">
            <h5 className="ios-item-title mb-4">Atajos Directos</h5>
            <div className="d-grid gap-3">
              <button className="btn-ios w-100 justify-content-center">
                <i className="bi bi-calendar-plus"></i> Nueva Cita
              </button>
              <button className="btn-ios-secondary w-100 justify-content-center">
                <i className="bi bi-person-plus"></i> Nuevo Cliente
              </button>
              <button className="btn-ios-secondary w-100 justify-content-center">
                <i className="bi bi-file-earmark-text"></i> Ver Reportes
              </button>
            </div>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default DashboardTab;