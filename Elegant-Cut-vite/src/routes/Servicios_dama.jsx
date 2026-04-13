
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthClient } from '../auth/authClient';
import { useAuth } from '../auth/UseAuth';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from "../components/shared/AnimatedPage";
import { AnimatedContainer, AnimatedItem } from "../components/shared/AnimatedList";
import { getCloudinaryBannerUrl, getCloudinaryServiceUrl } from '../lib/utils/imageHelper';
import { servicesService } from '../lib/servicesService';
import { useLocation } from 'react-router-dom';

function Servicios_dama() {
    const Location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false); // Alerta de carrito vacío (dentro del modal)
    const [loginAlertVisible, setLoginAlertVisible] = useState(false); // Alerta de login (flotante)
    const [activeCategory, setActiveCategory] = useState('todos');
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);


    // 🔗 DEEP LINKING: Lee el parámetro ?categoria= de la URL
    // Se ejecuta cada vez que cambia la parte "?..." de la URL
    useEffect(() => {
        const queryParams = new URLSearchParams(Location.search);
        // URLSearchParams convierte "?categoria=uñas" en un objeto consultable
        // Location.search es "?categoria=uñas" (todo lo que hay después del ?)

        const categoria = queryParams.get('categoria');
        // .get('categoria') extrae el valor: "uñas", "mascarillas", "peinados", etc.
        // Si no hay ?categoria= en la URL, devuelve null

        if (categoria) {
            setActiveCategory(categoria);
            // Activa el filtro visual automáticamente al entrar desde el Footer
        }
    }, [Location.search]);
    // [Location.search] → se vuelve a ejecutar si la URL cambia (ej: navegas a ?categoria=peinados)

    // --- CARRUSEL ESTILO XIAOMI ---
    const carouselSlidesDama = [
        {
            img: getCloudinaryBannerUrl('Carrusel1_i2b3g9'),
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

    // Llamada a la API para obtener los servicios
    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                setCargando(true);
                const datosBrutos = await servicesService.getServicesByGender(2); // 2 = Dama

                // Adaptamos los datos tal como en Servicios_caballero.jsx

                // 1. OBTENEMOS EL NOMBRE DE LA CATEGORÍA RELACIONADA (asegurando minúsculas)
                // El backend ahora incluye 'categorias' { id_categoria, nombre, etc. }
                const datosConCategoria = datosBrutos.map(s => {
                    const categoriaNombre = s.categorias?.nombre ? s.categorias.nombre.toLowerCase().trim() : 'otros';
                    return { ...s, categoriaAsignada: categoriaNombre };
                });

                // Ya no filtramos localmente, el backend devuelve solo los de dama
                const serviciosFiltrados = datosConCategoria;

                // 3. MAPEO FINAL PARA EL FRONTEND
                // Adaptamos la data de la DB a las propiedades del componente React
                const serviciosLimpios = serviciosFiltrados.map((s) => ({
                    id: s.id_servicio,
                    nombre: s.nombre,
                    name: s.nombre,
                    precio: s.precio,
                    price: s.precio,
                    descripcion: s.descripcion || "Servicio premium",
                    description: s.descripcion || "Servicio premium",

                    // CATEGORÍA: Valor detectado desde la tabla relacional
                    category: s.categoriaAsignada,
                    categoryLabel: s.categorias?.nombre || "Servicio Dama",

                    // IMAGEN: Usamos la de la DB o la de Manicure por defecto
                    image: s.imagen || "/assets/images/servicios_dama/Uñas/ManicureSinDiseño.png",

                    // DURACIÓN: Implementamos el uso de la columna duracion de la DB
                    features: [
                        "Calidad Garantizada",
                        `${s.duracion || 45} min` // <- DURACIÓN REAL DESDE DB
                    ]
                }));

                setServicios(serviciosLimpios);
            } catch (error) {
                console.error("No se pudo conectar con el backend", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerDatos();
    }, []);

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
        { id: 'todos', name: 'Todos los Servicios' },
        { id: 'uñas', name: 'Uñas' },
        { id: 'cortes cabello largo', name: 'Cortes Cabello Largo' },
        { id: 'cortes cabello corto', name: 'Cortes Cabello Corto' },
        { id: 'color / tintes', name: 'Color / Tintes' },
        { id: 'peinados', name: 'Peinados' },
        { id: 'mascarillas', name: 'Mascarillas' }
    ];

    // Productos disponibles: Ahora provienen de `servicios` en lugar de una lista estática

    // Filtrar productos por categoría activa
    const filteredProducts = activeCategory === 'todos'
        ? servicios
        : servicios.filter(product => product.category === activeCategory);

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
                        {filteredProducts.map((product) => {
                            const isHaircut = (cat) => cat === 'cortes cabello largo' || cat === 'cortes cabello corto';

                            const isSelected = cartItems.some(item => item.id === product.id);
                            const isCategorySelected = cartItems.some(item =>
                                (isHaircut(item.category) && isHaircut(product.category))
                                || item.category === product.category
                            );
                            const isDisabled = isSelected || isCategorySelected;

                            return (
                                <AnimatedItem
                                    key={product.name}
                                    className="product-card"
                                    data-category={product.category}
                                >
                                    <div className="service-image">
                                        {product.image && !product.image.includes('default.png') ? (
                                            <img
                                                src={getCloudinaryServiceUrl(product.image)}
                                                alt={product.description}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : null}
                                    </div>
                                    <div className="category-indicator">{product.categoryLabel}</div>


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
                                            whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                            whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                            className="add-btn"
                                            onClick={() => {
                                                if (!isDisabled) addToCart(product);
                                            }}
                                            style={{
                                                backgroundColor: isSelected ? '#198754' : (isCategorySelected ? '#6c757d' : ''),
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                opacity: (isCategorySelected && !isSelected) ? 0.6 : 1,
                                                border: isDisabled ? 'none' : ''
                                            }}
                                        >
                                            {isSelected ? "Seleccionado" : (isCategorySelected ? "1 por categoría" : "Agregar al carrito")}
                                        </motion.button>
                                    </div>
                                </AnimatedItem>
                            )
                        })}
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
                                                <AnimatedItem key={item.name || index} className="cart-item">
                                                    <div className="cart-item-info">
                                                        {item.image && <img src={getCloudinaryServiceUrl(item.image)} alt={item.name} className="cart-item-img" />}
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
                                                navigate('/Form_agenda', { state: { cart: cartItems } });
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