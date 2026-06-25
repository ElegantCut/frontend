import React, { Fragment } from "react";
import { motion } from "framer-motion";
import "./InfiniteTestimonials.css";

const TestimonialsColumn = ({ testimonials, duration = 15, className = "" }) => {
  return (
    <div className={`it-column-container ${className}`}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="it-column"
      >
        {/* Duplicamos el array para que el scroll sea infinito y suave */}
        {[...new Array(2).fill(0)].map((_, index) => (
          <Fragment key={index}>
            {testimonials.map((t, i) => (
              <div className="it-card" key={`${index}-${i}`}>
                <div className="it-card-text">"{t.content}"</div>
                <div className="it-card-footer">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="it-card-avatar"
                    />
                  ) : (
                    <div className="it-card-avatar">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="it-card-info">
                    <span className="it-card-name">{t.name}</span>
                    <span className="it-card-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export const InfiniteTestimonials = ({ reviews = [] }) => {
  // Como podemos tener pocas reseñas en la base de datos (ej. 3), 
  // las repetimos o mezclamos para llenar 3 columnas y dar el efecto infinito.
  
  // Garantizar un mínimo de 9 elementos para 3 columnas (3 por columna)
  const expandedReviews = [...reviews, ...reviews, ...reviews, ...reviews].slice(0, 9);

  const firstColumn = expandedReviews.slice(0, 3);
  const secondColumn = expandedReviews.slice(3, 6);
  const thirdColumn = expandedReviews.slice(6, 9);

  return (
    <section className="it-section" id="testimonios">
      <div className="it-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="it-header"
        >
          <div className="it-badge">Testimonios</div>
          <h2 className="it-heading">Lo que dicen de nosotros</h2>
          <p className="it-subheading">
            Descubre por qué ELEGANTCUT es el lugar preferido por los hombres que buscan 
            destacar su estilo y cuidar su imagen.
          </p>
        </motion.div>

        {reviews.length > 0 ? (
          <div className="it-grid-wrapper">
            <TestimonialsColumn testimonials={firstColumn} duration={16} className="it-col-1" />
            <TestimonialsColumn testimonials={secondColumn} duration={21} className="it-col-2" />
            <TestimonialsColumn testimonials={thirdColumn} duration={18} className="it-col-3" />
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            Próximamente testimonios de nuestros clientes.
          </p>
        )}
      </div>
    </section>
  );
};
