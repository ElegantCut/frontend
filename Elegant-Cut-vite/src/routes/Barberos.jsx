import React, { useState, useEffect } from 'react';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';
import { barberService } from '../lib/barberService';
import { getCloudinaryUrl } from '../lib/utils/imageHelper';

function Barberos() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        // 1. CAMBIO: Usamos el servicio (el "mesero")
        const data = await barberService.getAllBarbers();

        // 2. CAMBIO: Verificamos si 'data' existe (Axios ya te da el contenido directo)
        if (data) {
          // 3. CAMBIO: Ahora usamos 'data.map' en lugar de 'result.data.map'
          const transformedBarbers = data.map((realBarber) => ({
            id: realBarber.id_usuario,
            name: `${realBarber.prim_nombre} ${realBarber.apellido1}`,
            title: "Barbero Profesional",
            experience: "Experto",
            rating: "5.0",
            bio: "Barbero profesional del equipo Elegant Cut...",
            stats: { clients: "+1000", recommend: "100%" },
            categories: ["classic", "modern"],
            specialties: ["Corte Clásico", "Barba"],
            badge: "expert",
            image: realBarber.foto_perfil || null
          }));

          setBarbers(transformedBarbers);
        } else {
          setError('Error al cargar los barberos');
        }
      } catch (err) {
        console.error("Error fetching barbers:", err);
        setError('Error de conexión con el servidor en el puerto 3001');
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
        {barber.image && !barber.image.includes('default.png') ? (
          <img
            src={getCloudinaryUrl(barber.image)}
            alt={`${barber.name} - ${barber.title}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : null}
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