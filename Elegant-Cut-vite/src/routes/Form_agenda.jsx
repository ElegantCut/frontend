import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Calendar, Clock, User, Phone, Mail, CreditCard, FileText, Star, MapPin, Award } from 'lucide-react';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';

function Form_agenda() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    barber: '',
    service: '',
    notes: '',
    paymentMethod: 'efectivo'
  });

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar servicios, barberos y horarios desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar servicios
        const servicesResponse = await fetch('http://localhost:3001/api/services');
        if (!servicesResponse.ok) {
          throw new Error('Error cargando servicios');
        }
        const servicesData = await servicesResponse.json();
        setServices(Array.isArray(servicesData.data) ? servicesData.data : Array.isArray(servicesData) ? servicesData : []);

        // Cargar barberos
        const barbersResponse = await fetch('http://localhost:3001/api/barbers');
        if (!barbersResponse.ok) {
          throw new Error('Error cargando barberos');
        }
        const barbersData = await barbersResponse.json();
        setBarbers(Array.isArray(barbersData.data) ? barbersData.data : Array.isArray(barbersData) ? barbersData : []);

        // Cargar horarios desde la DB
        try {
          const hoursResponse = await fetch('http://localhost:3001/api/horarios');
          if (hoursResponse.ok) {
            const hoursData = await hoursResponse.json();
            if (Array.isArray(hoursData) && hoursData.length > 0) {
              setTimeSlots(hoursData);
            } else {
              // Fallback si devuelve vacío
              const slots = [
                '08:00', '09:00', '10:00', '11:00', '12:00',
                '14:00', '15:00', '16:00', '17:00', '18:00'
              ];
              setTimeSlots(slots);
            }
          } else {
            throw new Error('Failed to fetch hours');
          }
        } catch (e) {
          console.warn('No se pudieron cargar horarios de DB, usando default', e);
          const slots = [
            '08:00', '09:00', '10:00', '11:00', '12:00',
            '14:00', '15:00', '16:00', '17:00', '18:00'
          ];
          setTimeSlots(slots);
        }

        setDataLoaded(true);

      } catch (error) {
        console.error('Error cargando datos:', error);

        // Datos de prueba como fallback
        setServices([
          { id_servicio: 1, nombre: 'Corte Básico', precio: 15000, duracion: 30 },
          { id_servicio: 2, nombre: 'Corte con Estilo', precio: 20000, duracion: 45 }
        ]);
        setBarbers([
          { id_usuario: 1, prim_nombre: 'Carlos', apellido1: 'Rodríguez' },
          { id_usuario: 2, prim_nombre: 'Luis', apellido1: 'García' }
        ]);

        setTimeSlots([
          '08:00', '09:00', '10:00', '11:00', '12:00',
          '14:00', '15:00', '16:00', '17:00', '18:00'
        ]);

        setDataLoaded(true);
      }
    };

    fetchData();
  }, []);

  // NUEVO: Actualizar horarios disponibles cuando cambia fecha o barbero
  useEffect(() => {
    const fetchAvailability = async () => {
      // Solo filtrar si hay fecha Y barbero seleccionados
      if (!formData.date || !formData.barber) {
        return; // No hacer nada, mantener los horarios base
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/appointments/availability?date=${formData.date}&barberId=${formData.barber}`);
        if (response.ok) {
          const slots = await response.json();
          setTimeSlots(Array.isArray(slots) ? slots : []);
        } else {
          console.warn('Endpoint availability falló, manteniendo horarios base');
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        // Mantener los horarios base cargados inicialmente
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [formData.date, formData.barber]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.barber || !formData.service) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        date: formData.date,
        time: formData.time,
        barber: formData.barber,
        service: formData.service,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod
      };

      console.log('Enviando datos:', appointmentData);

      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`¡Cita agendada exitosamente! ID: ${result.appointmentId}\n\n${formData.name}, tu cita está confirmada para el ${formatDate(formData.date)} a las ${formData.time}`);

        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          date: '',
          time: '',
          barber: '',
          service: '',
          notes: '',
          paymentMethod: 'efectivo'
        });
      } else {
        alert('Error al agendar la cita: ' + result.message);
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Asegurarnos de que services y barbers sean arrays antes de usar find
  const selectedService = Array.isArray(services) ? services.find(s => s.id_servicio == formData.service) : null;
  const selectedBarber = Array.isArray(barbers) ? barbers.find(b => b.id_usuario == formData.barber) : null;

  // Mostrar loading mientras se cargan los datos
  if (!dataLoaded) {
    return (
      <div className="form-agenda-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando servicios y barberos...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage className="form-agenda-container">
      {/* HERO HEADER */}
      <div className="hero-header">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="hero-icon"
          >
            <Scissors size={48} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-title"
          >
            Elegant Cut
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hero-subtitle"
          >
            Reserva tu cita con los mejores profesionales
          </motion.p>
          <div className="hero-features">
            {[
              { icon: Award, text: "Barberos Certificados" },
              { icon: Star, text: "+1000 Clientes Satisfechos" },
              { icon: MapPin, text: "Bogotá, Colombia" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="hero-feature"
              >
                <feature.icon size={20} />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <main className="main-content">
        <div className="form-wrapper">
          {/* INFORMACIÓN DE LA BARBERÍA */}
          <div className="info-sidebar">
            <AnimatedContainer>
              <AnimatedItem className="info-card">
                <h3>¿Por qué elegirnos?</h3>
                <ul className="benefits-list">
                  <li>
                    <Star className="benefit-icon" size={18} />
                    <div>
                      <strong>Calidad garantizada</strong>
                      <p>Profesionales con más de 10 años de experiencia</p>
                    </div>
                  </li>
                  <li>
                    <Scissors className="benefit-icon" size={18} />
                    <div>
                      <strong>Técnicas modernas</strong>
                      <p>Equipos de última generación y productos premium</p>
                    </div>
                  </li>
                  <li>
                    <Clock className="benefit-icon" size={18} />
                    <div>
                      <strong>Puntualidad</strong>
                      <p>Respetamos tu tiempo, sin esperas innecesarias</p>
                    </div>
                  </li>
                </ul>
              </AnimatedItem>

              <AnimatedItem className="info-card contact-card">
                <h3>Contáctanos</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <Phone size={18} />
                    <span>+57 310 123 4567</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={18} />
                    <span>info@elegantcut.co</span>
                  </div>
                  <div className="contact-item">
                    <MapPin size={18} />
                    <span>Calle 123 #45-67, Bogotá</span>
                  </div>
                </div>
              </AnimatedItem>

              {/* RESUMEN DE RESERVA */}
              <AnimatePresence>
                {(selectedService || selectedBarber) && (
                  <AnimatedItem className="info-card summary-card">
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Resumen de tu cita
                    </motion.h3>
                    <AnimatePresence mode="wait">
                      {selectedService && (
                        <motion.div
                          key={`service-${selectedService.id_servicio}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="summary-item"
                        >
                          <span className="summary-label">Servicio:</span>
                          <span className="summary-value">{selectedService.nombre}</span>
                          <span className="summary-price">${selectedService.precio?.toLocaleString()}</span>
                          <span className="summary-duration">{selectedService.duracion} min</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      {selectedBarber && (
                        <motion.div
                          key={`barber-${selectedBarber.id_usuario}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="summary-item"
                        >
                          <span className="summary-label">Barbero:</span>
                          <span className="summary-value">
                            {selectedBarber.prim_nombre} {selectedBarber.apellido1}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {formData.date && (
                      <div className="summary-item">
                        <span className="summary-label">Fecha:</span>
                        <span className="summary-value">{formatDate(formData.date)}</span>
                      </div>
                    )}
                    {formData.time && (
                      <div className="summary-item">
                        <span className="summary-label">Hora:</span>
                        <span className="summary-value">{formData.time}</span>
                      </div>
                    )}
                  </AnimatedItem>
                )}
              </AnimatePresence>
            </AnimatedContainer>
          </div>

          {/* FORMULARIO PRINCIPAL */}
          <AnimatedContainer className="form-main">
            <div className="form-header">
              <h2>Agenda tu cita</h2>
              <p>Completa el formulario y confirma tu reserva</p>
            </div>

            <div className="appointment-form">

              {/* INFORMACIÓN PERSONAL */}
              <AnimatedItem className="form-section">
                <div className="section-header">
                  <User className="section-icon" size={24} />
                  <h3>Información Personal</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">
                      Nombre Completo <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={18} />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Juan Pérez"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Teléfono <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="310 123 4567"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="email">Email (opcional)</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tucorreo@ejemplo.com"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              {/* SERVICIO Y BARBERO */}
              <AnimatedItem className="form-section">
                <div className="section-header">
                  <Scissors className="section-icon" size={24} />
                  <h3>Servicio y Profesional</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="service">
                      Selecciona tu servicio <span className="required">*</span>
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      disabled={loading || services.length === 0}
                    >
                      <option value="">Elige un servicio</option>
                      {Array.isArray(services) && services.map(service => (
                        <option key={service.id_servicio} value={service.id_servicio}>
                          {service.nombre} - ${service.precio?.toLocaleString()} ({service.duracion} min)
                        </option>
                      ))}
                    </select>
                    {services.length === 0 && (
                      <p className="error-message">No hay servicios disponibles</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="barber">
                      Selecciona tu barbero <span className="required">*</span>
                    </label>
                    <select
                      id="barber"
                      name="barber"
                      value={formData.barber}
                      onChange={handleInputChange}
                      disabled={loading || barbers.length === 0}
                    >
                      <option value="">Elige un barbero</option>
                      {Array.isArray(barbers) && barbers.map(barber => (
                        <option key={barber.id_usuario} value={barber.id_usuario}>
                          {barber.prim_nombre} {barber.apellido1} - {barber.especialidad || 'Barbero profesional'}
                        </option>
                      ))}
                    </select>
                    {barbers.length === 0 && (
                      <p className="error-message">No hay barberos disponibles</p>
                    )}
                  </div>
                </div>
              </AnimatedItem>

              {/* FECHA Y HORA */}
              <AnimatedItem className="form-section">
                <div className="section-header">
                  <Calendar className="section-icon" size={24} />
                  <h3>Fecha y Horario</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="date">
                      Fecha de la cita <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <Calendar className="input-icon" size={18} />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">
                      Horario disponible <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <Clock className="input-icon" size={18} />
                      <select
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        disabled={loading}
                      >
                        <option value="">Selecciona una hora</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              {/* NOTAS ADICIONALES */}
              <AnimatedItem className="form-section">
                <div className="section-header">
                  <FileText className="section-icon" size={24} />
                  <h3>Información Adicional</h3>
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notas o requerimientos especiales</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ej: Alergia a productos específicos, preferencias de estilo, etc."
                    rows="4"
                    disabled={loading}
                  />
                </div>
              </AnimatedItem>

              {/* MÉTODO DE PAGO */}
              <AnimatedItem className="form-section">
                <div className="section-header">
                  <CreditCard className="section-icon" size={24} />
                  <h3>Método de Pago</h3>
                </div>
                <div className="payment-options">
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`payment-option ${formData.paymentMethod === 'efectivo' ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="efectivo"
                      checked={formData.paymentMethod === 'efectivo'}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <div className="payment-content">
                      <CreditCard size={24} />
                      <span>Efectivo</span>
                      <p>Paga en la barbería</p>
                    </div>
                  </motion.label>

                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`payment-option ${formData.paymentMethod === 'transferencia' ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={formData.paymentMethod === 'transferencia'}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <div className="payment-content">
                      <Phone size={24} />
                      <span>Transferencia</span>
                      <p>Nequi, Bancolombia</p>
                    </div>
                  </motion.label>
                </div>
              </AnimatedItem>

              {/* BOTÓN DE ENVÍO */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="submit-btn"
                disabled={loading}
              >
                <Calendar size={20} />
                {loading ? 'Agendando cita...' : 'Confirmar mi cita'}
              </motion.button>

              <p className="form-disclaimer">
                Al confirmar tu cita, aceptas recibir recordatorios por WhatsApp o SMS
              </p>
            </div>
          </AnimatedContainer>
        </div>
      </main>
    </AnimatedPage>
  );
}

export default Form_agenda;