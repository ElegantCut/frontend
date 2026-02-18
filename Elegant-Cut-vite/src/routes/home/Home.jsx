import React from 'react'
import { motion } from 'framer-motion'
import { useScroll } from '../../lib/hooks/useScroll'
import AnimatedPage from '../../components/shared/AnimatedPage'
import { AnimatedContainer, AnimatedItem } from '../../components/shared/AnimatedList'

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
    // LLAMAR EL HOOK - Esto activa el efecto de scroll
    useScroll();

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
                        <img src="/assets/images/sec-1-img/imagen-sec-1.png" alt="Barbería Elegantcut" className="hero-image" />  {/* class → className */}
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
                            <img src="/assets/images/sec-1-img/sec-2.png" alt="Historia de ElegantCut" className="about-hero-image" />  {/* class → className */}
                        </motion.div>
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

                    <AnimatedContainer className="experts-grid">
                        <AnimatedItem className="expert-card">
                            <div className="expert-image">
                                <img src="/assets/images/barbero-1.jpg" alt="Barbero Especialista" className="expert-img" />
                            </div>
                            <div className="expert-info">
                                <h3 className="expert-name">Carlos Rodríguez</h3>
                                <p className="expert-role">Barbero Especialista</p>
                            </div>
                        </AnimatedItem>

                        <AnimatedItem className="expert-card">
                            <div className="expert-image">
                                <img src="/assets/images/estilista-1.jpg" alt="Estilista Profesional" className="expert-img" />
                            </div>
                            <div className="expert-info">
                                <h3 className="expert-name">Ana Martínez</h3>
                                <p className="expert-role">Estilista Profesional</p>
                            </div>
                        </AnimatedItem>
                        {/* ... etc ... */}
                    </AnimatedContainer>
                </section>
            </main>
        </AnimatedPage>
    )
}

export default Home