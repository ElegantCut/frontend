import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { useScroll } from '../../lib/hooks/useScroll'
import AnimatedPage from '../../components/shared/AnimatedPage'
import { AnimatedContainer, AnimatedItem } from '../../components/shared/AnimatedList'
import { barberService } from '../../lib/barberService'
import { getCloudinaryUrl, getCloudinaryHomeUrl } from '../../lib/utils/imageHelper'
import { useAuth } from '../../auth/UseAuth'

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const slideInLeft = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const slideInRight = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

function Home() {
    const { isAuthenticated, user } = useAuth();
    
    // REDIRECCIÓN AUTÓMATICA POR ROL SI LA SESIÓN ESTÁ ACTIVA
    if (isAuthenticated && user) {
        if (user.id_rol === 1 || user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.id_rol === 3 || user.role === 'barber') return <Navigate to="/barber" replace />;
    }

    // LLAMAR EL HOOK - Esto activa el efecto de scroll
    useScroll();

    // ESTADO PARA BARBEROS
    const [barbers, setBarbers] = useState([]);
    const [loadingBarbers, setLoadingBarbers] = useState(true);

    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                // LLAMA AL NUEVO ENDPOINT OPTIMIZADO
                const data = await barberService.getPublicBarbers();
                // Limitar a los primeros 4 barberos para el inicio (para no saturar la vista)
                if (data && data.length > 0) {
                    setBarbers(data.slice(0, 4));
                }
            } catch (err) {
                console.error("Error al traer barberos para el Home:", err);
            } finally {
                setLoadingBarbers(false);
            }
        };

        fetchBarbers();
    }, []);

    return (
        <AnimatedPage>
            <main>

                {/* SECCIÓN 1 - MANTENIDA INTACTA */}
                <div className="content-grid">  {/* class → className */}
                    {/* Zona izquierda - Contenedor para imagen */}
                    <motion.div
                        className="image-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <img src={getCloudinaryHomeUrl('sec-2_xgshzs.png')} alt="Barbería Elegantcut" className="hero-image" />  {/* class → className */}
                    </motion.div>

                    {/* Zona derecha - Mensaje con tipografía moderna */}
                    <motion.div
                        className="message-container"
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                    >
                        <h1>Donde Tu Estilo Cobra Vida</h1>
                        <p>En ELEGANTCUT combinamos tradición barbera con las últimas tendencias. Nuestros expertos crean looks
                            personalizados que reflejan tu personalidad y elevan tu confianza. Más que un corte, es una
                            experiencia que renueva tu estilo de vida.</p>

                        {/* BOTÓN CORREGIDO: ID diferente */}
                        <motion.button
                            className="cta-button"
                            id="descubre-mas-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Descubre Más
                        </motion.button>  {/* class → className */}
                    </motion.div>
                </div>

                {/* SECCIÓN 2 - NUESTRA HISTORIA */}
                <motion.section
                    className="about-section"
                    id="about-section"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div className="about-header" variants={fadeIn}>
                        <span className="subtitle">Nuestra Esencia</span>  {/* class → className */}
                        <h2>La Historia de ElegantCut</h2>
                        <p className="section-description"> creando sonrisas y estilos únicos</p>  {/* class → className */}
                    </motion.div>

                    <div className="about-content">  {/* class → className */}
                        <motion.div className="about-text" variants={slideInLeft}>  {/* class → className */}
                            <h3>Donde la Tradición se Encuentra con la Innovación</h3>
                            <p>Desde 2012, ElegantCut ha sido el santuario para hombres que buscan más que un simple corte. Inspirados por las barberías clásicas europeas, creamos un espacio donde cada detalle cuenta. Combinamos técnicas ancestrales con las últimas tendencias para ofrecerte una experiencia que transforma no solo tu look, sino tu confianza.</p>
                        </motion.div>

                        <motion.div className="about-image" variants={slideInRight}>  {/* class → className */}
                            <img src={getCloudinaryHomeUrl('imagen-sec-1_dueyls')} alt="Historia de ElegantCut" className="about-hero-image" />  {/* class → className */}
                        </motion.div>|
                    </div>
                </motion.section>

                {/* SECCIÓN 3 - TESTIMONIOS */}
                <section className="testimonials-section">
                    <motion.div
                        className="testimonials-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="subtitle">Testimonios</span>
                        <h2>Nuestros clientes</h2>
                    </motion.div>

                    <AnimatedContainer className="testimonials-grid">
                        <AnimatedItem className="testimonial-card">
                            <p className="testimonial-text">Nunca me había sentido tan seguro después de un corte de pelo. El estilista de verdad entendió mi personalidad, entregando una apariencia que se adapta perfectamente a mi estilo de vida.</p>
                            <div className="client-name">Jack J.</div>
                            <div className="client-info">Cliente Regular</div>
                        </AnimatedItem>

                        <AnimatedItem className="testimonial-card">
                            <p className="testimonial-text">Mi maquillaje inicial fue impecable. El artista prestó atención a cada detalle, asegurándome de lucir paciente y segura durante todo mi día especial.</p>
                            <div className="client-name">Liza R.</div>
                            <div className="client-info">Cliente Casual</div>
                        </AnimatedItem>

                        <AnimatedItem className="testimonial-card">
                            <p className="testimonial-text">El ambiente del salón es relajante y acogedor. El personal es amable, Hábil, profesional, cada visita agradable, cómoda y realmente vale la pena repetirla.</p>
                            <div className="client-name">Emma J.</div>
                            <div className="client-info">Cliente Real</div>
                        </AnimatedItem>
                    </AnimatedContainer>
                </section>

                {/* SECCIÓN 4 - NUESTROS EXPERTOS */}
                <section className="experts-section">
                    <motion.div
                        className="experts-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="subtitle">Nuestros Especialistas</span>
                        <h2>Conoce a Nuestro Equipo</h2>
                    </motion.div>

                    {loadingBarbers ? (
                        <p className="text-center text-white w-100">Cargando equipo...</p>
                    ) : barbers.length > 0 ? (
                        <TeamCarousel barbers={barbers} />
                    ) : (
                        <p className="text-center text-white w-100">Aún no hay barberos registrados.</p>
                    )}
                </section>
            </main>
        </AnimatedPage>
    )
}

