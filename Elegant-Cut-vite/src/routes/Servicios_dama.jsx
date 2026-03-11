
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthClient } from '../auth/authClient';
import { useAuth } from '../auth/UseAuth';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from "../components/shared/AnimatedPage";
import { AnimatedContainer, AnimatedItem } from "../components/shared/AnimatedList";
import { getCloudinaryBannerUrl } from '../lib/utils/imageHelper';

function Servicios_dama() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false); // Alerta de carrito vacío (dentro del modal)
    const [loginAlertVisible, setLoginAlertVisible] = useState(false); // Alerta de login (flotante)
    const [activeCategory, setActiveCategory] = useState('uñas');

    // --- CARRUSEL ESTILO XIAOMI ---
    const carouselSlidesDama = [
        {
            img: getCloudinaryBannerUrl('Carrusel1_olqz0t.jpg'),
            title: 'BELLEZA Y ELEGANCIA',
            subtitle: 'Descubre tu mejor versión con nuestros expertos'
        },
        {
            img: getCloudinaryBannerUrl('Carrusel2_txzezq.jpg'),
            title: 'CUIDADO INTEGRAL',
            subtitle: 'Tratamientos exclusivos para tu cabello y piel'
        },
        {
            img: getCloudinaryBannerUrl('Carrusel3_nzt3iw.jpg'),
            title: 'TENDENCIAS ACTUALES',
            subtitle: 'Lo último en cortes y coloración'
        },
        {
            img: getCloudinaryBannerUrl('Carrusel4_rkib7p.jpg'),
            title: 'ESTILO ÚNICO',
            subtitle: 'Cada detalle pensado para ti'
        },
        {
            img: getCloudinaryBannerUrl('Carrusel5_x5y09w.jpg'),
            title: 'TRANSFORMA TU LOOK',
            subtitle: 'Arte y precisión en cada servicio'
        },
        {
            img: getCloudinaryBannerUrl('Carrusel6_sdzzfp.jpg'),
            title: 'EXPERIENCIA TOTAL',
            subtitle: 'Un espacio diseñado para tu bienestar'
        },
    ];
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideTimer = useRef(null);
    const SLIDE_DURATION = 4000;

    const goToSlide = useCallback((index) => {
        setCurrentSlide((index + carouselSlidesDama.length) % carouselSlidesDama.length);
    }, [carouselSlidesDama.length]);

    useEffect(() => {
        slideTimer.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % carouselSlidesDama.length);
        }, SLIDE_DURATION);
        return () => clearInterval(slideTimer.current);
    }, [currentSlide, carouselSlidesDama.length]);
    // --- FIN CARRUSEL ---

    // Calcular total y cantidad
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    // Agregar producto al carrito
    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.name === product.name);

            if (existingItem) {
                return prevItems.map(item =>
                    item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...product, quantity: 1 }]; // Agregamos todo el producto (incluyendo imagen)
            }
        });
        setCartOpen(true);
    };

    // Eliminar producto del carrito
    const removeFromCart = (name) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.name === name);

            if (existingItem && existingItem.quantity > 1) {
                return prevItems.map(item =>
                    item.name === name ? { ...item, quantity: item.quantity - 1 } : item
                );
            } else {
                return prevItems.filter(item => item.name !== name);
            }
        });
    };

    // Filtrar productos por categoría
    const filterByCategory = (category) => {
        setActiveCategory(category);
    };

    // Categorías disponibles
    const categories = [
        { id: 'uñas', name: 'Uñas' },
        { id: 'largo', name: 'Cortes Cabello Largo' },
        { id: 'corto', name: 'Cortes Cabello Corto' },
        { id: 'tinte', name: 'Color / Tintes' },
        { id: 'peinados', name: 'Peinados' },
        { id: 'mascarillas', name: 'Mascarillas' }
    ];

    // Productos disponibles
    const products = [
        // Uñas
        {
            category: 'uñas',
            name: 'Uñas sin diseño',
            price: 10000,
            image: '/assets/images/servicios_dama/Uñas/ManicureSinDiseño.png',
            oldPrice: 12000,
            description: 'Manicure básico sin Diseño',
            features: ['Limpieza', 'Esmalte', '30 min'],
            categoryLabel: 'Uñas'
        },
        {
            category: 'uñas',
            name: 'Manicure Básico con color',
            price: 11000,
            image: '/assets/images/servicios_dama/Uñas/ManicureConColor.png',
            oldPrice: 13000,
            description: 'Manicure Básico con Color',
            features: ['Limpieza', 'Color', '35 min'],
            categoryLabel: 'Uñas'
        },
        {
            category: 'uñas',
            name: 'Uñas con diseño sencillo',
            price: 15000,
            image: '/assets/images/servicios_dama/Uñas/ManicureConDiseño.png',
            oldPrice: 18000,
            description: 'Uñas Básicas con diseño sencillo',
            features: ['Diseño', 'Arte', '45 min'],
            categoryLabel: 'Uñas'
        },
        {
            category: 'uñas',
            name: 'Uñas acrílicas básicas',
            price: 25000,
            image: '/assets/images/servicios_dama/Uñas/UñasAcrilicasMedio.png',
            oldPrice: 35000,
            description: 'Uñas acrílicas básicas',
            features: ['Acrílico', 'Duración', '90 min'],
            categoryLabel: 'Uñas'
        },
        {
            category: 'uñas',
            name: 'Manicure Largas',
            price: 40000,
            image: '/assets/images/servicios_dama/Uñas/Uñas AcrilicasLargas.png',
            oldPrice: 45000,
            description: 'Uñas acrílicas largas',
            features: ['Extensión', 'Estilo', '120 min'],
            categoryLabel: 'Uñas'
        },
        // Cortes Largo
        {
            category: 'largo',
            name: 'Corte Mariposa',
            price: 18000,
            image: '/assets/images/servicios_dama/Corte Largo/corte_mariposa.png',
            oldPrice: 22000,
            description: 'Corte en capas estilo Mariposa',
            features: ['Volumen', 'Capas', '60 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'largo',
            name: 'Corte Recto',
            price: 15000,
            image: '/assets/images/servicios_dama/Corte Largo/corte_recto.png',
            oldPrice: 18000,
            description: 'Corte recto clásico para puntas sanas',
            features: ['Puntas', 'Sano', '45 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'largo',
            name: 'Corte en V',
            price: 16000,
            image: '/assets/images/servicios_dama/Corte Largo/corte_v.png',
            oldPrice: 20000,
            description: 'Corte en V para dar movimiento',
            features: ['Movimiento', 'Estilo', '50 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'largo',
            name: 'Corte en Capas',
            price: 17000,
            image: '/assets/images/servicios_dama/Corte Largo/corte_capas.png',
            oldPrice: 21000,
            description: 'Corte en capas para dar movimiento',
            features: ['Movimiento', 'Estilo', '55 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'largo',
            name: 'Desfilado',
            price: 17000,
            image: '/assets/images/servicios_dama/Corte Largo/corte_desfilado.png',
            oldPrice: 21000,
            description: 'Corte desfilado para dar movimiento',
            features: ['Movimiento', 'Estilo', '55 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'largo',
            name: 'corte con Flequillo',
            price: 17000,
            image: '/assets/images/servicios_dama/Corte Largo/corte_flequillo.png',
            oldPrice: 21000,
            description: 'Corte con Flequillo para dar movimiento',
            features: ['Movimiento', 'Estilo', '55 min'],
            categoryLabel: 'Corte'
        },
        // Cortes Corto
        {
            category: 'corto',
            name: 'Bob Clásico',
            price: 20000,
            image: '/assets/images/servicios_dama/Corte Corto/Bob Clasico.png',
            oldPrice: 25000,
            description: 'Estilo Bob elegante y atemporal',
            features: ['Elegancia', 'Corto', '50 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Pixie Cut',
            price: 22000,
            image: '/assets/images/servicios_dama/Corte Corto/Pixie.png',
            oldPrice: 28000,
            description: 'Estilo Pixie moderno y audaz',
            features: ['Audaz', 'Moderno', '45 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Bob Capas Cortas',
            price: 20000,
            image: '/assets/images/servicios_dama/Corte Corto/bob_capas_cortas.png',
            oldPrice: 25000,
            description: 'Estilo Bob elegante y atemporal',
            features: ['Elegancia', 'Corto', '50 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Bixie Cut',
            price: 22000,
            image: '/assets/images/servicios_dama/Corte Corto/bixie_cut.png',
            oldPrice: 26000,
            description: 'Fusión moderna entre Bob y Pixie',
            features: ['Textura', 'Híbrido', '50 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Bob Asimétrico',
            price: 21000,
            image: '/assets/images/servicios_dama/Corte Corto/bob_asimétrico.png',
            oldPrice: 25000,
            description: 'Bob con longitudes desiguales',
            features: ['Moderno', 'Atrevido', '50 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Bob Invertido',
            price: 21000,
            image: '/assets/images/servicios_dama/Corte Corto/bob_invertido.png',
            oldPrice: 25000,
            description: 'Más corto atrás, largo adelante',
            features: ['Volumen', 'Estilo', '55 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Corte Garçon',
            price: 19000,
            image: '/assets/images/servicios_dama/Corte Corto/corte_garçon.png',
            oldPrice: 23000,
            description: 'Estilo clásico a lo chico',
            features: ['Clásico', 'Práctico', '45 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Micro Bob',
            price: 20000,
            image: '/assets/images/servicios_dama/Corte Corto/micro_bob.png',
            oldPrice: 24000,
            description: 'Versión ultra corta del Bob',
            features: ['Chic', 'Minimalista', '45 min'],
            categoryLabel: 'Corte'
        },
        {
            category: 'corto',
            name: 'Pixie Largo',
            price: 23000,
            image: '/assets/images/servicios_dama/Corte Corto/pixie_largo.png',
            oldPrice: 27000,
            description: 'Pixie con capas más largas',
            features: ['Versátil', 'Textura', '50 min'],
            categoryLabel: 'Corte'
        },
        // Peinados
        {
            category: 'peinados',
            name: 'Peinado Especial',
            price: 25000,
            image: '/assets/images/servicios_dama/Peinados/peinado_especial.png',
            oldPrice: 30000,
            description: 'Peinado para ocasiones especiales',
            features: ['Fiesta', 'Elegante', '60 min'],
            categoryLabel: 'Peinados'
        },
        // Mascarillas
        {
            category: 'mascarillas',
            name: 'Hidratación Profunda',
            price: 35000,
            image: '/assets/images/servicios_dama/Corte Largo/Corte Recto.png',
            oldPrice: 45000,
            description: 'Mascarilla capilar restauradora',
            features: ['Hidratación', 'Brillo', '40 min'],
            categoryLabel: 'Tratamiento'
        },
        // Tintes
        {
            category: 'tinte',
            name: 'Tinte Completo',
            price: 60000,
            image: '/assets/images/servicios_dama/Corte Largo/Corte v.png',
            oldPrice: 75000,
            description: 'Aplicación de tinte completo',
            features: ['Color', 'Cambio', '120 min'],
            categoryLabel: 'Color'
        }
    ];

    // Filtrar productos por categoría activa
    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(product => product.category === activeCategory);

    return (
        <AnimatedPage>
            <main>
                <div className={`menu - overlay ${cartOpen ? 'active' : ''} `} id="overlay" onClick={() => setCartOpen(false)}></div>

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
                        {carouselSlidesDama.map((slide, i) => (
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
                        {carouselSlidesDama.map((_, i) => (
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
                        <Link to="/Servicios_dama" className="btn-dama">Damas</Link>
                        <Link to="/Servicios_caballero" className="btn-caballero">Caballeros</Link>
                    </div>
                </div>

                {/* MENÚ DE CATEGORÍAS */}
                <div className="category-menu">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            data-category={category.id}
                            className={`category - btn ${activeCategory === category.id ? 'active' : ''} `}
                            onClick={() => filterByCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                <AnimatedContainer className="catalog-container" id="catalog">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product, index) => (
                            <AnimatedItem
                                key={product.name}
                                className="product-card"
                                data-category={product.category}
                            >
                                <div className="category-indicator">{product.categoryLabel}</div>
                                <img src={product.image} alt={product.description} />

                                <div className="service-content">
                                    <h3>{product.name}</h3>
                                    <div className="price-container">
                                        <div className="price-new">${product.price.toLocaleString()}</div>
                                        <div className="price-old">${product.oldPrice?.toLocaleString()}</div>
                                    </div>
                                    <p className="service-description">{product.description}</p>
                                    <div className="service-features">
                                        {product.features && product.features.map((feature, idx) => (
                                            <span key={idx} className="feature-tag">{feature}</span>
                                        ))}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="add-btn"
                                        onClick={() => addToCart(product)}
                                    >
                                        Agregar al carrito
                                    </motion.button>
                                </div>
                            </AnimatedItem>
                        ))}
                    </AnimatePresence>
                </AnimatedContainer>

                {/* CARRITO - VISTA APARTE / MODAL */}
                <AnimatePresence>
                    {cartOpen && (
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
                                    <i className="bi bi-x-lg close-cart" onClick={() => setCartOpen(false)}></i>
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
                                        {cartItems.length === 0 ? (
                                            <AnimatedItem key="empty">
                                                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                                    <i className="bi bi-cart-x" style={{ fontSize: '3rem', marginBottom: '10px', display: 'block' }}></i>
                                                    <p>No has añadido servicios aún.</p>
                                                </div>
                                            </AnimatedItem>
                                        ) : (
                                            cartItems.map((item, index) => (
                                                <AnimatedItem key={item.name} className="cart-item">
                                                    <div className="cart-item-info">
                                                        {item.image && <img src={item.image} alt={item.name} className="cart-item-img" />}
                                                        <div>
                                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{item.name}</h4>
                                                            <p style={{ margin: 0, color: '#bc2041', fontWeight: 'bold' }}>
                                                                ${item.price.toLocaleString()} x {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, color: '#bc2041' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeFromCart(item.name)}
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
                                    <span>${cartTotal.toLocaleString()}</span>
                                </div>

                                <div style={{ padding: '0 30px 30px 30px' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        id="agendarBtn"
                                        onClick={() => {
                                            if (cartItems.length === 0) {
                                                setAlertVisible(true);
                                                setTimeout(() => setAlertVisible(false), 3000);
                                            } else if (!isAuthenticated) {
                                                setLoginAlertVisible(true);
                                                setTimeout(() => setLoginAlertVisible(false), 5000);
                                            } else {
                                                setCartOpen(false);
                                                navigate('/Form_agenda');
                                            }
                                        }}
                                    >
                                        AGENDAR CITA AHORA
                                    </motion.button>
                                    <button
                                        onClick={() => setCartOpen(false)}
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
                    onClick={() => setCartOpen(!cartOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <i className="bi bi-cart-fill" style={{ fontSize: '1.5rem' }}></i>
                    <span className="cart-count">{cartCount}</span>
                </motion.div>
            </main>
        </AnimatedPage>
    );
}

export default Servicios_dama;