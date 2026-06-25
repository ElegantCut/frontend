import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { ArrowRight } from "lucide-react";

const TravelCard = React.forwardRef(
  (
    {
      className,
      imageUrl,
      imageAlt,
      logo,
      title,
      location,
      overview,
      price,
      pricePeriod,
      onBookNow,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("barber-card", className)}
        {...props}
      >
        <div className="barber-image">
          {imageUrl && !imageUrl.includes('default.png') ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className="barber-image-fallback" style={{ display: (!imageUrl || imageUrl.includes('default.png')) ? 'flex' : 'none' }}>
              <i className="bi bi-person-fill"></i>
          </div>
          <div className="barber-overlay">
            <div className="barber-info" style={{ padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                   {logo && (
                      <div className="barber-badge expert" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: '50%' }}>
                         {logo}
                      </div>
                   )}
                   <div className="barber-experience" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                       <i className="bi bi-star-fill text-[#c9a84c]"></i> {price}
                   </div>
                </div>
                <h3 className="barber-name">{title}</h3>
                <p className="barber-title" style={{ color: '#bc2041' }}>{location}</p>
                <p className="barber-bio" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0' }}>{overview}</p>
            </div>
            
            <div className="barber-stats" style={{ marginTop: '1rem', borderTop: 'none', borderBottom: 'none', padding: 0 }}>
               <div className="stat" style={{ textAlign: 'left' }}>
                  <strong style={{ fontSize: '1.5rem' }}>{pricePeriod}</strong>
                  <span style={{ fontSize: '0.7rem' }}>RESEÑAS</span>
               </div>
               <Button onClick={onBookNow} className="btn-primary" style={{ margin: 0 }}>
                  Agendar <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
TravelCard.displayName = "TravelCard";

export { TravelCard };
