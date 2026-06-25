import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../auth/UseAuth.jsx";
import { Menu, X, Calendar, User, LogOut, LogIn, Home, Scissors, Star, MessageSquare } from 'lucide-react';
import './Header.css';

// Hook para detectar el scroll
function useHeaderScroll(threshold = 20) {
    const [scrolled, setScrolled] = useState(false);

    const onScroll = useCallback(() => {
        setScrolled(window.scrollY > threshold);
    }, [threshold]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll, { passive: true });
        // Check initial load
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    return scrolled;
}

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const scrolled = useHeaderScroll(30);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

    const handleProfile = () => {
        setMenuOpen(false);
        navigate(isAuthenticated ? '/perfil' : '/login');
    };

    const links = [
        { label: 'Inicio', href: '/', icon: Home },
        { label: 'Servicios', href: '/servicios_dama', icon: Scissors },
        { label: 'Barberos', href: '/Barberos', icon: User },
        { label: 'Reseñas', href: '/Reseñas', icon: Star },
        { label: 'PQRS', href: '/Pqrs', icon: MessageSquare },
    ];

    return (
        <div className={`header-container ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
            <nav className="header-nav">
                {/* ── Brand ── */}
                <Link to="/" className="header-brand" onClick={() => setMenuOpen(false)}>
                    <img 
                        src="/assets/logo.png" 
                        alt="ElegantCut Logo" 
                        className="header-logo-img" 
                    />
                    <span className="header-brand-name">ELEGANTCUT</span>
                </Link>

                <div className="header-desktop-links">
                    {links.map((link, i) => {
                        const Icon = link.icon;
                        return (
                            <Link 
                                key={i} 
                                to={link.href} 
                                className={`header-link icon-only-link ${location.pathname === link.href ? 'active' : ''}`}
                                data-tooltip={link.label}
                            >
                                <Icon size={22} className="nav-icon-animated" />
                            </Link>
                        );
                    })}
                </div>

                {/* ── Desktop Actions ── */}
                <div className="header-actions">
                    {isAuthenticated ? (
                        <>
                            <span className="header-welcome">Hola, {user?.name?.split(' ')[0]}</span>
                            <button className="header-btn-outline" onClick={handleProfile}>
                                <User size={16} /> Perfil
                            </button>
                            <button className="header-btn-primary" onClick={() => navigate('/Form_agenda')}>
                                <Calendar size={16} /> Reservar
                            </button>
                            <button className="header-btn-outline" onClick={handleLogout} style={{ padding: '0.6rem' }} aria-label="Cerrar sesión">
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="header-btn-outline" onClick={() => navigate('/login')}>
                                <LogIn size={16} /> Iniciar Sesión
                            </button>
                            <button className="header-btn-primary" onClick={() => navigate('/Form_agenda')}>
                                <Calendar size={16} /> Reservar Cita
                            </button>
                        </>
                    )}
                </div>

                {/* ── Mobile Toggle ── */}
                <button 
                    className="header-mobile-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* ── Mobile Menu Dropdown ── */}
            <div className="header-mobile-menu">
                <div className="header-mobile-links">
                    {links.map((link, i) => {
                        const Icon = link.icon;
                        return (
                            <Link 
                                key={i} 
                                to={link.href} 
                                className="header-mobile-link"
                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                <Icon size={20} />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="header-mobile-actions">
                    {isAuthenticated ? (
                        <>
                            <button className="header-btn-outline" onClick={handleProfile}>
                                <User size={18} /> Mi Perfil
                            </button>
                            <button className="header-btn-primary" onClick={() => navigate('/Form_agenda')}>
                                <Calendar size={18} /> Reservar Cita
                            </button>
                            <button className="header-btn-outline" onClick={handleLogout}>
                                <LogOut size={18} /> Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="header-btn-outline" onClick={() => navigate('/login')}>
                                <LogIn size={18} /> Iniciar Sesión
                            </button>
                            <button className="header-btn-primary" onClick={() => navigate('/Form_agenda')}>
                                <Calendar size={18} /> Reservar Cita
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;