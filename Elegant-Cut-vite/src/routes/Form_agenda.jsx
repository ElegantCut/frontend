import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors, Calendar, Clock, User, Phone, Mail,
  CreditCard, FileText, ChevronLeft, ChevronRight,
  Check, MapPin, CheckCircle
} from 'lucide-react';
import AnimatedPage from '../components/shared/AnimatedPage';
import '../styles/Form_agenda.css';
import { barberService } from '../lib/barberService';
import { servicesService } from '../lib/servicesService';
import { appointmentService } from '../lib/appointmentService';
import { AuthClient } from '../auth/authClient';
import { useLocation } from 'react-router-dom';
import { getCloudinaryServiceUrl } from '../lib/utils/imageHelper';

// MOCK DATA Fallbacks
const MOCK_BARBERS = [
  { id: 1, name: 'Carlos', last: 'Rodríguez', specialty: 'Fade & Diseño', emoji: 'CR' },
  { id: 2, name: 'Luis', last: 'García', specialty: 'Cortes Clásicos', emoji: 'LG' },
  { id: 3, name: 'Andrés', last: 'Martínez', specialty: 'Barbería Premium', emoji: 'AM' },
  { id: 4, name: 'Sebastián', last: 'López', specialty: 'Degradados', emoji: 'SL' },
];

const MOCK_SERVICES = [
  { id: 1, name: 'Corte de Cabello', price: 36000, duration: 30 },
  { id: 2, name: 'Corte + Barba', price: 55000, duration: 50 },
  { id: 3, name: 'Fade Profesional', price: 45000, duration: 40 },
  { id: 4, name: 'Diseño de Barba', price: 28000, duration: 25 },
  { id: 5, name: 'Tratamiento Capilar', price: 65000, duration: 60 },
];

const TIME_SLOTS = {
  mañana: ['9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am'],
  tarde: ['12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm', '3:30 pm', '4:00 pm', '4:30 pm', '5:00 pm', '5:30 pm'],
  noche: ['6:00 pm', '6:30 pm', '7:00 pm', '7:30 pm', '8:00 pm'],
};

