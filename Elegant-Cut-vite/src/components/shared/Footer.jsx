import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../assets/styles/Footer/Footer.css';

function Footer() {
  const brandName = "ELEGANTCUT";
  
  const socialLinks = [
    { icon: <Facebook />, href: "https://facebook.com", label: "Facebook" },
    { icon: <Instagram />, href: "https://instagram.com", label: "Instagram" },
    { icon: <MapPin />, href: "#", label: "Ubicación" },
    { icon: <Phone />, href: "#", label: "Teléfono" },
  ];

  const mainLinks = [
    { href: "/servicios_dama", label: "Servicios Dama" },
    { href: "/servicios_caballero", label: "Servicios Caballero" },
    { href: "/Barberos", label: "Nuestros Barberos" },
    { href: "/Reseñas", label: "Reseñas" },
    { href: "/Form_agenda", label: "Reservar Cita" },
  ];

  const legalLinks = [
    { href: "/Pqrs", label: "PQRS" },
    { href: "#", label: "Términos y Condiciones" },
    { href: "#", label: "Política de Privacidad" },
  ];

  const copyright = {
    text: "© 2024 ELEGANTCUT Barbería & Beauty Salon.",
    license: "Todos los derechos reservados. Donde tu estilo cobra vida.",
  };

  return (
    <footer className="footer-root">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <Link to="/" className="footer-brand" aria-label={brandName}>
            <span className="footer-brand-name">{brandName}</span>
          </Link>
          
          <ul className="footer-social">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <a 
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={link.label}
                  className="footer-social-btn"
                >
                  {link.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          
          {/* Columna 1: Info y Contacto */}
          <div className="footer-info-col">
            <div className="footer-copyright">
              <div>{copyright.text}</div>
              {copyright.license && <div>{copyright.license}</div>}
            </div>
            
            <div className="footer-contact-info">
                <span className="contact-line">
                    <Mail size={15} /> info@elegantcut.com
                </span>
                <span className="contact-line">
                    <Clock size={15} /> Lun-Sáb: 9am - 8pm
                </span>
            </div>
          </div>

          {/* Columna 2: Navegación Principal */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Explorar</h4>
            <ul className="footer-nav-list">
              {mainLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Columna 3: Legales */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Atención</h4>
            <ul className="footer-legal-list">
              {legalLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="footer-legal-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

export default Footer;