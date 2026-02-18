import React, { useState, useEffect } from 'react';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';

function Barberos() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Plantillas de datos enriquecidos (para UI)
  // Fetch de barberos desde el backend
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/barbers');
        const result = await response.json();

        if (result.success) {
          // Transformar datos reales a estructura de UI
          const transformedBarbers = result.data.map((realBarber) => ({
            id: realBarber.id_usuario,
            name: `${realBarber.prim_nombre} ${realBarber.apellido1}`, // Nombre real de la BD
            title: "Barbero Profesional", // Default
            experience: "Experto", // Default
            rating: "5.0", // Default
            bio: "Barbero profesional del equipo Elegant Cut, dedicado a ofrecer la mejor experiencia y estilo a nuestros clientes.", // Default
            stats: { clients: "+1000", recommend: "100%" }, // Default
            categories: ["classic", "modern"], // Default categories for filtering
            specialties: ["Corte Clásico", "Barba"], // Default
            badge: "expert", // Default tag
            image: realBarber.foto_perfil || null // Use DB photo or null (render logic handles fallback) 
          }));
          setBarbers(transformedBarbers);
        } else {
          setError('Error al cargar los barberos');
        }
      } catch (err) {
        console.error("Error fetching barbers:", err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  // Filtros disponibles
  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'classic', label: 'Cortes Clásicos' },
    { key: 'modern', label: 'Estilos Modernos' },
    { key: 'beard', label: 'Especialista en Barbas' },
    { key: 'fade', label: 'Degradados Expertos' },
    { key: 'senior', label: 'Barberos Senior' }
  ];

  // Filtrar barberos
  const filteredBarbers = barbers.filter(barber =>
    activeFilter === 'all' || barber.categories.includes(activeFilter)
  );

  // Manejar cambio de filtro
  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
  };

  if (loading) return <div className="text-center p-5">Cargando profesionales...</div>;
  if (error) return <div className="text-center p-5 text-danger">{error}</div>;

  // Renderizar barberos
  const renderBarberCard = (barber) => (
    <AnimatedItem
      key={barber.id}
      className="barber-card"
      data-category={barber.categories.join(' ')}
    >
      <div className="barber-header">
        <div className={`barber-badge ${barber.badge}`}>
          {barber.badge === 'senior' && 'Senior'}
          {barber.badge === 'trending' && 'Trending'}
          {barber.badge === 'popular' && 'Popular'}
          {barber.badge === 'new' && 'Nuevo'}
          {barber.badge === 'expert' && 'Experto'}
        </div>
        <div className="barber-experience">{barber.experience}</div>
      </div>
      <div className="barber-image">
        <img
          src={`/assets/images/barberos/${barber.image}`}
          alt={`${barber.name} - ${barber.title}`}
        />
        <div className="barber-overlay">
          <div className="specialties">
            {barber.specialties.map((specialty, index) => (
              <span key={index} className="specialty-tag">{specialty}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="barber-info">
        <h3 className="barber-name">{barber.name}</h3>
        <p className="barber-title">{barber.title}</p>
        <div className="barber-rating">
          <div className="stars">
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-fill"></i>
            <i className="bi bi-star-fill"></i>
            <span>{barber.rating}</span>
          </div>
        </div>
        <p className="barber-bio">{barber.bio}</p>
        <div className="barber-stats">
          <div className="stat">
            <strong>{barber.stats.clients}</strong>
            <span>Clientes</span>
          </div>
          <div className="stat">
            <strong>{barber.stats.recommend}</strong>
            <span>Recomiendan</span>
          </div>
        </div>
        <div className="barber-actions">
          <button className="btn-primary">Ver Portafolio</button>
          <button className="btn-secondary">Reservar Cita</button>
        </div>
      </div>
    </AnimatedItem>
  );

  return (
    <AnimatedPage>
      <div>
        <main>
          {/* ... existing sections ... */}
          <section className="barbers-section">
            <div className="container">
              <AnimatedContainer className="barbers-grid" id="barbers-container">
                {filteredBarbers.map(renderBarberCard)}
              </AnimatedContainer>
            </div>
          </section>
          {/* ... existing CTA ... */}
        </main>
      </div>
    </AnimatedPage>
  )
}

export default Barberos;