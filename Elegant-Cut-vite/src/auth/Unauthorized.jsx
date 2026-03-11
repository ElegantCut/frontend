import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f8f9fa'
        }}>
            <ShieldAlert size={64} color="#e74c3c" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2c3e50' }}>
                Acceso Denegado
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#6c757d', marginBottom: '2rem', maxWidth: '600px' }}>
                No tienes los permisos necesarios para acceder a esta página.
                Si crees que esto es un error, contacta al administrador.
            </p>
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#3498db',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
            >
                Volver al Inicio
            </button>
        </div>
    );
};

export default Unauthorized;
