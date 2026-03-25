import React, { useState } from 'react';
import { authService } from '../../auth/authService';
import './PerfilModals.css';

function CambiarContrasenaModal({ isOpen, onClose, userEmail }) {
    const [step, setStep] = useState(1); // 1: Pedir envío de código, 2: Verificar y cambiar
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [formData, setFormData] = useState({
        codigo: '',
        newPassword: '',
        confirmarContrasena: ''
    });

    if (!isOpen) return null;

    const mostrarMensaje = (text, type) => setMessage({ text, type });

    const handleSolicitarCodigo = async () => {
        setLoading(true);
        mostrarMensaje('Enviando código a tu correo...', 'info');
        try {
            await authService.forgotPassword(userEmail);
            mostrarMensaje('✅ Código enviado a tu correo.', 'success');
            setStep(2);
        } catch (error) {
            mostrarMensaje('Error: ' + (error.message || 'No se pudo enviar el código'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerificarCodigo = async (e) => {
        e.preventDefault();
        setLoading(true);
        mostrarMensaje('Verificando...', 'info');

        if (formData.newPassword !== formData.confirmarContrasena) {
            mostrarMensaje('Las contraseñas no coinciden', 'error');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
            setLoading(false);
            return;
        }

        try {
            await authService.resetPassword(userEmail, formData.codigo, formData.newPassword);
            mostrarMensaje('¡Contraseña actualizada exitosamente!', 'success');
            setTimeout(() => {
                onClose(); // Cerrar modal después del éxito
                setStep(1); // Resetear estado para la próxima vez
                setFormData({ codigo: '', newPassword: '', confirmarContrasena: '' });
            }, 2000);
        } catch (error) {
            mostrarMensaje('Error: ' + (error.message || 'Código inválido o expirado'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="perfil-modal-overlay">
            <div className="perfil-modal-content">
                <button className="perfil-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
                <h2>Cambiar Contraseña</h2>
                
                {message.text && (
                    <div className={`perfil-modal-msg msg-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 && (
                    <div className="perfil-modal-step">
                        <p>Para cambiar tu contraseña, enviaremos un código de seguridad al correo: <strong>{userEmail}</strong></p>
                        <button className="perfil-modal-btn primary" onClick={handleSolicitarCodigo} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Código Verificación'}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <form className="perfil-modal-form" onSubmit={handleVerificarCodigo}>
                        <div className="form-group">
                            <label>Código de verificación (6 dígitos)</label>
                            <input 
                                type="text" 
                                required 
                                maxLength="6"
                                value={formData.codigo}
                                onChange={e => setFormData({...formData, codigo: e.target.value.replace(/\D/g, '')})}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nueva Contraseña</label>
                            <input 
                                type="password" 
                                required 
                                value={formData.newPassword}
                                onChange={e => setFormData({...formData, newPassword: e.target.value})}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Contraseña</label>
                            <input 
                                type="password" 
                                required 
                                value={formData.confirmarContrasena}
                                onChange={e => setFormData({...formData, confirmarContrasena: e.target.value})}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="perfil-modal-actions">
                            <button type="button" className="perfil-modal-btn secondary" onClick={() => setStep(1)} disabled={loading}>Volver</button>
                            <button type="submit" className="perfil-modal-btn primary" disabled={loading}>
                                {loading ? 'Actualizando...' : 'Actualizar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default CambiarContrasenaModal;
