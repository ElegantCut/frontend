import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import { getCloudinaryUrl } from '../../lib/utils/imageHelper';
import './FramerCarousel.css';

export function FramerCarousel({ barbers = [] }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const x = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1;
      const targetX = -index * containerWidth;

      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    }
  }, [index, x, barbers.length]);

  if (!barbers || barbers.length === 0) return null;

  return (
    <section className="fc-section" id="barberos">
      <div className="fc-container">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="fc-header"
        >
          <div className="fc-badge">El Equipo</div>
          <h2 className="fc-heading">Nuestros Barberos</h2>
          <p className="fc-subheading">
            Profesionales apasionados por el arte de la barbería. 
            Conoce a los maestros detrás de los mejores cortes.
          </p>
        </motion.div>

        <div className="fc-carousel-wrapper" ref={containerRef}>
          
          <motion.div className="fc-track" style={{ x }}>
            {barbers.map((barber) => (
              <div key={barber.id} className="fc-slide">
                <img
                  src={getCloudinaryUrl(barber.image)}
                  alt={barber.name}
                  className="fc-slide-img"
                  draggable={false}
                />
                <div className="fc-slide-overlay" />
                
                <div className="fc-slide-content">
                  <h3 className="fc-barber-name">{barber.name}</h3>
                  <div className="fc-barber-stats">
                    <div className="fc-stat-item">
                      <Star size={16} fill="currentColor" /> {barber.stats?.recommend || "100%"} Recomendado
                    </div>
                    <div className="fc-stat-item">
                      <Users size={16} /> {barber.stats?.clients || 0} Clientes satisfechos
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Prev Button */}
          <button
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="fc-nav-btn fc-nav-prev"
            aria-label="Anterior barbero"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button */}
          <button
            disabled={index === barbers.length - 1}
            onClick={() => setIndex((i) => Math.min(barbers.length - 1, i + 1))}
            className="fc-nav-btn fc-nav-next"
            aria-label="Siguiente barbero"
          >
            <ChevronRight size={24} />
          </button>

          {/* Progress Indicators */}
          <div className="fc-dots-container">
            {barbers.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`fc-dot ${i === index ? 'active' : ''}`}
                aria-label={`Ir al barbero ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
