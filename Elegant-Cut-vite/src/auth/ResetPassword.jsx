// src/auth/ResetPassword.jsx
import { useState } from 'react';
import { authService } from './authService';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(''); setError('');
    
    try {
      const res = await authService.resetPassword(email, codigo, newPassword);
      setMensaje(res.message); 
    } catch (err) {
      setError(err.message || "Código inválido o expirado");
    }
  };

  return (
    <div className="contenedor-formulario">
      <h2>Ingresa tu Código y Nueva Contraseña</h2>
      
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" placeholder="Código de 6 dígitos" value={codigo} onChange={(e) => setCodigo(e.target.value)} maxLength={6} required />
        <input type="password" placeholder="Tu nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button type="submit">Cambiar Contraseña</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