// ── HELPERS ────────────────────────────────────────────
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function buildWeekDays(baseDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} de ${MONTH_NAMES[m - 1]} de ${y}`;
}

function priceFormat(n) {
  return '$' + n.toLocaleString('es-CO');
}

// ── ANIMATION VARIANTS ─────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }),
};

// ── COMPONENT ──────────────────────────────────────────
function Form_agenda() {
  const location = useLocation();
  const prepickedServices = location.state?.cart || [];
  const preselectedBarberOpt = location.state?.preselectedBarber || null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [step, setStep] = useState(1);
  const [direction, setDir] = useState(1);
  const [weekBase, setWeekBase] = useState(() => { const d = new Date(today); return d; });

  const [listaBarberos, setListaBarberos] = useState([]);
  const [listaServicios, setListaServicios] = useState([]);
  const [realHorarios, setRealHorarios] = useState([]);
  
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [barberos, servicios, horarios] = await Promise.all([
          barberService.getPublicBarbers ? barberService.getPublicBarbers() : barberService.getAllBarbers(),
          servicesService.getAllServices(),
          appointmentService.getHorarios()
        ]);
        
        setListaBarberos(barberos?.length > 0 ? barberos : MOCK_BARBERS);
        setListaServicios(servicios?.length > 0 ? servicios : MOCK_SERVICES);
        setRealHorarios(horarios || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setListaBarberos(MOCK_BARBERS);
        setListaServicios(MOCK_SERVICES);
      }
    };
    cargarDatosIniciales();
  }, []);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBarber, setBarber] = useState(preselectedBarberOpt || null);
  const [selectedService, setService] = useState(prepickedServices.length > 0 ? prepickedServices[0] : null);
  const [payMethod, setPayMethod] = useState('efectivo');
  const [contact, setContact] = useState({ name: '', phone: '', email: '', notes: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState(new Set());

  // Consultar disponibilidad cuando hay fecha + barbero (+ servicio para duración)
  useEffect(() => {
    const fetchAvailability = async () => {
      const barberId = selectedBarber?.id_usuario || selectedBarber?.id;
      if (!selectedDate || !barberId) {
        setOccupiedSlots(new Set());
        return;
      }
      try {
        // Obtener duración del servicio seleccionado (en minutos)
        const svcDuration = selectedService?.duracion || selectedService?.duration || undefined;
        const slots = await appointmentService.getAvailability(selectedDate, barberId, svcDuration);
        const occupied = new Set();
        slots.forEach(s => {
          if (!s.isAvailable) occupied.add(s.time);
        });
        setOccupiedSlots(occupied);
        // Si la hora seleccionada ya está ocupada, limpiarla
        if (selectedTime) {
          const matched = slots.find(s => {
            let [hh, mm] = s.time.split(':').map(Number);
            let ampm = hh >= 12 ? 'pm' : 'am';
            let hh12 = hh % 12 || 12;
            let str = `${hh12}:${mm.toString().padStart(2, '0')} ${ampm}`;
            return str === selectedTime;
          });
          if (matched && !matched.isAvailable) {
            setSelectedTime('');
          }
        }
      } catch (err) {
        console.error('Error cargando disponibilidad:', err);
      }
    };
    fetchAvailability();
  }, [selectedDate, selectedBarber, selectedService]);

  const weekDays = useMemo(() => buildWeekDays(weekBase), [weekBase]);

  function prevWeek() { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); }
  function nextWeek() { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); }

  function goStep(n) {
    setDir(n > step ? 1 : -1);
    setStep(n);
  }

  function handleContact(e) {
    setContact(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingError('Por favor selecciona una fecha y hora válidas en el paso 1.');
      setTimeout(() => setBookingError(null), 5000);
      return;
    }
    if (!contact.name || !contact.phone) {
      setBookingError('Por favor completa tu nombre y teléfono de contacto.');
      setTimeout(() => setBookingError(null), 5000);
      return;
    }

    const currentUser = AuthClient.getUser();
    if (!currentUser) {
      setBookingError('Debes iniciar sesión para agendar una cita.');
      setTimeout(() => setBookingError(null), 5000);
      return;
    }

    // Mapear el tiempo seleccionado al ID de horario real
    const selectedHorarioObj = realHorarios.find(h => {
        let hFormat = h.hora_inicio.toString().padStart(4, '0');
        let hh = parseInt(hFormat.slice(0, 2));
        let mm = hFormat.slice(2, 4);
        let ampm = hh >= 12 ? 'pm' : 'am';
        let hh12 = hh % 12 || 12;
        let timeStr = `${hh12}:${mm} ${ampm}`;
        return timeStr === selectedTime;
    });

    const idHorario = Number(selectedHorarioObj?.id_horarios || 1);
    const idBarbero = Number(selectedBarber?.id_usuario || selectedBarber?.id || 3);
    const idServicio = Number(selectedService?.id_servicio || selectedService?.id || 1);

    const formData = {
      fecha: `${selectedDate}T00:00:00.000Z`,
      observaciones: `Reserva a nombre de: ${contact.name} (${contact.phone}). ${contact.notes ? 'Notas: ' + contact.notes : ''}`,
      id_usuario: Number(currentUser.userId),
      id_empleado: idBarbero,
      id_estado_cita: 1, // Pendiente
      id_horarios: idHorario,
      id_servicio: idServicio,
      email_contacto: contact.email || undefined,
      nombre_contacto: contact.name || undefined
    };

    try {
      await appointmentService.create(formData);

      setBookingError(null);
      setConfirmed(true);
    } catch (error) {
      const msg = error.response?.data?.message || 'Hubo un error al agendar la cita. Por favor intenta de nuevo.';
      setBookingError(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(', ') : 'Error desconocido');
      setTimeout(() => setBookingError(null), 6000);
      console.error(error);
    }
  }

  const handleStep2Submit = () => {
    if (!selectedTime) {
      setBookingError('El servicio seleccionado se cruza con otra cita ya agendada para este barbero a la hora elegida. Por favor, regresa al paso 1 y selecciona otro horario.');
      setTimeout(() => setBookingError(null), 8000);
      return;
    }
    setBookingError(null);
    goStep(3);
  };

  function resetForm() {
    setStep(1); setDir(1); setSelectedDate(''); setSelectedTime('');
    setBarber(null); setService(null); setContact({ name: '', phone: '', email: '', notes: '' });
    setConfirmed(false);
  }

  // ── STEP GUARDS ──────────────────────────────────────
  const step1Ok = selectedDate && selectedTime;
  const step2Ok = selectedBarber && selectedService;

  // ── SIDEBAR DATA ──────────────────────────────────────
  const hasSummary = selectedService || selectedBarber || selectedDate;
  const months = [
    MONTH_NAMES[(weekBase.getMonth())],
    MONTH_NAMES[(weekBase.getMonth() + 1) % 12]
  ].filter((v, i, a) => a.indexOf(v) === i);

  // ── RENDER ────────────────────────────────────────────
  return (
    <AnimatedPage>
      <div className="fa-page">

        {/* HERO */}
        <div className="fa-hero">
          <motion.div
            className="fa-hero-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <Scissors size={30} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Agenda tu cita en <span>Elegant Cut</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            Reserva rápida · Sin esperas · Profesionales certificados
          </motion.p>
        </div>

        {/* STEPPER */}
        {!confirmed && (
          <div className="fa-stepper">
            {[
              { n: 1, label: 'Fecha y hora' },
              'line',
              { n: 2, label: 'Profesional' },
              'line',
              { n: 3, label: 'Datos de contacto' },
            ].map((item, i) => {
              if (item === 'line') {
                const filled = step > (i < 2 ? 1 : 2);
                return <div key={`line-${i}`} className={`fa-step-line ${filled ? 'active' : ''}`} />;
              }
              const s = item.n < step ? 'done' : item.n === step ? 'active' : '';
              return (
                <div key={`step-${item.n}`} className={`fa-step ${s}`}>
                  <div className="fa-step-circle">
                    {item.n < step ? <Check size={16} /> : item.n}
                  </div>
                  <div className="fa-step-label">{item.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUCCESS */}
        <AnimatePresence>
          {confirmed && (
            <motion.div
              className="fa-layout"
              style={{ gridTemplateColumns: '1fr' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="fa-panel fa-success">
                <div className="fa-success-icon">
                  <CheckCircle size={40} />
                </div>
                <h2>¡Cita confirmada!</h2>
                <p>Tu reserva ha sido registrada correctamente.</p>
                <div className="fa-success-details">
                  {selectedService && (
                    <div className="fa-success-detail-row">
                      <Scissors size={16} />
                      <span>Servicio: <strong>{selectedService.name || selectedService.nombre}</strong></span>
                    </div>
                  )}
                  {selectedBarber && (
                    <div className="fa-success-detail-row">
                      <User size={16} />
                      <span>Barbero: <strong>{selectedBarber.name || selectedBarber.prim_nombre} {selectedBarber.last || selectedBarber.apellido1 || ''}</strong></span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="fa-success-detail-row">
                      <Calendar size={16} />
                      <span>Fecha: <strong>{formatDateLong(selectedDate)}</strong></span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="fa-success-detail-row">
                      <Clock size={16} />
                      <span>Hora: <strong>{selectedTime}</strong></span>
                    </div>
                  )}
                  {contact.name && (
                    <div className="fa-success-detail-row">
                      <User size={16} />
                      <span>Cliente: <strong>{contact.name}</strong></span>
                    </div>
                  )}
                  {selectedService && (
                    <div className="fa-success-detail-row">
                      <CreditCard size={16} />
                      <span>Total: <strong>{priceFormat(selectedService.price || selectedService.precio || 0)}</strong></span>
                    </div>
                  )}
                </div>
                <button className="fa-btn-new" onClick={resetForm}>
                  <Calendar size={16} style={{ marginRight: 8 }} />
                  Agendar otra cita
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN LAYOUT */}
        {!confirmed && (
          <div className="fa-layout">

            {/* ═══════════ PANEL PRINCIPAL ═══════════ */}
            <div className="fa-panel">
              <AnimatePresence mode="wait" custom={direction}>

                {/* ── PASO 1: FECHA Y HORA ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div className="fa-panel-title">
                      <Calendar size={20} />
                      Selecciona fecha y hora de tu servicio
                    </div>

                    {/* Mes */}
                    <div className="fa-months">
                      {months.map(m => (
                        <button key={m} className="fa-month-btn active" style={{ cursor: 'default' }}>{m}</button>
                      ))}
                    </div>

                    {/* Semana */}
                    <div className="fa-week-nav">
                      <button onClick={prevWeek} title="Semana anterior">
                        <ChevronLeft size={16} />
                      </button>
                      <div className="fa-days">
                        {weekDays.map(d => {
                          const ds = formatDateStr(d);
                          const isPast = d < today;
                          const isSel = ds === selectedDate;
                          return (
                            <motion.div
                              key={ds}
                              className={`fa-day ${isSel ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                              onClick={() => !isPast && setSelectedDate(ds)}
                              whileTap={!isPast ? { scale: 0.92 } : {}}
                            >
                              <span className="fa-day-name">{DAY_NAMES[d.getDay()]}</span>
                              <span className="fa-day-num">{d.getDate()}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                      <button onClick={nextWeek} title="Semana siguiente">
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Slots de hora */}
                    <div className="fa-slots-section">
                      {Object.entries(TIME_SLOTS).map(([period, slots]) => (
                        <div key={period}>
                          <div className="fa-slots-label">
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </div>
                          <div className="fa-slots-grid">
                            {slots.map(slot => {
                              // Convertir "9:00 am" -> "09:00" para comparar con occupiedSlots
                              const parts = slot.match(/^(\d+):(\d+)\s*(am|pm)$/i);
                              let isOccupied = false;
                              if (parts) {
                                let hh = parseInt(parts[1]);
                                const mm = parts[2];
                                const ampm = parts[3].toLowerCase();
                                if (ampm === 'pm' && hh !== 12) hh += 12;
                                if (ampm === 'am' && hh === 12) hh = 0;
                                const key = `${hh.toString().padStart(2, '0')}:${mm}`;
                                isOccupied = occupiedSlots.has(key);
                              }
                              return (
                                <motion.button
                                  key={slot}
                                  className={`fa-slot ${selectedTime === slot ? 'selected' : ''} ${isOccupied ? 'disabled' : ''}`}
                                  onClick={() => !isOccupied && setSelectedTime(slot)}
                                  whileTap={!isOccupied ? { scale: 0.93 } : {}}
                                  disabled={isOccupied}
                                  style={isOccupied ? { opacity: 0.4, cursor: 'not-allowed', textDecoration: 'line-through' } : {}}
                                  title={isOccupied ? 'Este horario ya está reservado' : ''}
                                >
                                  {slot}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="fa-nav-btns">
                      <span />
                      <motion.button
                        className="fa-btn-next"
                        onClick={() => goStep(2)}
                        disabled={!step1Ok}
                        whileHover={step1Ok ? { scale: 1.03 } : {}}
                        whileTap={step1Ok ? { scale: 0.97 } : {}}
                      >
                        Continuar <ChevronRight size={17} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── PASO 2: BARBERO Y SERVICIO ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div className="fa-panel-title">
                      <User size={20} />
                      Elige tu profesional y servicio
                    </div>

                    {preselectedBarberOpt ? (
                      <>
                        <div className="fa-subsection">Profesional elegido</div>
                        <div className="fa-barbers-grid" style={{ gridTemplateColumns: '1fr' }}>
                           <div className="fa-barber-card selected" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'default', padding: '10px 15px', gap: '15px' }}>
                              <div className="fa-barber-avatar">{preselectedBarberOpt.emoji || preselectedBarberOpt.name?.charAt(0) || 'B'}</div>
                              <div style={{ flexGrow: 1, textAlign: 'left' }}>
                                <div className="fa-barber-name">{preselectedBarberOpt.name || preselectedBarberOpt.prim_nombre} {(preselectedBarberOpt.last || preselectedBarberOpt.apellido1 || '')}</div>
                                <div className="fa-barber-specialty">{preselectedBarberOpt.title || preselectedBarberOpt.specialty || preselectedBarberOpt.especialidad || 'Barbero Profesional'}</div>
                              </div>
                              <div className="fa-barber-check" style={{ position: 'relative', top: 'auto', right: 'auto' }}>
                                <Check size={16} />
                              </div>
                           </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="fa-subsection">Profesional</div>
                        <div className="fa-barbers-grid">
                          {listaBarberos.map(b => {
                            const bId = b.id || b.id_usuario;
                            const bName = b.name || b.prim_nombre;
                            const bLast = b.last || b.apellido1 || '';
                            const bSpecialty = b.specialty || b.especialidad || 'Barbero';
                            const bEmoji = b.emoji || (bName ? bName.charAt(0) : 'B');
                            const isSelected = selectedBarber?.id === bId || selectedBarber?.id_usuario === bId;

                            return (
                              <motion.div
                                key={bId}
                                className={`fa-barber-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setBarber(b)}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.96 }}
                              >
                                <div className="fa-barber-avatar">{bEmoji}</div>
                                <div className="fa-barber-name">{bName} {bLast}</div>
                                <div className="fa-barber-specialty">{bSpecialty}</div>
                                {isSelected && (
                                  <motion.div
                                    className="fa-barber-check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                  >
                                    <Check size={16} />
                                  </motion.div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    {prepickedServices.length > 0 ? (
                      <>
                        <div className="fa-subsection">Servicios elegidos</div>
                        <div className="fa-services-list" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
                          {prepickedServices.map((s, idx) => {
                            const sName = s.name || s.nombre;
                            const sPrice = s.price || s.precio || 0;
                            // Intentamos obtener la duración de features si es que viene del carrito 
                            let sDuration = s.duration || s.duracion || '30 min';
                            if (!s.duration && !s.duracion && s.features && s.features.length > 1) {
                                sDuration = s.features[1];
                            }

                            return (
                              <div key={idx} className="fa-service-card selected" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 15px', cursor: 'default', flexDirection: 'row' }}>
                                {s.image && (
                                  <img 
                                    src={getCloudinaryServiceUrl(s.image)} 
                                    alt={sName} 
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                                  />
                                )}
                                <div className="fa-service-info" style={{ flexGrow: 1 }}>
                                  <div className="fa-service-name" style={{ marginBottom: '4px' }}>{sName}</div>
                                  <div className="fa-service-duration">
                                    <Clock size={12} />{sDuration}
                                  </div>
                                </div>
                                <div className="fa-service-price" style={{ whiteSpace: 'nowrap' }}>{priceFormat(sPrice)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="fa-subsection">Servicio</div>
                        <div className="fa-services-list">
                          {listaServicios.map(s => {
                            const sId = s.id || s.id_servicio;
                            const sName = s.name || s.nombre;
                            const sPrice = s.price || s.precio || 0;
                            const sDuration = s.duration || s.duracion || 30;
                            const isSelected = selectedService?.id === sId || selectedService?.id_servicio === sId;

                            return (
                              <motion.div
                                key={sId}
                                className={`fa-service-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setService(s)}
                                whileTap={{ scale: 0.985 }}
                              >
                                <div className="fa-service-info">
                                  <div className="fa-service-name">{sName}</div>
                                  <div className="fa-service-duration">
                                    <Clock size={12} />{sDuration} min
                                  </div>
                                </div>
                                <div className="fa-service-price">{priceFormat(sPrice)}</div>
                                <div className="fa-service-radio">
                                  {isSelected && <div className="fa-service-radio-dot" />}
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    {bookingError && (
                      <div className="alert alert-danger" style={{ margin: '1rem 0', fontSize: '0.9rem' }}>
                        {bookingError}
                      </div>
                    )}

                    <div className="fa-nav-btns">
                      <button className="fa-btn-back" onClick={() => goStep(1)}>
                        <ChevronLeft size={17} /> Atrás
                      </button>
                      <motion.button
                        className="fa-btn-next"
                        onClick={handleStep2Submit}
                        disabled={!step2Ok}
                        whileHover={step2Ok ? { scale: 1.03 } : {}}
                        whileTap={step2Ok ? { scale: 0.97 } : {}}
                      >
                        Continuar <ChevronRight size={17} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── PASO 3: DATOS DE CONTACTO ── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div className="fa-panel-title">
                      <FileText size={20} />
                      Datos de contacto
                    </div>

                    <div className="fa-form-grid">
                      <div className="fa-form-group">
                        <label>Nombre completo <span>*</span></label>
                        <div className="fa-input-wrap">
                          <User size={15} />
                          <input
                            type="text" name="name" value={contact.name}
                            onChange={handleContact} placeholder="Juan Pérez"
                          />
                        </div>
                      </div>

                      <div className="fa-form-group">
                        <label>Teléfono <span>*</span></label>
                        <div className="fa-input-wrap">
                          <Phone size={15} />
                          <input
                            type="tel" name="phone" value={contact.phone}
                            onChange={handleContact} placeholder="310 123 4567"
                          />
                        </div>
                      </div>

                      <div className="fa-form-group full">
                        <label>Email (opcional)</label>
                        <div className="fa-input-wrap">
                          <Mail size={15} />
                          <input
                            type="email" name="email" value={contact.email}
                            onChange={handleContact} placeholder="tucorreo@ejemplo.com"
                          />
                        </div>
                      </div>

                      <div className="fa-form-group full">
                        <label>Notas o requerimientos</label>
                        <div className="fa-input-wrap">
                          <FileText size={15} style={{ top: 12, alignSelf: 'flex-start' }} />
                          <textarea
                            name="notes" value={contact.notes}
                            onChange={handleContact}
                            placeholder="Ej: preferencias de estilo, alergias a productos..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div className="fa-subsection" style={{ marginTop: 22 }}>Método de pago</div>
                    <div className="fa-payment-group">
                      {[
                        { key: 'efectivo', icon: '💵', title: 'Efectivo', sub: 'Paga en la barbería' },
                        { key: 'transferencia', icon: '📱', title: 'Transferencia', sub: 'Nequi · Bancolombia' },
                        { key: 'tarjeta', icon: '💳', title: 'Tarjeta', sub: 'Débito / Crédito' },
                      ].map(opt => (
                        <motion.div
                          key={opt.key}
                          className={`fa-pay-opt ${payMethod === opt.key ? 'active' : ''}`}
                          onClick={() => setPayMethod(opt.key)}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="fa-pay-icon">{opt.icon}</div>
                          <div>
                            <div className="fa-pay-title">{opt.title}</div>
                            <div className="fa-pay-sub">{opt.sub}</div>
                          </div>
                          {payMethod === opt.key && (
                            <motion.div
                              style={{ marginLeft: 'auto', color: '#F5A623' }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <Check size={18} />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {bookingError && (
                      <div className="alert alert-danger" style={{ margin: '0.75rem 0', fontSize: '0.9rem' }}>
                        {bookingError}
                      </div>
                    )}

                    <div className="fa-nav-btns">
                      <button className="fa-btn-back" onClick={() => goStep(2)}>
                        <ChevronLeft size={17} /> Atrás
                      </button>
                      <motion.button
                        className="fa-btn-next"
                        onClick={handleConfirm}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Check size={17} /> Confirmar cita
                      </motion.button>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#555', marginTop: 14 }}>
                      Al confirmar aceptas recibir recordatorios por WhatsApp o SMS
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ═══════════ SIDEBAR ═══════════ */}
            <aside className="fa-sidebar">

              {/* Resumen */}
              <div className="fa-summary-card">
                <div className="fa-summary-title">Información de tus servicios</div>

                <AnimatePresence>
                  {hasSummary ? (
                    <motion.div
                      key="summary-content"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {selectedService && (
                        <div className="fa-summary-item">
                          <div className="fa-summary-service-name">
                            <div className="check-icon">
                              <Check size={12} color="#fff" />
                            </div>
                            {(selectedService.name || selectedService.nombre || '').toUpperCase()}
                          </div>
                          <div className="fa-summary-price">{priceFormat(selectedService.price || selectedService.precio || 0)}</div>
                          {selectedDate && (
                            <div className="fa-summary-row">
                              <Calendar size={13} />
                              {formatDateLong(selectedDate)}
                            </div>
                          )}
                          {selectedTime && (
                            <div className="fa-summary-row">
                              <Clock size={13} />
                              {selectedTime}
                              {selectedService && ` a las ${selectedTime}`}
                            </div>
                          )}
                          {selectedBarber && (
                            <div className="fa-summary-row">
                              <User size={13} />
                              {selectedBarber.name || selectedBarber.prim_nombre} {selectedBarber.last || selectedBarber.apellido1 || ''}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Los demás datos si aún no hay servicio */}
                      {!selectedService && selectedDate && (
                        <div className="fa-summary-row" style={{ marginBottom: 6 }}>
                          <Calendar size={13} />{formatDateLong(selectedDate)}
                        </div>
                      )}
                      {!selectedService && selectedTime && (
                        <div className="fa-summary-row" style={{ marginBottom: 6 }}>
                          <Clock size={13} />{selectedTime}
                        </div>
                      )}
                      {!selectedService && selectedBarber && (
                        <div className="fa-summary-row" style={{ marginBottom: 6 }}>
                          <User size={13} />{selectedBarber.name || selectedBarber.prim_nombre} {selectedBarber.last || selectedBarber.apellido1 || ''}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="summary-empty"
                      className="fa-summary-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Calendar size={28} style={{ color: '#333', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                      Selecciona fecha y hora para ver el resumen
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info de contacto */}
              <div className="fa-info-card">
                <div className="fa-info-title">Elegant Cut</div>
                <div className="fa-info-row">
                  <Phone size={14} /> +57 310 123 4567
                </div>
                <div className="fa-info-row">
                  <Mail size={14} /> info@elegantcut.co
                </div>
                <div className="fa-info-row">
                  <MapPin size={14} /> Calle 123 #45-67, Bogotá
                </div>
              </div>

            </aside>
          </div>
        )}

      </div>
    </AnimatedPage>
  );
}

export default Form_agenda;