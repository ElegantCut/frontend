import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './authService';
import { useAuth } from './UseAuth.jsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Eye, EyeOff, Mail, Sparkles, ArrowLeft, Send, KeyRound, ShieldCheck } from 'lucide-react';

// ─── EyeBall Component ─────────────────────────────────────────────────────────
const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = 'black',
  isBlinking = false,
  forceLookX,
  forceLookY,
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const pos = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

// ─── Pupil (no white) ──────────────────────────────────────────────────────────
const Pupil = ({ size = 12, maxDistance = 5, pupilColor = 'black', forceLookX, forceLookY }) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;
    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const pos = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

// ─── Main LoginForm ─────────────────────────────────────────────────────────────
function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── View State ──────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState('login'); // login | register | forgot-password | verification

  // ── Form Data ───────────────────────────────────────────────────────────────
  const [loginData, setLoginData] = useState({ usuario: '', contrasena: '' });
  const [registerData, setRegisterData] = useState({
    email: '', usuario: '', contrasena: '', prim_nombre: '',
    seg_nombre: '', apellido1: '', apellido2: '', telefono: '',
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '', codigo: '', newPassword: '', confirmarContrasena: '',
  });
  {/*función de recordar contraseña dejamos false por buena práctica uwu */ }
  const [rememberMe, setRememberMe] = useState(false);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [emailSolicitado, setEmailSolicitado] = useState('');
  const [usernameRecuperacion, setUsernameRecuperacion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ── Character Animation State ───────────────────────────────────────────────
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  // ── Mouse Tracking ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ── Purple blinking ─────────────────────────────────────────────────────────
  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // ── Black blinking ──────────────────────────────────────────────────────────
  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // ── Look-at-each-other when typing starts ───────────────────────────────────
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // ── Purple peeking when password is visible ─────────────────────────────────
  useEffect(() => {
    const pwd = activeView === 'login' ? loginData.contrasena : registerData.contrasena;
    if (pwd.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    } else {
      setIsPurplePeeking(false);
    }
  }, [loginData.contrasena, registerData.contrasena, showPassword, isPurplePeeking, activeView]);

  // ── Character position helper ───────────────────────────────────────────────
  const calculatePosition = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  // ── Get the current password for animation logic ────────────────────────────
  const currentPassword = activeView === 'login' ? loginData.contrasena : registerData.contrasena;
  const isPasswordVisible = currentPassword.length > 0 && showPassword;
  const isPasswordHidden = currentPassword.length > 0 && !showPassword;

  // ── View Navigation ─────────────────────────────────────────────────────────
  const switchToRegister = () => { setActiveView('register'); setMessage({ text: '', type: '' }); setShowPassword(false); };
  const switchToLogin = () => { setActiveView('login'); setMessage({ text: '', type: '' }); setShowPassword(false); };
  const showForgotPasswordForm = () => { setActiveView('forgot-password'); setMessage({ text: '', type: '' }); };
  const volverAEmail = () => { setActiveView('forgot-password'); setMessage({ text: '', type: '' }); };
  const mostrarMensaje = (text, type) => setMessage({ text, type });

  // ── Handlers ────────────────────────────────────────────────────────────────
  {/*Acá cree la funcion de las alertas con el btón de google*/ }

  const handleGoogleLogin = () => {
    const isGoogleAvailable = false;
    if (isGoogleAvailable) {
      mostrarMensaje('Login exitosamente con google', 'success');
    } else {
      mostrarMensaje('El botón no está disponible en este momento', 'error');
    }

  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    mostrarMensaje('', '');
    try {
      {/*Esta función hace que que se guarde la llave uwu y que me recuerde mis huevonadas jaja */ }
      const data = await login({ username: loginData.usuario, contrasena: loginData.contrasena }, rememberMe);
      mostrarMensaje('¡Login exitoso! Redirigiendo...', 'success');
      setTimeout(() => {
        const role = data.user?.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'barber') navigate('/barber');
        else navigate('/');
      }, 1000);
    } catch (error) {
      mostrarMensaje('Credenciales inválidas. Intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.prim_nombre || !registerData.apellido1) {
      mostrarMensaje('Ingresa al menos tu primer nombre y primer apellido.', 'error');
      return;
    }
    setLoading(true);
    mostrarMensaje('', '');
    try {
      await authService.register({
        username: registerData.usuario,
        password_hash: registerData.contrasena,
        email: registerData.email,
        prim_nombre: registerData.prim_nombre,
        seg_nombre: registerData.seg_nombre || '',
        apellido1: registerData.apellido1,
        apellido2: registerData.apellido2 || '',
        telefono: registerData.telefono || '',
        id_rol: 2,
        estado: true,
      });
      mostrarMensaje('¡Registro exitoso! Ya puedes iniciar sesión.', 'success');
      setTimeout(switchToLogin, 1500);
    } catch (error) {
      mostrarMensaje('Error: ' + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarCodigo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!forgotPasswordData.email) { mostrarMensaje('Por favor ingresa tu email.', 'error'); return; }
    setLoading(true);
    mostrarMensaje('', '');
    try {
      await authService.forgotPassword(forgotPasswordData.email);
      mostrarMensaje('✅ Código enviado a tu email.', 'success');
      setEmailSolicitado(forgotPasswordData.email);
      setActiveView('verification');
    } catch (error) {
      mostrarMensaje('Error: ' + (error.message || 'No se pudo enviar el código.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    if (!forgotPasswordData.codigo) { mostrarMensaje('Ingresa el código de verificación.', 'error'); return; }
    if (!forgotPasswordData.newPassword) { mostrarMensaje('Ingresa la nueva contraseña.', 'error'); return; }
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmarContrasena) {
      mostrarMensaje('Las contraseñas no coinciden.', 'error'); return;
    }
    if (forgotPasswordData.newPassword.length < 6) {
      mostrarMensaje('La contraseña debe tener al menos 6 caracteres.', 'error'); return;
    }
    setLoading(true);
    mostrarMensaje('', '');
    try {
      await authService.resetPassword(emailSolicitado, forgotPasswordData.codigo, forgotPasswordData.newPassword);
      mostrarMensaje('¡Contraseña actualizada exitosamente!', 'success');
      setTimeout(() => {
        setForgotPasswordData({ email: '', codigo: '', newPassword: '', confirmarContrasena: '' });
        switchToLogin();
      }, 2000);
    } catch (error) {
      mostrarMensaje('Error: ' + (error.message || 'Código inválido o expirado.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT: Characters Panel ──────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)' }}
      >
        {/* Brand */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <span>Elegant Cut</span>
        </div>

        {/* Characters Stage */}
        <div className="relative z-20 flex flex-1 items-center justify-center mt-12" style={{ minHeight: '420px' }}>
          <div className="relative" style={{ width: '550px', height: '400px' }}>

            {/* Purple — back layer */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || isPasswordHidden) ? '440px' : '400px',
                backgroundColor: '#FFD700', /* Gold */
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: isPasswordVisible
                  ? 'skewX(0deg)'
                  : (isTyping || isPasswordHidden)
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: isPasswordVisible ? '20px' : isLookingAtEachOther ? '55px' : `${45 + purplePos.faceX}px`,
                  top: isPasswordVisible ? '35px' : isLookingAtEachOther ? '65px' : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={isPasswordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={isPasswordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={isPasswordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={isPasswordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Black — middle layer */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                backgroundColor: '#F4F4F4', /* White */
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: isPasswordVisible
                  ? 'skewX(0deg)'
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || isPasswordHidden)
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: isPasswordVisible ? '10px' : isLookingAtEachOther ? '32px' : `${26 + blackPos.faceX}px`,
                  top: isPasswordVisible ? '28px' : isLookingAtEachOther ? '12px' : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="#1A1A1A" pupilColor="#F4F4F4"
                  isBlinking={isBlackBlinking}
                  forceLookX={isPasswordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={isPasswordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="#1A1A1A" pupilColor="#F4F4F4"
                  isBlinking={isBlackBlinking}
                  forceLookX={isPasswordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={isPasswordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Orange semi-circle — front left */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                backgroundColor: '#BC2041',
                borderRadius: '120px 120px 0 0',
                transform: isPasswordVisible ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: isPasswordVisible ? '50px' : `${82 + (orangePos.faceX || 0)}px`,
                  top: isPasswordVisible ? '85px' : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
                  forceLookX={isPasswordVisible ? -5 : undefined}
                  forceLookY={isPasswordVisible ? -4 : undefined}
                />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D"
                  forceLookX={isPasswordVisible ? -5 : undefined}
                  forceLookY={isPasswordVisible ? -4 : undefined}
                />
              </div>
            </div>

            {/* Yellow capsule — front right */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                backgroundColor: '#2A2A2A', /* Dark Gray */
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: isPasswordVisible ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: isPasswordVisible ? '20px' : `${52 + (yellowPos.faceX || 0)}px`,
                  top: isPasswordVisible ? '35px' : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#F4F4F4"
                  forceLookX={isPasswordVisible ? -5 : undefined}
                  forceLookY={isPasswordVisible ? -4 : undefined}
                />
                <Pupil size={12} maxDistance={5} pupilColor="#F4F4F4"
                  forceLookX={isPasswordVisible ? -5 : undefined}
                  forceLookY={isPasswordVisible ? -4 : undefined}
                />
              </div>
              {/* Mouth */}
              <div
                className="absolute rounded-full transition-all duration-200 ease-out"
                style={{
                  width: '80px',
                  height: '4px',
                  backgroundColor: '#F4F4F4',
                  left: isPasswordVisible ? '10px' : `${40 + (yellowPos.faceX || 0)}px`,
                  top: isPasswordVisible ? '88px' : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>



        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </div>

      {/* ── RIGHT: Form Panel ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background, #09090b)' }}>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12 text-white">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ backgroundColor: 'rgba(108,63,245,0.2)' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#6C3FF5' }} />
            </div>
            <span>Elegant Cut</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
              {activeView === 'login' && 'Bienvenido de nuevo'}
              {activeView === 'register' && 'Crear cuenta'}
              {activeView === 'forgot-password' && 'Cambia tu contraseña'}
              {activeView === 'verification' && 'Check your email'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground, #a1a1aa)' }}>
              {activeView === 'login' && ''}
              {activeView === 'register' && 'Fill in your information to get started'}
              {activeView === 'forgot-password' && "We'll send a verification code to your email"}
              {activeView === 'verification' && `We sent a code to ${emailSolicitado}`}
            </p>
          </div>

          {/* ── Message Banner ── */}
          {message.text && (
            <div className={`p-4 text-sm rounded-lg mb-5 border ${message.type === 'error'
              ? 'text-[#842029] bg-[#f8d7da] border-[#f5c2c7]'
              : message.type === 'success'
                ? 'text-[#0f5132] bg-[#d1e7dd] border-[#badbcc]'
                : 'text-[#055160] bg-[#cff4fc] border-[#b6effb]'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* LOGIN FORM                                                        */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeView === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-usuario" className="text-sm font-medium text-white/90">
                  Nombre de usuario
                </Label>
                <Input
                  id="login-usuario"
                  type="text"
                  placeholder="Ingresa tu nombre de usuario"
                  value={loginData.usuario}
                  autoComplete="off"
                  onChange={(e) => setLoginData({ ...loginData, usuario: e.target.value })}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  disabled={loading}
                  className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="login-contrasena" className="text-sm font-medium text-white/90">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="login-contrasena"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginData.contrasena}
                    onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
                    required
                    disabled={loading}
                    className="h-12 pr-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-neutral-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  <Checkbox id="remember" className="border-neutral-500 w-5 h-5 rounded data-[state=checked]:bg-white data-[state=checked]:text-black"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe} />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-white/80 select-none">
                    Recuerdame por 30 días
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={showForgotPasswordForm}
                  className="text-sm font-medium text-white/90 hover:text-white hover:underline transition-all"
                >
                  Olvidate tú contraseña?
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <Button type="submit" className="w-full h-12 text-base font-medium bg-white text-black hover:bg-neutral-200 rounded-lg transition-all" size="lg" disabled={loading}>
                  {loading ? 'Signing in...' : 'Iniciar sesión'}
                </Button>

                {/*Acá puse el botón de google y el onclick hace las funciones que programé de las alertas uwu :3*/}

                <button onClick={handleGoogleLogin}
                  type='button' className='flex items-center justify-center gap-3 w-full h-12 bg-white  text-black font-medium hover:bg-gray-300 transition-colors cursor-pointer rounded-full'>


                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>

                  <span> Continuar con google</span>
                </button>
              </div>

              <div className="text-center text-sm mt-2 text-neutral-400">
                No tienes una cuenta?{' '}
                <button type="button" onClick={switchToRegister} className="font-medium text-white hover:underline transition-all ml-1">
                  Registrate
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* REGISTER FORM                                                     */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeView === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-white/90">Nombre de usuario</Label>
                  <Input placeholder="Nombre de usuario " value={registerData.usuario}
                    onChange={(e) => setRegisterData({ ...registerData, usuario: e.target.value })}
                    required disabled={loading} className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4"
                    onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-white/90">Email</Label>
                  <Input type="email" placeholder="Email" value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required disabled={loading} className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-white/90">Primer nombre </Label>
                  <Input placeholder="Primer Nombre " value={registerData.prim_nombre}
                    onChange={(e) => setRegisterData({ ...registerData, prim_nombre: e.target.value })}
                    required disabled={loading} className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-white/90">Segundo nombre </Label>
                  <Input placeholder="Segundo Nombre" value={registerData.apellido1}
                    onChange={(e) => setRegisterData({ ...registerData, apellido1: e.target.value })}
                    required disabled={loading} className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/90">Teléfono</Label>
                <Input type="tel" placeholder="Número de teléfono" value={registerData.telefono}
                  onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                  disabled={loading} className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4" />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/90">Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerData.contrasena}
                    onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                    required disabled={loading} className="h-12 pr-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-neutral-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium bg-white text-black hover:bg-neutral-200 mt-2 rounded-lg transition-all" size="lg" disabled={loading}>
                {loading ? 'Creating account...' : 'Crear cuenta'}
              </Button>

              <div className="text-center text-sm mt-4 text-neutral-400">
                Ya tienes una cuenta?{' '}
                <button type="button" onClick={switchToLogin} className="font-medium text-white hover:underline ml-1 transition-all">
                  Iniciar sesión
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* FORGOT PASSWORD                                                   */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeView === 'forgot-password' && (
            <form onSubmit={handleSolicitarCodigo} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/90">Email Address</Label>
                <Input
                  type="email"
                  placeholder="Ingresa tu correo para tú código"
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                  required disabled={loading} className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium bg-white text-black hover:bg-neutral-200 mt-2 rounded-lg transition-all" size="lg" disabled={loading}>
                <Send className="mr-2 w-4 h-4" />
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white hover:underline transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* VERIFICATION                                                      */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeView === 'verification' && (
            <form onSubmit={handleVerificarCodigo} className="flex flex-col gap-6">
              {usernameRecuperacion && (
                <p className="text-center text-sm font-medium" style={{ color: '#6C3FF5' }}>
                  Usuario: {usernameRecuperacion}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/90">Código de 6 dígitos</Label>
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={forgotPasswordData.codigo}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, codigo: e.target.value.replace(/\D/g, '') })}
                  required disabled={loading}
                  className="h-12 text-center text-xl tracking-widest font-bold bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg"
                />
                <p className="text-xs text-center text-neutral-400 mt-1">
                  El código expira en 6 minutos
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/90">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={forgotPasswordData.newPassword}
                    onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                    required disabled={loading} className="h-12 pr-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-all">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/90">Confirmar Contraseña</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotPasswordData.confirmarContrasena}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, confirmarContrasena: e.target.value })}
                  required disabled={loading} className="h-12 bg-transparent border-neutral-800 focus-visible:ring-1 focus-visible:border-white text-white rounded-lg px-4"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium bg-white text-black hover:bg-neutral-200 mt-2 rounded-lg transition-all" size="lg" disabled={loading}>
                <ShieldCheck className="mr-2 w-4 h-4" />
                {loading ? 'Verifying...' : 'Verify & Change Password'}
              </Button>

              <div className="flex justify-between items-center mt-2">
                <button type="button" onClick={volverAEmail} disabled={loading}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white hover:underline transition-all">
                  <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <button type="button" onClick={handleSolicitarCodigo} disabled={loading}
                  className="text-sm font-medium hover:underline transition-all"
                  style={{ color: '#6C3FF5' }}>
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