// Componente Carousel para el Equipo
const TeamCarousel = ({ barbers }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % barbers.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + barbers.length) % barbers.length);
    };

    return (
        <div className="team-carousel-container">
            <div className="team-cards-stack">
                {barbers.map((barber, index) => {
                    let offset = (index - activeIndex + barbers.length) % barbers.length;

                    // Ajuste para suavizar cuando el elemento vuelve al final de la cola
                    const isPrev = offset === barbers.length - 1 && barbers.length > 2;
                    if (isPrev) {
                        offset = 3;
                    }

                    return (
                        <motion.div
                            key={barber.id_usuario}
                            className="team-stacked-card"
                            initial={false}
                            animate={{
                                top: offset * 30,
                                left: offset * 15,
                                scale: 1 - offset * 0.05,
                                zIndex: barbers.length - offset,
                                opacity: offset >= 3 ? 0 : 1
                            }}
                            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            onClick={() => {
                                if (offset !== 0 && offset < 3) {
                                    setActiveIndex(index);
                                }
                            }}
                        >
                            {barber.foto_perfil ? (
                                <img
                                    src={getCloudinaryUrl(barber.foto_perfil)}
                                    alt={`${barber.prim_nombre}`}
                                    className="team-expert-img"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="team-expert-placeholder">
                                    <i className="bi bi-person"></i>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="team-carousel-info">
                <div className="team-carousel-controls">
                    <button onClick={handlePrev} className="carousel-btn prev-btn">
                        <i className="bi bi-chevron-up"></i>
                    </button>
                    <button onClick={handleNext} className="carousel-btn next-btn">
                        <i className="bi bi-chevron-down"></i>
                    </button>
                </div>

                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="team-expert-name">
                        {`${barbers[activeIndex]?.prim_nombre || ''} ${barbers[activeIndex]?.apellido1 || ''}`.trim()}
                    </h3>
                    <p className="team-expert-role">Barbero Profesional</p>
                    <div className="team-decorative-lines">
                        <div className="line"></div>
                        <div className="line"></div>
                        <div className="line highlight-line"></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home