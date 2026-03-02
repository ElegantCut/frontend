import React, { useState, useEffect, useRef, useCallback } from "react"; // Estos son cajistas de memoria
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "../components/shared/AnimatedPage";
import { AnimatedContainer, AnimatedItem } from "../components/shared/AnimatedList";
import { servicesService } from '../lib/servicesService'; //Este es el que imprtamos con la lógica de conexión xd

function Servicios_caballero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("todos");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [loginAlertVisible, setLoginAlertVisible] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- CARRUSEL ESTILO XIAOMI ---
  const carouselSlidesCab = [
    {
      img: '/assets/images/servicios_caballeros/carrusel/barberia.png',
      title: 'ESTILO Y TRADICIÓN',
      subtitle: 'Técnicas clásicas con tendencias modernas'
    },
    {
      img: '/assets/images/servicios_caballeros/carrusel/servicios_general.png',
      title: 'SERVICIOS PREMIUM',
      subtitle: 'Cortes, barbas y tratamientos para el caballero moderno'
    },
    {
      img: '/assets/images/servicios_caballeros/carrusel/varios.png',
      title: 'AMBIENTE ÚNICO',
      subtitle: 'Diseñado para tu comodidad y relajación'
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef(null);
  const SLIDE_DURATION = 4000;

  const goToSlide = useCallback((index) => {
    setCurrentSlide((index + carouselSlidesCab.length) % carouselSlidesCab.length);
  }, [carouselSlidesCab.length]);

  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlidesCab.length);
    }, SLIDE_DURATION);
    return () => clearInterval(slideTimer.current);
  }, [currentSlide, carouselSlidesCab.length]);
  // --- FIN CARRUSEL ---

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setCargando(true);
        // Pedimos los datos al servicio
        const datosBrutos = await servicesService.getAllServices();

        // TRANSFORMACIÓN: Adaptamos los nombres de tu Base de Datos
        // a los nombres que usas en tu diseño (HTML/CSS)
        const serviciosLimpios = datosBrutos.map((s) => ({
          id: s.id_servicio,      // Como se llame en tu Prisma
          nombre: s.nom_servicio, // Como se llame en tu Prisma
          name: s.nom_servicio,   // Soporte para la interfaz gráfica
          precio: s.precio,
          price: s.precio,        // Soporte para la interfaz gráfica
          descripcion: s.descripcion || "Servicio premium",
          description: s.descripcion || "Servicio premium",
          category: s.categoria || "cortes",
          categoryLabel: s.categoria || "Corte",
          image: s.imagen || "/assets/images/servicios_caballeros/cortes/buzzz cut.png",
          features: s.caracteristicas ? JSON.parse(s.caracteristicas) : ["Servicio", "45 min"]
        }));

        setServicios(serviciosLimpios); // Guardamos la lista ya limpia
      } catch (error) {
        console.error("No se pudo conectar con el backend", error);
      } finally {
        setCargando(false); // Quitamos el mensaje de "Cargando..."
      }
    };

    obtenerDatos();
  }, []);
  //Cuando haces clic en un botón de filtro, llamas a:
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };
  //Acá se define la funcionalidad del carrito donde se agregan los servicios al carrito
  const addToCart = (service) => {
    setCart([...cart, service]);
    setIsCartOpen(true); //Abre el carrito cuando se agrega un servicio
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove)); //Elimina un servicio del carrito
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  }; //Abre o cierra el carrito

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  }; //Calcula el total del carrito

  const filteredServices = activeCategory === "todos"
    ? servicios
    : servicios.filter(service => service.category === activeCategory); //Filtra los servicios por categoría

  return (
    <AnimatedPage>
      <main>
        <div className={`menu-overlay ${isCartOpen ? 'active' : ''}`} id="overlay" onClick={() => setIsCartOpen(false)}></div>

        {/* ALERTA FLOTANTE DE LOGIN */}
        {loginAlertVisible && (
          <div
            className="alert alert-warning alert-dismissible fade show"
            role="alert"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              width: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <strong>¡Atención!</strong> Debes iniciar sesión o crear una cuenta para agendar una cita.
            <button type="button" className="btn-close" onClick={() => setLoginAlertVisible(false)}></button>
          </div>
        )}

        {/* CARRUSEL ESTILO XIAOMI */}
        <div className="xmi-carousel">
          <div className="xmi-carousel__track">
            {carouselSlidesCab.map((slide, i) => (
              <div
                key={i}
                className={`xmi-carousel__slide ${i === currentSlide ? 'active' : ''}`}
                aria-hidden={i !== currentSlide}
              >
                <img src={slide.img} alt={slide.title} />
                <div className="xmi-carousel__overlay">
                  <h2 className="xmi-carousel__title">{slide.title}</h2>
                  <p className="xmi-carousel__subtitle">{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Flechas */}
          <button
            className="xmi-carousel__btn xmi-carousel__btn--prev"
            onClick={() => goToSlide(currentSlide - 1)}
            aria-label="Anterior"
          >
            &#8249;
          </button>
          <button
            className="xmi-carousel__btn xmi-carousel__btn--next"
            onClick={() => goToSlide(currentSlide + 1)}
            aria-label="Siguiente"
          >
            &#8250;
          </button>

          {/* Indicadores tipo barra de progreso */}
          <div className="xmi-carousel__indicators">
            {carouselSlidesCab.map((_, i) => (
              <button
                key={i}
                className={`xmi-carousel__indicator ${i === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Slide ${i + 1}`}
              >
                {i === currentSlide && (
                  <span
                    className="xmi-carousel__indicator-fill"
                    style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* FILTRO DE DAMA Y CABALLERO */}
        <div className="seleccion-genero">
          <h2>Selecciona el tipo de servicios</h2>
          <div className="botones-genero">
            <Link to="/Servicios_dama" className="btn-dama">
              Damas
            </Link>
            <Link to="/Servicios_caballero" className="btn-caballero">
              Caballeros
            </Link>
          </div>
        </div>

        {/* Filtros de categorías */}
        <div className="category-menu">
          <button
            className={`category-btn ${activeCategory === 'todos' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('todos')}
          >
            Todos los Servicios
          </button>
          <button
            className={`category-btn ${activeCategory === 'cortes' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('cortes')}
          >
            Cortes de Cabello
          </button>
          <button
            className={`category-btn ${activeCategory === 'barba' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('barba')}
          >
            Barba y Afeitado
          </button>
          <button
            className={`category-btn ${activeCategory === 'otros' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('otros')}
          >
            Tratamientos Especiales
          </button>
        </div>

        {/* Área de servicios */}
        {/* --- PASO 4: Mostrar los datos en el HTML --- */}
        {/* Aquí es donde usamos la variable de estado (en este caso enviada por 'filteredServices') */}
        {/* para dibujar gráficamente tus tarjetas de diseño en la página. */}
        <AnimatedContainer className="services-grid">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <AnimatedItem key={service.id} className="service-card" data-category={service.category}>
                <div className="category-indicator">{service.categoryLabel}</div>
                <img
                  src={service.image}
                  alt={service.name}
                  className="service-image"
                />
                <div className="service-content">
                  {/* Aquí mostramos el nombre del servicio que viene de la base de datos */}
                  <h3 className="service-title">{service.name}</h3>
                  {/* Aquí mostramos el precio */}
                  <div className="service-price">${service.price.toLocaleString()}</div>
                  {/* Y aquí la descripción */}
                  <p className="service-description">
                    {service.description}
                  </p>
                  <div className="service-features">
                    {service.features.map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="service-button"
                    onClick={() => addToCart(service)} //Cuando haces clic en el botón de agregar al carrito, se agrega el servicio al carrito
                  >
                    Agregar al Carrito
                  </motion.button>
                </div>
              </AnimatedItem>
            ))}
          </AnimatePresence>
        </AnimatedContainer>

        {/* CARRITO - VISTA APARTE / MODAL */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              id="cart"
              className="active"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="cart-content">
                <div className="cart-header">
                  <span>Tu Carrito</span>
                  <i className="bi bi-x-lg close-cart" onClick={() => setIsCartOpen(false)}></i>
                </div>

                <AnimatePresence>
                  {alertVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="alert alert-danger text-center m-3"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      Tu carrito está vacío. Agrega servicios antes de agendar.
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="cart-items">
                  <AnimatedContainer>
                    {cart.length === 0 ? (
                      <AnimatedItem key="empty">
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                          <i className="bi bi-cart-x" style={{ fontSize: '3rem', marginBottom: '10px', display: 'block' }}></i>
                          <p>No has añadido servicios aún.</p>
                        </div>
                      </AnimatedItem>
                    ) : (
                      cart.map((item, index) => (
                        <AnimatedItem key={index} className="cart-item">
                          <div className="cart-item-info">
                            <img src={item.image} alt={item.name} className="cart-item-img" />
                            <div>
                              <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{item.name}</h4>
                              <p style={{ margin: 0, color: '#bc2041', fontWeight: 'bold' }}>
                                ${item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#bc2041' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(index)}
                            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.2rem' }}
                            title="Eliminar servicio"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </motion.button>
                        </AnimatedItem>
                      ))
                    )}
                  </AnimatedContainer>
                </div>

                <div className="cart-total">
                  <span>Total a Pagar:</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>

                <div style={{ padding: '0 30px 30px 30px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    id="agendarBtn"
                    onClick={() => {
                      if (cart.length === 0) {
                        setAlertVisible(true);
                        setTimeout(() => setAlertVisible(false), 3000);
                      } else if (!isAuthenticated) {
                        setLoginAlertVisible(true);
                        setTimeout(() => setLoginAlertVisible(false), 5000);
                      } else {
                        setIsCartOpen(false);
                        navigate('/Form_agenda');
                      }
                    }}
                  >
                    AGENDAR CITA AHORA
                  </motion.button>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Seguir viendo servicios
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTÓN FLOTANTE DEL CARRITO */}
        <motion.div
          id="cartToggle"
          onClick={toggleCart}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <i className="bi bi-cart-fill" style={{ fontSize: '1.5rem' }}></i>
          <span className="cart-count">{cart.length}</span>
        </motion.div>
      </main>
    </AnimatedPage>
  );
}

export default Servicios_caballero;
