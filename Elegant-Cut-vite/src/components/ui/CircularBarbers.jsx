import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { MoveLeft, MoveRight, Scissors, Star, StarHalf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCloudinaryUrl } from "../../lib/utils/imageHelper";
import "./CircularBarbers.css";

function calculateGap(width) {
  const minWidth = 768;
  const maxWidth = 1456;
  const minGap = 55;
  const maxGap = 90;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

// Estrella SVG inline — sin dependencias externas
function StarIcon({ fill = 0, size = 15 }) {
  // fill: 1 = llena, 0.5 = media, 0 = vacía
  const id = `grad-${Math.random().toString(36).slice(2)}`;
  const pct = fill === 1 ? "100%" : fill === 0.5 ? "50%" : "0%";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'inline-block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={id}>
          <stop offset={pct} stopColor="#c9a84c" />
          <stop offset={pct} stopColor="#3f3f46" />
        </linearGradient>
      </defs>
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={`url(#${id})`}
        stroke="#c9a84c"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating({ rating }) {
  const ratingNum = parseFloat(rating) || 0;
  return (
    <div className="cb-stars">
      {[...Array(5)].map((_, i) => {
        const fill = ratingNum >= i + 1 ? 1 : ratingNum >= i + 0.5 ? 0.5 : 0;
        return <StarIcon key={i} fill={fill} size={16} />;
      })}
      <span className="cb-rating-num">{ratingNum > 0 ? ratingNum.toFixed(1) : "—"}</span>
    </div>
  );
}

/**
 * CircularBarbers — Muestra los barberos con efecto 3D circular.
 * Props:
 *   barbers: array de barbero objects con { id, name, title, rating, bio, experience, specialties, image, stats }
 *   autoplay: boolean (default true)
 *   onBooking: (barber) => void  — callback para "Reservar"
 *   onPortfolio: (barber) => void — callback para "Ver Portafolio"
 */
export function CircularBarbers({
  barbers = [],
  autoplay = true,
  onBooking,
  onPortfolio,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(900);

  const imageContainerRef = useRef(null);
  const autoplayRef = useRef(null);

  const count = useMemo(() => barbers.length, [barbers]);
  const active = useMemo(() => barbers[activeIndex], [activeIndex, barbers]);

  // Responsive gap
  useEffect(() => {
    function onResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Autoplay
  useEffect(() => {
    if (autoplay && count > 1) {
      autoplayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % count);
      }, 4500);
    }
    return () => clearInterval(autoplayRef.current);
  }, [autoplay, count]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goTo((activeIndex - 1 + count) % count);
      if (e.key === "ArrowRight") goTo((activeIndex + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, count]);

  const goTo = useCallback((idx) => {
    clearInterval(autoplayRef.current);
    setActiveIndex(idx);
  }, []);

  const handleNext = useCallback(() => goTo((activeIndex + 1) % count), [activeIndex, count, goTo]);
  const handlePrev = useCallback(() => goTo((activeIndex - 1 + count) % count), [activeIndex, count, goTo]);

  function getImageStyle(index) {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.72;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + count) % count === index;
    const isRight = (activeIndex + 1) % count === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
        transition: "all 0.75s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.82) rotateY(16deg)`,
        transition: "all 0.75s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.82) rotateY(-16deg)`,
        transition: "all 0.75s cubic-bezier(.4,2,.3,1)",
      };
    }
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.75s cubic-bezier(.4,2,.3,1)",
    };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -24 },
  };

  if (!barbers.length) return null;

  return (
    <div className="cb-container">
      <div className="cb-grid">

        {/* ── Panel de imágenes ── */}
        <div className="cb-image-panel" ref={imageContainerRef}>
          {barbers.map((barber, index) => {
            const imgSrc = barber.image
              ? getCloudinaryUrl(barber.image)
              : `https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop&auto=format`;

            return (
              <img
                key={barber.id ?? index}
                src={imgSrc}
                alt={barber.name}
                className="cb-barber-img"
                style={getImageStyle(index)}
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop&auto=format";
                }}
              />
            );
          })}

          {/* Indicadores de puntos */}
          <div className="cb-dots">
            {barbers.map((_, i) => (
              <button
                key={i}
                className={`cb-dot${i === activeIndex ? " active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Barbero ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── Panel de contenido ── */}
        <div className="cb-content-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="cb-info"
            >
              {/* Badge de especialidad */}
              <div className="cb-badge">
                <Scissors size={11} />
                <span>{active.experience || "Experto"}</span>
              </div>

              {/* Nombre */}
              <h3 className="cb-name">{active.name}</h3>
              <p className="cb-title">{active.title || "Barbero Profesional"}</p>

              {/* Rating */}
              <StarRating rating={active.rating} />

              {/* Bio con efecto blur-word */}
              <motion.p className="cb-bio">
                {(active.bio || "").split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * i }}
                    style={{ display: "inline-block" }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>

              {/* Especialidades */}
              {active.specialties?.length > 0 && (
                <div className="cb-specialties">
                  {active.specialties.slice(0, 3).map((sp, i) => (
                    <span key={i} className="cb-specialty-tag">{sp}</span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="cb-stats">
                <div className="cb-stat">
                  <strong>{active.stats?.clients ?? "—"}</strong>
                  <span>Reseñas</span>
                </div>
                <div className="cb-stat-divider" />
                <div className="cb-stat">
                  <strong>{active.stats?.recommend ?? "100%"}</strong>
                  <span>Recomiendan</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="cb-actions">
                {onPortfolio && (
                  <button
                    className="cb-btn-secondary"
                    onClick={() => onPortfolio(active)}
                  >
                    Ver Portafolio
                  </button>
                )}
                {onBooking && (
                  <button
                    className="cb-btn-primary"
                    onClick={() => onBooking(active)}
                  >
                    Reservar Cita
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Flechas de navegación */}
          <div className="cb-arrows">
            <button
              className="cb-arrow-btn"
              onClick={handlePrev}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              style={{ background: hoverPrev ? "#c9a84c" : "#1a1a1a" }}
              aria-label="Barbero anterior"
            >
              <ArrowLeft size={18} color="#f1f1f7" />
            </button>
            <button
              className="cb-arrow-btn"
              onClick={handleNext}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              style={{ background: hoverNext ? "#c9a84c" : "#1a1a1a" }}
              aria-label="Siguiente barbero"
            >
              <ArrowRight size={18} color="#f1f1f7" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CircularBarbers;
