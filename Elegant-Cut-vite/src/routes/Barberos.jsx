import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/shared/AnimatedPage';
import { AnimatedContainer, AnimatedItem } from '../components/shared/AnimatedList';
import { barberService } from '../lib/barberService';
import { getCloudinaryUrl } from '../lib/utils/imageHelper';
import BarberPortfolioModal from './BarberPortfolioModal';
import { TravelCard } from '../components/ui/card-7';

function Barberos() {
  const navigate = useNavigate();
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
        const [data] = await Promise.all([
          barberService.getAllBarbers()
        ]);
        
        if (data) {
          const transformedBarbers = data.map((realBarber) => {
            // Buscamos si el barbero tiene un portafolio registrado en la tabla portabarbero
            // Manejamos si portafolios viene como array (1:N) o como objeto directo (1:1) según Prisma
            const portfolio = Array.isArray(realBarber.portafolios) ? realBarber.portafolios[0] : realBarber.portafolios;
            return {
              id: realBarber.id_usuario,
              name: `${realBarber.prim_nombre} ${realBarber.apellido1}`,
              title: "Barbero Profesional",
              experience: portfolio?.experiencia || "Experto",
              rating: realBarber.calificacion_promedio !== undefined ? String(realBarber.calificacion_promedio) : (portfolio?.calificacion ? String(portfolio.calificacion) : "5.0"),
              bio: portfolio?.biografia || "Barbero profesional del equipo Elegant Cut...",
              stats: {
                clients: realBarber.total_resenas !== undefined ? String(realBarber.total_resenas) : (portfolio?.rese_as_count !== undefined ? String(portfolio.rese_as_count) : "0"),
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
            src={getCloudinaryUrl(barber.image)}
            alt={`${barber.name} - ${barber.title}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="barber-image-fallback" style={{ display: (!barber.image || barber.image.includes('default.png')) ? 'flex' : 'none' }}>
            <i className="bi bi-person-fill"></i>
        </div>
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
            {[...Array(5)].map((_, i) => {
              const rating = parseFloat(barber.rating);
              if (rating >= i + 1) return <i key={i} className="bi bi-star-fill"></i>;
              if (rating >= i + 0.5) return <i key={i} className="bi bi-star-half"></i>;
              return <i key={i} className="bi bi-star"></i>;
            })}
            <span>{barber.rating}</span>
          </div>
        </div>
        <p className="barber-bio">{barber.bio}</p>
        <div className="barber-stats">
          <div className="stat">
            <strong>{barber.stats.clients}</strong>
            <span>Reseñas</span>
          </div>
          <div className="stat">
            <strong>{barber.stats.recommend}</strong>
            <span>Recomiendan</span>
          </div>
        </div>
        <div className="barber-actions">
          <button className="btn-primary" onClick={() => handleOpenPortfolio(barber)}>
            <i className="bi bi-folder2-open"></i> Portafolio
          </button>
          <button className="btn-secondary" onClick={() => navigate('/Form_agenda', { state: { preselectedBarber: barber } })}>
            <i className="bi bi-calendar-check"></i> Reservar
          </button>
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
          fullBarberData={selectedBarber}
        />
      )}
    </AnimatedPage>
  )
}

export default Barberos;