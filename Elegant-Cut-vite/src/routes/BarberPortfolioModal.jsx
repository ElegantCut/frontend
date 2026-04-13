import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Star, Award, Scissors, CheckCircle, Image as ImageIcon } from 'lucide-react';
import '../styles/Barbero_Portafolio/BarberPortfolioModal.css';
import { getCloudinaryUrl } from '../lib/utils/imageHelper';

const BarberPortfolioModal = ({ isOpen, onClose, barberId, barberName, barberImage, barberTitle, portfolioDataProp, fullBarberData }) => {
    const navigate = useNavigate();
    const [portfolioData, setPortfolioData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Intentar parsear los campos JSON en caso de que vengan como String de MySQL
            let especialidades = ["Corte Masculino"];
            let fotos = [];

            try {
                if (portfolioDataProp?.especialidades) {
                    especialidades = typeof portfolioDataProp.especialidades === 'string'
                        ? JSON.parse(portfolioDataProp.especialidades)
                        : portfolioDataProp.especialidades;
                }

                if (portfolioDataProp?.fotos_portafolio) {
                    fotos = typeof portfolioDataProp.fotos_portafolio === 'string'
                        ? JSON.parse(portfolioDataProp.fotos_portafolio)
                        : portfolioDataProp.fotos_portafolio;
                }
            } catch (e) {
                console.warn("Error parsing JSON fields from portfolio DB", e);
            }

            setPortfolioData(portfolioDataProp ? {
                ...portfolioDataProp,
                especialidades,
                fotos_portafolio: Array.isArray(fotos) ? fotos : [],
                calificacion: portfolioDataProp.calificacion || 5.0,
                rese_as_count: portfolioDataProp.rese_as_count || 0
            } : {
                // Fallback if not found in db
                nombre_completo: barberName,
                biografia: "Este barbero está construyendo su portafolio. ¡Pronto verás aquí sus mejores cortes!",
                experiencia: "Profesional",
                especialidades: ["Corte Masculino"],
                calificacion: 5.0,
                rese_as_count: 0,
                fotos_portafolio: []
            });
        }
    }, [isOpen, portfolioDataProp, barberName]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="portfolio-modal-overlay" onClick={onClose}>
                <motion.div
                    className="portfolio-modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
                >
                    {/* Close Button */}
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>

                    {portfolioData && (
                        <>
                            {/* Header Section */}
                            <div className="portfolio-header">
                                <div className="portfolio-avatar-container">
                                    <img
                                        src={barberImage ? getCloudinaryUrl(barberImage) : '/assets/images/default-avatar.png'}
                                        alt={barberName}
                                        className="portfolio-avatar"
                                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(barberName) + '&background=random' }}
                                    />
                                    <div className="portfolio-badge"><Award size={16} /></div>
                                </div>

                                <div className="portfolio-title-info">
                                    <h2>{portfolioData.nombre_completo || barberName}</h2>
                                    <p className="portfolio-role">{portfolioData.experiencia || barberTitle}</p>

                                    <div className="portfolio-rating-row">
                                        <div className="portfolio-stars">
                                            {[...Array(5)].map((_, i) => {
                                                const rating = parseFloat(portfolioData.calificacion);
                                                return (
                                                    <Star 
                                                        key={i} 
                                                        size={16} 
                                                        fill={rating >= i + 1 ? "goldenrod" : (rating >= i + 0.5 ? "url(#half-star)" : "none")} 
                                                        color="goldenrod" 
                                                    />
                                                );
                                            })}
                                            {/* Def para estrella media */}
                                            <svg width="0" height="0" style={{ position: 'absolute' }}>
                                                <defs>
                                                    <linearGradient id="half-star">
                                                        <stop offset="50%" stopColor="goldenrod" />
                                                        <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <span style={{ marginLeft: '8px' }}>{portfolioData.calificacion}</span>
                                            <span className="reviews-count">({portfolioData.rese_as_count} reseñas)</span>
                                        </div>
                                        {portfolioData.instagram && (
                                            <a href={`https://instagram.com/${portfolioData.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="instagram-link">
                                                <Instagram size={16} />
                                                {portfolioData.instagram}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="portfolio-body-scroll">
                                {/* Bio & Specialties */}
                                <div className="portfolio-about-section">
                                    <h3>Sobre mí</h3>
                                    <p className="portfolio-bio">{portfolioData.biografia}</p>

                                    <h4>Especialidades</h4>
                                    <div className="portfolio-specialties">
                                        {(Array.isArray(portfolioData.especialidades) ? portfolioData.especialidades : ["Corte Masculino"])
                                            .map((spec, index) => (
                                                <span key={index} className="specialty-pill">
                                                    <CheckCircle size={14} /> {typeof spec === 'string' ? spec.trim() : spec}
                                                </span>
                                            ))}
                                    </div>
                                </div>

                                {/* Gallery */}
                                <div className="portfolio-gallery-section">
                                    <h3>
                                        <ImageIcon size={20} className="me-2" style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
                                        Galería de Trabajos
                                    </h3>

                                    {portfolioData.fotos_portafolio && portfolioData.fotos_portafolio.length > 0 ? (
                                        <div className="portfolio-grid">
                                            {portfolioData.fotos_portafolio.map((foto, index) => (
                                                <div key={index} className="portfolio-grid-item">
                                                    {/* Usando la foto real del portafolio, extraída del array JSON */}
                                                    <img
                                                        src={foto}
                                                        alt={`Trabajo ${index + 1}`}
                                                        loading="lazy"
                                                    />
                                                    <div className="hover-overlay"><Scissors size={24} /></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="portfolio-empty-state">
                                            <ImageIcon size={48} color="#ccc" />
                                            <p>Este barbero aún no ha subido fotos a su portafolio.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer action */}
                            <div className="portfolio-footer">
                                <button className="btn-primary" style={{ width: '100%' }} onClick={() => {
                                    onClose();
                                    if (fullBarberData) {
                                        navigate('/Form_agenda', { state: { preselectedBarber: fullBarberData } });
                                    }
                                }}>
                                    Agendar con {portfolioData?.nombre_completo?.split(' ')[0] || barberName?.split(' ')[0]}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BarberPortfolioModal;
