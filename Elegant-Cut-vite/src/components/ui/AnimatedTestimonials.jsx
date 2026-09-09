import React, { useState, useEffect, useRef } from "react";
import { Quote, Star } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import "./AnimatedTestimonials.css";

export function AnimatedTestimonials({
  title = "Loved by the community",
  subtitle = "Don't just take our word for it. See what developers and companies have to say about our starter template.",
  badgeText = "Trusted by developers",
  testimonials = [],
  autoRotateInterval = 6000,
  trustedCompanies = [],
  trustedCompaniesTitle = "Trusted by developers from companies worldwide",
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Refs for scroll animations
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Trigger animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Auto rotate testimonials
  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotateInterval, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} id="testimonials" className={`at-section ${className}`}>
      <div className="at-inner">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="at-grid"
        >
          {/* Left side: Heading and navigation */}
          <motion.div variants={itemVariants} className="at-left">
            {badgeText && (
              <div className="at-badge">
                <Star size={12} fill="currentColor" />
                <span>{badgeText}</span>
              </div>
            )}

            <h2 className="at-heading">{title}</h2>
            <p className="at-subheading">{subtitle}</p>

            <div className="at-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`at-dot ${activeIndex === index ? "active" : ""}`}
                  aria-label={`Ver testimonio ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Right side: Testimonial cards */}
          <motion.div variants={itemVariants} className="at-right">
            {testimonials.map((testimonial, index) => {
              const isActive = activeIndex === index;
              return (
                <motion.div
                  key={testimonial.id}
                  className="at-card"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    x: isActive ? 0 : 100,
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ 
                    zIndex: isActive ? 10 : 0, 
                    pointerEvents: isActive ? 'auto' : 'none' 
                  }}
                >
                  <div className="at-stars">
                    {Array(testimonial.rating || 5)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} size={15} className="at-star" fill="currentColor" stroke="none" />
                      ))}
                  </div>

                  <div className="at-quote-wrap">
                    <Quote className="at-quote-icon" size={32} />
                    <p className="at-quote-text">"{testimonial.content}"</p>
                  </div>

                  <hr className="at-separator" />

                  <div className="at-card-footer">
                    <div className="at-avatar">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} />
                      ) : (
                        <div className="at-avatar-fallback">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="at-person-name">{testimonial.name}</h3>
                      <p className="at-person-role">
                        {testimonial.role}{testimonial.company ? `, ${testimonial.company}` : ''}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Decorative elements */}
            <div className="at-deco at-deco--tl"></div>
            <div className="at-deco at-deco--br"></div>
          </motion.div>
        </motion.div>

        {/* Logo cloud */}
        {trustedCompanies.length > 0 && (
          <motion.div variants={itemVariants} initial="hidden" animate={controls} className="at-cloud">
            <h3 className="at-cloud-title">{trustedCompaniesTitle}</h3>
            <div className="at-cloud-logos">
              {trustedCompanies.map((company) => (
                <div key={company} className="at-cloud-logo">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
