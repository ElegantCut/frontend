import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronDown, MoveRight, Scissors, Star } from 'lucide-react'
import AnimatedPage from '../../components/shared/AnimatedPage'
import { barberService } from '../../lib/barberService'
import { getCloudinaryUrl, getCloudinaryHomeUrl } from '../../lib/utils/imageHelper'
import { FramerCarousel } from '../../components/ui/FramerCarousel'
import { InfiniteTestimonials } from '../../components/ui/InfiniteTestimonials'
import api from '../../lib/axios'
import './Home.css'

/* ── Palabras rotantes barbería ── */
const WORDS = ['Clásico', 'Preciso', 'Moderno', 'Elegante', 'Único']

/* ── Stats del establecimiento ── */
const STATS = [
    { num: '+500', label: 'Clientes satisfechos' },
    { num: '12+',  label: 'Años de experiencia' },
    { num: '4.9★', label: 'Calificación promedio' },
]

function Home() {
    const navigate = useNavigate()
    const [wordIdx, setWordIdx]           = useState(0)
    const [barbers, setBarbers]           = useState([])
    const [loadingBarbers, setLoading]    = useState(true)
    const [reviews, setReviews]           = useState([])

    /* ── Rotación de palabras ── */
    useEffect(() => {
        const id = setTimeout(() =>
            setWordIdx(p => (p + 1) % WORDS.length), 2400)
        return () => clearTimeout(id)
    }, [wordIdx])

    /* ── Fetch data ── */
    useEffect(() => {
        barberService.getPublicBarbers()
            .then(d => d?.length && setBarbers(d.slice(0, 4)))
            .catch(e => console.error(e))
            .finally(() => setLoading(false))

        api.get('/reviews').then(res => {
            const est = res.data.filter(r => !r.id_barbero && !r.barbero)
            setReviews(est.slice(0, 3))
        }).catch(() => {})
    }, [])

    /* ── Mapeo para CircularBarbers ── */
    const mappedBarbers = useMemo(() => barbers.map(b => ({
        id: b.id_usuario,
        name: `${b.prim_nombre || ''} ${b.apellido1 || ''}`.trim(),
        title: 'Barbero Profesional',
        rating: b.calificacion_promedio ?? 5,
        bio: b.portafolios?.[0]?.biografia
            ?? (Array.isArray(b.portafolios) ? null : b.portafolios?.biografia)
            ?? 'Barbero profesional del equipo Elegant Cut.',
        experience: b.portafolios?.[0]?.experiencia
            ?? (Array.isArray(b.portafolios) ? null : b.portafolios?.experiencia)
            ?? 'Experto',
        specialties: (() => {
            try {
                const raw = b.portafolios?.[0]?.especialidades
                    ?? (Array.isArray(b.portafolios) ? null : b.portafolios?.especialidades)
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['Corte Clásico', 'Barba']
            } catch { return ['Corte Clásico', 'Barba'] }
        })(),
        image: b.foto_perfil || null,
        stats: { clients: String(b.total_resenas ?? 0), recommend: '100%' },
    })), [barbers])

    /* ── Mapeo para AnimatedTestimonials ── */
    const mappedTestimonials = useMemo(() => reviews.map((r, i) => {
        const nombre = r.usuarios_resenas_id_clienteTousuarios?.prim_nombre || 'Cliente'
        return {
            id: r.id_resena || i,
            name: nombre,
            role: "Cliente",
            company: "Verificado",
            content: r.comentario,
            rating: 5,
            avatar: "" // Fallback to initial
        }
    }), [reviews])

    /* ── Variantes Framer Motion ── */
    const stagger = {
        hidden:  {},
        visible: { transition: { staggerChildren: 0.12 } },
    }
    const fadeUp = {
        hidden:  { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    }
    const fadeLeft = {
        hidden:  { opacity: 0, x: -48 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    }
    const fadeRight = {
        hidden:  { opacity: 0, x: 48, scale: 0.97 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
    }

    return (
        <AnimatedPage>
            <div className="home-root">

                {/* ════════════════════════════════
                    SECCIÓN 1 — HERO SPLIT
                    ════════════════════════════════ */}
                <section className="home-hero" aria-label="Inicio">

                    {/* ── Lado izquierdo: imagen ── */}
                    <div className="home-hero__img-side">
                        <img
                            src={getCloudinaryHomeUrl('sec-2_xgshzs.png')}
                            alt="Barbería ElegantCut — ambiente profesional"
                            className="home-hero__img"
                        />
                        <div className="home-hero__img-overlay" />
                        <div className="home-hero__divider" />
                    </div>

                    {/* ── Lado derecho: contenido ── */}
                    <motion.div
                        className="home-hero__text-side"
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Badge */}
                        <motion.button
                            variants={fadeUp}
                            className="home-hero__badge"
                            onClick={() => navigate('/Barberos')}
                            aria-label="Ver barberos"
                        >
                            <Scissors size={11} />
                            Barbería desde 2012 &nbsp;<MoveRight size={11} />
                        </motion.button>

                        {/* Heading estático */}
                        <motion.h1 variants={fadeUp} className="home-hero__heading">
                            Donde tu Estilo
                        </motion.h1>

                        {/* Palabra rotante */}
                        <motion.div variants={fadeUp} className="home-hero__rotating-wrap">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={wordIdx}
                                    className="home-hero__rotating-word"
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: '-100%', opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 60, damping: 14 }}
                                >
                                    Cobra {WORDS[wordIdx]}
                                </motion.span>
                            </AnimatePresence>
                        </motion.div>

                        {/* Gold line */}
                        <motion.div variants={fadeUp} className="home-hero__gold-line" />

                        {/* Descripción */}
                        <motion.p variants={fadeUp} className="home-hero__desc">
                            En <strong>ELEGANTCUT</strong> fusionamos la tradición barbera clásica
                            con las técnicas más modernas. Más que un corte — es una experiencia
                            que eleva tu confianza y transforma tu imagen.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div variants={fadeUp} className="home-hero__ctas">
                            <motion.button
                                className="hb-btn-primary"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/Form_agenda')}
                                id="hero-cta-reservar"
                            >
                                Reservar Cita <Calendar size={16} />
                            </motion.button>
                            <motion.button
                                className="hb-btn-ghost"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/Barberos')}
                                id="hero-cta-barberos"
                            >
                                Ver Barberos <MoveRight size={16} />
                            </motion.button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div variants={fadeUp} className="home-hero__stats">
                            {STATS.map(s => (
                                <div key={s.label}>
                                    <span className="home-hero__stat-num">{s.num}</span>
                                    <span className="home-hero__stat-label">{s.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Scroll cue */}
                    <div className="home-hero__scroll" aria-hidden="true">
                        <span>scroll</span>
                        <ChevronDown size={13} />
                    </div>
                </section>

                {/* ════════════════════════════════
                    SECCIÓN 2 — NUESTRA HISTORIA
                    ════════════════════════════════ */}
                <section className="home-about" id="about">
                    <motion.div
                        className="home-about__grid"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {/* Texto */}
                        <motion.div variants={fadeLeft}>
                            <span className="home-section-tag">Nuestra Esencia</span>
                            <h2 className="home-about__heading">
                                Donde la Tradición<br />
                                se Encuentra con<br />
                                la Innovación
                            </h2>
                            <p className="home-about__text">
                                Desde 2012, ElegantCut ha sido el santuario para hombres que buscan
                                más que un simple corte. Inspirados por las barberías clásicas europeas,
                                creamos un espacio donde cada detalle cuenta. Combinamos técnicas
                                ancestrales con las últimas tendencias para ofrecerte una experiencia
                                que transforma no solo tu look, sino tu confianza.
                            </p>
                            <motion.button
                                className="hb-btn-primary"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/Servicios_dama')}
                                id="about-cta-servicios"
                            >
                                Explorar Servicios <MoveRight size={16} />
                            </motion.button>
                        </motion.div>

                        {/* Imagen */}
                        <motion.div className="home-about__img-wrap" variants={fadeRight}>
                            <div className="home-about__img-frame">
                                <img
                                    src={getCloudinaryHomeUrl('imagen-sec-1_dueyls')}
                                    alt="Historia de ElegantCut — barberos trabajando"
                                    className="home-about__img"
                                />
                            </div>
                            <div className="home-about__img-deco" aria-hidden="true" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* ════════════════════════════════
                    SECCIÓN 3 — TESTIMONIOS (INFINITE SCROLL)
                    ════════════════════════════════ */}
                <InfiniteTestimonials reviews={mappedTestimonials} />

                {/* ════════════════════════════════
                    SECCIÓN 4 — BARBEROS (FRAMER CAROUSEL)
                    ════════════════════════════════ */}
                <FramerCarousel barbers={mappedBarbers} />



            </div>
        </AnimatedPage>
    )
}

export default Home