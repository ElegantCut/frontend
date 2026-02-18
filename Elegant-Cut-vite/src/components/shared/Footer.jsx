import React from 'react'

function Footer() {  // <- Cambiado a mayúscula
    return (
        <div>
            {/*<!-- FOOTER - ANCHO COMPLETO -->*/}
            <footer className="footer-full">  {/* Cambié class por className */}
                <div className="footer-content">
                    {/*<!-- brand -->*/}
                    <div className="footer-brand">
                        <h3>ELEGANTCUT</h3>
                        <p>Donde el estilo se encuentra con la elegancia. Transformamos tu look con pasión y profesionalismo.
                        </p>
                        <div className="social-links">
                            <a href="/" className="social-link">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="/" className="social-link">
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="/" className="social-link">
                                <i className="bi bi-tiktok"></i>
                            </a>
                            <a href="/" className="social-link">
                                <i className="bi bi-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                    {/*<!-- servicios -->*/}
                    <div className="footer-links">
                        <h4>Nuestros Servicios</h4>
                        <ul>
                            <li><a href="/">Cortes de Cabello</a></li>
                            <li><a href="/">Coloración</a></li>
                            <li><a href="/">Maquillaje</a></li>
                            <li><a href="/">Cuidado Facial</a></li>
                            <li><a href="/">Manicure & Pedicure</a></li>
                        </ul>
                    </div>

                    {/*<!--  contacto -->*/}
                    <div className="footer-contact">
                        <h4>Contacto</h4>
                        <div className="contact-info">
                            <div className="contact-item">
                                <i className="bi bi-geo-alt"></i>
                                <span>Tu dirección aquí</span>
                            </div>
                            <div className="contact-item">
                                <i className="bi bi-telephone"></i>
                                <span>+1 234 567 890</span>
                            </div>
                            <div className="contact-item">
                                <i className="bi bi-envelope"></i>
                                <span>info@elegantcut.com</span>
                            </div>
                            <div className="contact-item">
                                <i className="bi bi-clock"></i>
                                <span>Lun-Sáb: 9am - 8pm</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 ELEGANTCUT Barbería & Beauty Salon. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}

export default Footer  // <- También cambiado a mayúscula