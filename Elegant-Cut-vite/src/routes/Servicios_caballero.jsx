import React, { useState } from "react"; // Estos son cajistas de memoria
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "../components/shared/AnimatedPage";
import { AnimatedContainer, AnimatedItem } from "../components/shared/AnimatedList";

function Servicios_caballero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("todos"); //esto guarda qué categoría esta sellecionada
  const [cart, setCart] = useState([]);// acá se guardan todos los servicios que se van agregando al carrito; el "=useState ([]), significa que ese carrito está vacío"
  const [isCartOpen, setIsCartOpen] = useState(false);// acá se controla si el carrito está abierto o cerrado
  const [alertVisible, setAlertVisible] = useState(false);
  const [loginAlertVisible, setLoginAlertVisible] = useState(false);

  const servicesData = [
    {
      id: 1,
      name: "Buzz Cut",
      price: 25000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/buzzz cut.png",
      description: "Un corte limpio, rápido y versátil. Ideal para quienes buscan un look moderno y sin complicaciones.",
      features: ["Máquina", "45 min"],
      categoryLabel: "Corte"
    },
    {
      id: 2,
      name: "Corte Militar (Bascot)",
      price: 28000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/Corte Militar (Bascot).png",
      description: "Estilo clásico y disciplinado, con laterales muy cortos y parte superior ligeramente más larga.",
      features: ["Tijera/Máquina", "45 min"],
      categoryLabel: "Corte"
    },
    {
      id: 3,
      name: "Mullet",
      price: 35000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/Mullet.png",
      description: "Un estilo audaz y retro, corto adelante y largo atrás. Para quienes quieren destacar.",
      features: ["Estilo", "60 min"],
      categoryLabel: "Corte"
    },
    {
      id: 4,
      name: "Slick Back",
      price: 32000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/Slick Back.png",
      description: "Elegancia pura. Cabello peinado hacia atrás con un acabado pulido y sofisticado.",
      features: ["Clásico", "50 min"],
      categoryLabel: "Corte"
    },
    {
      id: 5,
      name: "Corte con Figuras",
      price: 40000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/corte con figuras.png",
      description: "Arte en tu cabello. Diseños personalizados y creativos para un look único.",
      features: ["Diseño", "60+ min"],
      categoryLabel: "Corte"
    },
    {
      id: 6,
      name: "Crop Top",
      price: 30000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/crop top.png",
      description: "Texturizado en la parte superior con flequillo corto. Moderno y fácil de peinar.",
      features: ["Textura", "50 min"],
      categoryLabel: "Corte"
    },
    {
      id: 7,
      name: "Low Fade",
      price: 30000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/low fade.png",
      description: "Degradado suave y bajo que conecta perfectamente con la barba o patillas.",
      features: ["Degradado", "50 min"],
      categoryLabel: "Corte"
    },
    {
      id: 8,
      name: "Undercut",
      price: 32000,
      category: "cortes",
      image: "/assets/images/servicios_caballeros/cortes/undercut.png",
      description: "Contraste marcado entre laterales rapados y volumen superior. Versátil y actual.",
      features: ["Contraste", "50 min"],
      categoryLabel: "Corte"
    }
  ];

  const additionalServices = [
    // BARBA
    {
      id: 9,
      name: "Perfilado de Barba",
      price: 15000,
      category: "barba",
      image: "/assets/images/servicios_caballeros/barba/perfilado de barba.png",
      description: "Definición de contornos para una barba prolija y elegante.",
      features: ["Navaja", "20 min"],
      categoryLabel: "Barba"
    },
    {
      id: 10,
      name: "Afeitado Tradicional",
      price: 25000,
      category: "barba",
      image: "/assets/images/servicios_caballeros/barba/afeitado tradicional.png",
      description: "Experiencia clásica con toalla caliente y navaja.",
      features: ["Toalla Caliente", "30 min"],
      categoryLabel: "Barba"
    },
    {
      id: 11,
      name: "Barba Express",
      price: 12000,
      category: "barba",
      image: "/assets/images/servicios_caballeros/barba/barba express.png",
      description: "Arreglo rápido con máquina para mantener el largo ideal.",
      features: ["Máquina", "15 min"],
      categoryLabel: "Barba"
    },
    {
      id: 12,
      name: "Tinturación de Barba",
      price: 25000,
      category: "barba",
      image: "/assets/images/servicios_caballeros/barba/baraba tinturacion .png",
      description: "Cubre canas o unifica el tono de tu barba.",
      features: ["Color", "40 min"],
      categoryLabel: "Barba"
    },
    {
      id: 13,
      name: "Tratamiento de Barba",
      price: 20000,
      category: "barba",
      image: "/assets/images/servicios_caballeros/barba/barba tratamiento .png",
      description: "Hidratación profunda para una barba suave y manejable.",
      features: ["Hidratación", "25 min"],
      categoryLabel: "Barba"
    },
    {
      id: 14,
      name: "Depilación con Cera",
      price: 15000,
      category: "barba",
      image: "/assets/images/servicios_caballeros/barba/depilacion con cera.png",
      description: "Eliminación de vello en pómulos, nariz u orejas.",
      features: ["Cera", "15 min"],
      categoryLabel: "Barba"
    },
    // OTROS SERVICIOS
    {
      id: 15,
      name: "Mascarilla Facial",
      price: 25000,
      category: "otros",
      image: "/assets/images/servicios_caballeros/otros_servicios/mascarilla.png",
      description: "Limpieza e hidratación para revitalizar tu rostro.",
      features: ["Limpieza", "30 min"],
      categoryLabel: "Tratamiento"
    },
    {
      id: 16,
      name: "Keratina Capilar",
      price: 60000,
      category: "otros",
      image: "/assets/images/servicios_caballeros/otros_servicios/keratina capilar.png",
      description: "Alisado y restauración profunda del cabello.",
      features: ["Alisado", "90 min"],
      categoryLabel: "Tratamiento"
    },
    {
      id: 17,
      name: "Tinturación Capilar",
      price: 45000,
      category: "otros",
      image: "/assets/images/servicios_caballeros/otros_servicios/tinturacion.png",
      description: "Cambio de look o cobertura de canas con productos premium.",
      features: ["Color", "60 min"],
      categoryLabel: "Tratamiento"
    },
    {
      id: 18,
      name: "Depilación Facial",
      price: 20000,
      category: "otros",
      image: "/assets/images/servicios_caballeros/otros_servicios/depilacion.png",
      description: "Depilación de cejas y rostro para una mirada limpia.",
      features: ["Cera/Hilo", "20 min"],
      categoryLabel: "Tratamiento"
    },
    {
      id: 19,
      name: "Diseño de Figuras",
      price: 15000,
      category: "otros",
      image: "/assets/images/servicios_caballeros/otros_servicios/figuras.png",
      description: "Diseños artísticos y tribales en tu corte.",
      features: ["Arte", "30 min"],
      categoryLabel: "Diseño"
    }
  ];

  // Combine existing and new services
  servicesData.push(...additionalServices);
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
    ? servicesData
    : servicesData.filter(service => service.category === activeCategory); //Filtra los servicios por categoría

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

        {/* CARRUSEL */}
        <div className="carousel-container">
          <div
            id="carouselAuto"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="3000"
          >
            <div className="carousel-inner">
              {/* Imagen 1 */}
              <div className="carousel-item active">
                <img
                  src="/assets/images/servicios_caballeros/carrusel/barberia.png"
                  className="d-block w-100"
                  alt="Barbería ElegantCut"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h3>ESTILO Y TRADICIÓN</h3>
                  <p>
                    Descubre la experiencia de barbería que combina técnicas
                    clásicas con tendencias modernas
                  </p>
                </div>
              </div>

              {/* Imagen 2 */}
              <div className="carousel-item">
                <img
                  src="/assets/images/servicios_caballeros/carrusel/servicios_general.png"
                  className="d-block w-100"
                  alt="Nuestros Servicios"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h3>SERVICIOS PREMIUM</h3>
                  <p>
                    Cortes, barbas y tratamientos especializados para el
                    caballero moderno
                  </p>
                </div>
              </div>

              {/* Imagen 3 */}
              <div className="carousel-item">
                <img
                  src="/assets/images/servicios_caballeros/carrusel/varios.png"
                  className="d-block w-100"
                  alt="Ambiente ElegantCut"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h3>AMBIENTE ÚNICO</h3>
                  <p>
                    Disfruta de un espacio diseñado para tu comodidad y
                    relajación
                  </p>
                </div>
              </div>
            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselAuto"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselAuto"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
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
                  <h3 className="service-title">{service.name}</h3>
                  <div className="service-price">${service.price.toLocaleString()}</div>
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
