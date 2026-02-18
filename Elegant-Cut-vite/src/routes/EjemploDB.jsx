import React, { useState, useEffect } from 'react';
import '../App.css'; // Reutilizamos estilos básicos

function EjemploDB() {
    const [servicios, setServicios] = useState([]);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // PASO 3: Hacer la petición al backend
        // Nota: Asegúrate de que el puerto sea el correcto (3001 según tu auth_fixed.js)
        fetch('http://localhost:3001/api/mis-consultas/ejemplo')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                console.log("Datos recibidos:", data);
                setServicios(data); // Guardamos los datos en el estado
                setCargando(false);
            })
            .catch(err => {
                console.error("Error:", err);
                setError(err.message);
                setCargando(false);
            });
    }, []); // El array vacío [] significa que se ejecuta solo una vez al cargar

    return (
        <div className="container" style={{ padding: '100px 20px', color: 'white' }}>
            <h2>Prueba de Conexión a Base de Datos</h2>
            <p>Consultando tabla: <strong>servicios</strong></p>

            {cargando && <p>Cargando datos...</p>}

            {error && (
                <div style={{ background: '#ffeba7', color: 'red', padding: '10px', borderRadius: '5px' }}>
                    Error: {error}
                </div>
            )}

            {!cargando && !error && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {servicios.map((servicio) => (
                        <div key={servicio.id_servicio} style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid #d4af37'
                        }}>
                            <h3 style={{ color: '#d4af37' }}>{servicio.nombre}</h3>
                            <p>Precio: ${servicio.precio}</p>
                            <p>Duración: {servicio.duracion}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EjemploDB;
