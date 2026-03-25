import React, { useState } from 'react';
import { AuthClient } from './authClient';
import { useNavigate, Navigate } from 'react-router-dom';
import './LoginForm.css';
import { authService } from './authService';
import { useAuth } from './UseAuth.jsx';

function LoginForm() {
  const { login, isAuthenticated, user } = useAuth();
  
  // Si ya tiene sesión, redirigir según su rol
  if (isAuthenticated && user) {
    if (user.id_rol === 1 || user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.id_rol === 3 || user.role === 'barber') return <Navigate to="/barber" replace />;
    return <Navigate to="/" replace />;
  }

  // State for active view: 'login', 'register', 'forgot-password', 'verification'
  const [activeView, setActiveView] = useState('login');

  const [loginData, setLoginData] = useState({ usuario: '', contrasena: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    usuario: '',
    contrasena: '',
    prim_nombre: '',
    seg_nombre: '',
    apellido1: '',
    apellido2: '',
    telefono: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    codigo: '',
    newPassword: '',
    confirmarContrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [emailSolicitado, setEmailSolicitado] = useState('');
  const [usernameRecuperacion, setUsernameRecuperacion] = useState('');
  const navigate = useNavigate();

  // Navigation functions
  const switchToRegister = () => {
    setActiveView('register');
    setMessage({ text: '', type: '' });
  };

  const switchToLogin = () => {
    setActiveView('login');
    setMessage({ text: '', type: '' });
  };

  const showForgotPasswordForm = () => {
    setActiveView('forgot-password');
    setMessage({ text: '', type: '' });
  };

  const volverAEmail = () => {
    setActiveView('forgot-password');
    setMessage({ text: '', type: '' });
  };

  // Mostrar mensajes
  const mostrarMensaje = (text, type) => {
    setMessage({ text, type });
  };

  // Manejar login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    mostrarMensaje('Procesando login...', 'info');

    try {
      // Usar el login del contexto global en vez del authService directo
      const credenciales = { username: loginData.usuario, contrasena: loginData.contrasena };
      const data = await login(credenciales);

      mostrarMensaje('¡Login exitoso! Redirigiendo...', 'success');

      // Redirigir según el rol del usuario devuelto por la API
      setTimeout(() => {
        const userRole = data.user?.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'barber') {
          navigate('/barber');
        } else {
          navigate('/');
        }
      }, 1000);

    } catch (error) {
      // authService.login ya simplifica y arroja el string del mensaje
      mostrarMensaje('Error: ' + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    mostrarMensaje('Procesando registro...', 'info');

    // Validar campos obligatorios
    if (!registerData.prim_nombre || !registerData.apellido1) {
      mostrarMensaje('Por favor ingresa al menos el primer nombre y primer apellido', 'error');
      setLoading(false);
      return;
    }

    try {
      const formPayload = {
        username: registerData.usuario,
        password_hash: registerData.contrasena,
        email: registerData.email,
        prim_nombre: registerData.prim_nombre,
        seg_nombre: registerData.seg_nombre || '',
        apellido1: registerData.apellido1,
        apellido2: registerData.apellido2 || '',
        telefono: registerData.telefono || '',
        id_rol: 2, // Usuario común
        estado: true
      };

      const data = await authService.register(formPayload);

      mostrarMensaje('¡Registro exitoso! Ya puedes iniciar sesión', 'success');
      setTimeout(() => {
        switchToLogin();
      }, 1500);

    } catch (error) {
      mostrarMensaje('Error: ' + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Solicitar código de recuperación
  const handleSolicitarCodigo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    mostrarMensaje('Enviando código de verificación...', 'info');

    if (!forgotPasswordData.email) {
      mostrarMensaje('Por favor ingresa tu email', 'error');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.forgotPassword(forgotPasswordData.email);
      mostrarMensaje('✅ Código enviado a tu email', 'success');
      setEmailSolicitado(forgotPasswordData.email);
      setActiveView('verification');
    } catch (error) {
      mostrarMensaje('Error: ' + (error.message || 'No se pudo enviar el código'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verificar código y cambiar contraseña
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    mostrarMensaje('Verificando código...', 'info');

    if (!forgotPasswordData.codigo) {
      mostrarMensaje('Por favor ingresa el código de verificación', 'error');
      setLoading(false);
      return;
    }

    if (!forgotPasswordData.newPassword) {
      mostrarMensaje('Por favor ingresa la nueva contraseña', 'error');
      setLoading(false);
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmarContrasena) {
      mostrarMensaje('Las contraseñas no coinciden', 'error');
      setLoading(false);
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(
        emailSolicitado,
        forgotPasswordData.codigo,
        forgotPasswordData.newPassword
      );

      mostrarMensaje('¡Contraseña actualizada exitosamente!', 'success');
      setTimeout(() => {
        setForgotPasswordData({ email: '', codigo: '', newPassword: '', confirmarContrasena: '' });
        switchToLogin();
      }, 2000);
    } catch (error) {
      mostrarMensaje('Error: ' + (error.message || 'Código inválido o expirado'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Estilos para mensajes
  const messageStyles = {
    error: { background: 'rgba(255, 235, 238, 0.9)', color: '#c62828', border: '1px solid #ef5350' },
    success: { background: 'rgba(232, 245, 233, 0.9)', color: '#2e7d32', border: '1px solid #66bb6a' },
    info: { background: 'rgba(227, 242, 253, 0.9)', color: '#1565c0', border: '1px solid #42a5f5' }
  };

  return (
    <div className="login-form-container">
      <div className="simple-container">
        <div className="form-box">

          {/* Header del Formulario */}
          <h2 className="form-title">
            {activeView === 'login' && 'Iniciar Sesión'}
            {activeView === 'register' && 'Crear Cuenta'}
            {activeView === 'forgot-password' && 'Recuperar Contraseña'}
            {activeView === 'verification' && 'Verificación de Seguridad'}
          </h2>

          {/* Mensaje Global */}
          {message.text && (
            <div
              className="mensaje-login"
              style={{
                padding: '10px',
                margin: '10px 0',
                borderRadius: '5px',
                textAlign: 'center',
                fontWeight: 'bold',
                ...messageStyles[message.type]
              }}
            >
              {message.text}
            </div>
          )}

          {/* VISTA: LOGIN */}
          {activeView === 'login' && (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="text"
                  name="usuario"
                  placeholder="Ingrese su nombre de usuario"
                  required
                  className="form-input"
                  value={loginData.usuario}
                  onChange={(e) => setLoginData({ ...loginData, usuario: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="contrasena"
                  placeholder="Ingrese su contraseña"
                  required
                  className="form-input"
                  value={loginData.contrasena}
                  onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Procesando...' : 'Ingresar'}
              </button>

              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={showForgotPasswordForm}
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="switch-form">
                <p>¿No tienes cuenta?
                  <button type="button" className="switch-link" onClick={switchToRegister}>
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VISTA: REGISTRO */}
          {activeView === 'register' && (
            <form className="register-form" onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Ingrese su correo electrónico"
                  required
                  className="form-input"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="usuario"
                  placeholder="Nombre de usuario"
                  required
                  className="form-input"
                  value={registerData.usuario}
                  onChange={(e) => setRegisterData({ ...registerData, usuario: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <input
                    type="text"
                    name="prim_nombre"
                    placeholder="Primer nombre *"
                    required
                    className="form-input"
                    value={registerData.prim_nombre}
                    onChange={(e) => setRegisterData({ ...registerData, prim_nombre: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="form-group half">
                  <input
                    type="text"
                    name="seg_nombre"
                    placeholder="Segundo nombre"
                    className="form-input"
                    value={registerData.seg_nombre}
                    onChange={(e) => setRegisterData({ ...registerData, seg_nombre: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <input
                    type="text"
                    name="apellido1"
                    placeholder="Primer apellido *"
                    required
                    className="form-input"
                    value={registerData.apellido1}
                    onChange={(e) => setRegisterData({ ...registerData, apellido1: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="form-group half">
                  <input
                    type="text"
                    name="apellido2"
                    placeholder="Segundo apellido"
                    className="form-input"
                    value={registerData.apellido2}
                    onChange={(e) => setRegisterData({ ...registerData, apellido2: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="telefono"
                  placeholder="Teléfono"
                  className="form-input"
                  value={registerData.telefono}
                  onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="contrasena"
                  placeholder="Contraseña"
                  required
                  className="form-input"
                  value={registerData.contrasena}
                  onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Procesando...' : 'Registrar'}
              </button>

              <div className="switch-form">
                <p>¿Ya tienes cuenta?
                  <button type="button" className="switch-link" onClick={switchToLogin}>
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VISTA: RECUPERAR PASSWORD */}
          {activeView === 'forgot-password' && (
            <form className="forgot-password-form" onSubmit={handleSolicitarCodigo}>
              <div className="form-group">
                <p className="instruction-text">Ingrese su correo electrónico para recibir un código de verificación.</p>
                <input
                  type="email"
                  name="email"
                  placeholder="Ingrese su email registrado"
                  required
                  className="form-input"
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Enviando código...' : 'Enviar Código de Verificación'}
              </button>

              <div className="switch-form">
                <p>
                  <button type="button" className="switch-link" onClick={switchToLogin}>
                    Volver al login
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VISTA: VERIFICAR CODIGO */}
          {activeView === 'verification' && (
            <form className="verification-form" onSubmit={handleVerificarCodigo}>

              <div className="verification-header-inner">
                <p className="verification-subtitle">
                  Hemos enviado un código a: <strong>{emailSolicitado}</strong>
                </p>
                {usernameRecuperacion && (
                  <p className="user-info-text">Usuario: {usernameRecuperacion}</p>
                )}
              </div>

              <div className="form-group">
                <label className="code-label">Código de 6 dígitos</label>
                <input
                  type="text"
                  name="codigo"
                  placeholder="Ej: 123456"
                  required
                  maxLength="6"
                  className="code-input"
                  value={forgotPasswordData.codigo}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, codigo: e.target.value.replace(/\D/g, '') })}
                  disabled={loading}
                />
                <div className="code-hint">
                  ⏰ El código expira en 15 minutos
                </div>
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Nueva contraseña"
                  required
                  className="form-input"
                  value={forgotPasswordData.newPassword}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="confirmarContrasena"
                  placeholder="Confirmar nueva contraseña"
                  required
                  className="form-input"
                  value={forgotPasswordData.confirmarContrasena}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, confirmarContrasena: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="submit-btn verification-btn" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar y Cambiar Contraseña'}
              </button>

              <div className="verification-actions">
                <button
                  type="button"
                  className="back-btn"
                  onClick={volverAEmail}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Volver atrás
                </button>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleSolicitarCodigo}
                  disabled={loading}
                >
                  Reenviar código
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default LoginForm;