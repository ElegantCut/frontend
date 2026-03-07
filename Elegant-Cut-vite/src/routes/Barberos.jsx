import React, { useState, useEffect } from 'react';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';
import { barberService } from '../lib/barberService';
import BarberPortfolioModal from './BarberPortfolioModal';

function Barberos() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);

  const handleOpenPortfolio = (barber) => {
    setSelectedBarber(barber);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        // Obtenemos los barberos base y los portafolios nuevos en paralelo
        const [data, portfolios] = await Promise.all([
          barberService.getAllBarbers(),
          barberService.getAllPortfolios()
        ]);

        if (data) {
          const transformedBarbers = data.map((realBarber) => {
            // Buscamos si el barbero tiene un portafolio registrado en la tabla portabarbero
            // Matchamos convirtiendo a String por seguridad del tipo de dato
            const portfolio = portfolios.find(p =>
              String(p.id_usuario) === String(realBarber.id_usuario) ||
              String(p.barbero_id) === String(realBarber.id_usuario) // asumiendo posibles nombres para la FK
            );
            return {
              id: realBarber.id_usuario,
              name: `${realBarber.prim_nombre} ${realBarber.apellido1}`,
              title: "Barbero Profesional",
              experience: portfolio?.experiencia || "Experto",
              rating: portfolio?.calificacion ? String(portfolio.calificacion) : "5.0",
              bio: portfolio?.biografia || "Barbero profesional del equipo Elegant Cut...",
              stats: {
                clients: portfolio?.reseñas_count ? `+${portfolio.reseñas_count * 10}` : "+1000",
                recommend: "100%"
              },
              categories: ["classic", "modern"],
              specialties: (() => {
                try {
                  // MySQL JSON return stringified array or real array depending on the db driver
                  const specs = typeof portfolio?.especialidades === 'string'
                    ? JSON.parse(portfolio.especialidades)
                    : portfolio?.especialidades;

                  return Array.isArray(specs) && specs.length > 0 ? specs : ["Corte Clásico", "Barba"];
                } catch (e) {
                  return ["Corte Clásico", "Barba"];
                }
              })(),
              badge: "expert",
              image: realBarber.foto_perfil || null, // Se mantiene foto_perfil del usuario base
              portfolioData: portfolio || null
            };
          });

          setBarbers(transformedBarbers);
        } else {
          setError('Error al cargar los barberos');
        }
      } catch (err) {
        console.error("Error fetching barbers:", err);
        // Mejor manejo de errores para que no esté hardcodeado al puerto 3001 siempre.
        setError(err.message === 'Network Error' ? 'Error de red: Verifica que el servidor (puerto 3001) esté corriendo y permita CORS.' : 'Error al cargar los datos del servidor');
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
            src={`https://res.cloudinary.com/dbuldg4dt/image/upload/c_fill,g_face,h_400,w_400/${barber.image}`}
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
          <button className="btn-primary" onClick={() => handleOpenPortfolio(barber)}>Ver Portafolio</button>
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

      {/* Portfolio Modal Integration */}
      {selectedBarber && (
        <BarberPortfolioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          barberId={selectedBarber.id}
          barberName={selectedBarber.name}
          barberImage={selectedBarber.image}
          barberTitle={selectedBarber.title}
          portfolioDataProp={selectedBarber.portfolioData}
        />
      )}
    </AnimatedPage>
  )
}

export default Barberos;