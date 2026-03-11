// src/auth/ForgotPassword.jsx
import { useState } from 'react';
import { authService } from './authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(''); setError('');
    
    try {
      const res = await authService.forgotPassword(email);
      setMensaje(res.message); 
    } catch (err) {
      setError(err.message || "Hubo un error al enviar el correo");
    }
  };

  return (
    <div className="contenedor-formulario">
      <h2>Recuperar Contraseña</h2>
      <p>Ingresa tu correo para enviarte un código de verificación.</p>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Tu correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Enviar Código</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
