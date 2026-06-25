import api from '../../lib/axios';
import React, { useState, useEffect } from 'react';
import { AuthClient } from '../../auth/authClient';

const SettingsTab = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [step, setStep] = useState('edit'); // 'edit', 'verify'

  // --- Profile State ---
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    prim_nombre: '',
    apellido1: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [initialData, setInitialData] = useState({});
  const [verificationCode, setVerificationCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState(null);

  // --- Reports State ---
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const storedUser = AuthClient.getUser() || {};
    setUser(storedUser);
    if (storedUser.id_usuario) {
      const initial = {
        username: storedUser.username || '',
        email: storedUser.email || '',
        prim_nombre: storedUser.prim_nombre || '',
        apellido1: storedUser.apellido1 || '',
        telefono: storedUser.telefono || ''
      };
      setFormData(prev => ({ ...prev, ...initial }));
      setInitialData(initial);
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/dashboard/reports');
      const data = response.data;
      if (data.success) setStats(data.data);
    } catch (e) { console.error(e); }
    finally { setLoadingStats(false); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Nueva Lógica Separada ---

  // 1. Validar Credenciales para Cambio de Contraseña
  const requestPasswordChange = async () => {
    if (!formData.confirmUsername || !formData.confirmEmail) {
      setMessage({ text: 'Debe confirmar su usuario y email para proceder.', type: 'error' });
      return;
    }

    if (formData.confirmUsername !== initialData.username || formData.confirmEmail !== initialData.email) {
      setMessage({ text: 'El usuario o email no coinciden con su perfil actual.', type: 'error' });
      return;
    }

    // Solicitar Código
    setLoading(true);
    try {
      const response = await api.post('/auth/solicitar-recuperacion', { email: formData.confirmEmail });
      const data = response.data;
      if (data.success) {
        setStep('verify');
        setMessage({ text: 'Código enviado a: ' + formData.confirmEmail, type: 'info' });
      } else {
        setMessage({ text: 'Error: ' + data.error, type: 'error' });
      }
    } catch (err) { setMessage({ text: 'Error de conexión', type: 'error' }); }
    finally { setLoading(false); }
  };

  const isSensitiveChange = () => {
    return (formData.username !== initialData.username);
  };

  const initiateUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    // Si hay cambios sensibles, pedir código
    if (isSensitiveChange()) {
      if (!formData.email) {
        setMessage({ text: 'Se requiere email para verificación', type: 'error' });
        return;
      }
      setLoading(true);
      try {
        const response = await api.post('/auth/solicitar-recuperacion', { email: formData.email });
        const data = response.data;
        if (data.success) {
          setStep('verify');
          setMessage({ text: 'Hemos enviado un código a tu correo: ' + formData.email, type: 'info' });
        } else {
          setMessage({ text: 'Error enviando código: ' + data.error, type: 'error' });
        }
      } catch (err) { setMessage({ text: 'Error de conexión', type: 'error' }); }
      finally { setLoading(false); }
    } else {
      // Actualización normal (sin credenciales)
      completeUpdate();
    }
  };

  const verifyAndSave = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // 1. Verificar Código
      const verifyResponse = await api.post('/auth/verify-code', { email: formData.confirmEmail, codigo: verificationCode });
      const verifyData = verifyResponse.data;

      if (verifyData.success) {
        // 2. Cambiar SOLO Contraseña
        await completeUpdate({ password: formData.password });
        setStep('edit');
        setVerificationCode('');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '', confirmUsername: '', confirmEmail: '' }));
      } else {
        setMessage({ text: verifyData.error || 'Código incorrecto', type: 'error' });
      }
    } catch (err) { setMessage({ text: 'Error verificando código', type: 'error' }); }
    finally { setLoading(false); }
  };

  const completeUpdate = async (overrideData = null) => {
    setLoading(true);
    try {
      const payload = overrideData || {
        username: formData.username,
        email: formData.email,
        prim_nombre: formData.prim_nombre,
        apellido1: formData.apellido1,
        telefono: formData.telefono
      };

      const response = await api.put(`/admin/administrators/${user.id_usuario}`, payload);

      const data = response.data;
      if (data.success) {
        setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
        const updatedUser = { ...user, ...formData };
        if (formData.password) delete updatedUser.password;
        delete updatedUser.confirmPassword;
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update initial data
        setInitialData({
          username: formData.username,
          email: formData.email,
          prim_nombre: formData.prim_nombre,
          apellido1: formData.apellido1,
          telefono: formData.telefono
        });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setMessage({ text: data.error || 'Error al actualizar', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="tab-header">
        <h2>Configuración</h2>
      </header>

      {/* Segmented Control — Dark */}
      <div className="ios-segmented-control">
        <button 
          className={`ios-segmented-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        <button 
          className={`ios-segmented-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reportes
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="ios-content">
          {message.text && (
            <div className={`ios-badge w-100 mb-3 text-center ${message.type === 'error' ? 'danger' : 'success'}`} style={{padding: '12px'}}>
              {message.text}
            </div>
          )}

          {step === 'edit' ? (
            <>
              <div className="ios-section-header">Información de la Cuenta</div>
              <div className="ios-list-group mb-4">
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Usuario</span>
                    <input type="text" className="ios-inline-input" name="username" value={formData.username} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Email</span>
                    <input type="email" className="ios-inline-input" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Nombre</span>
                    <input type="text" className="ios-inline-input" name="prim_nombre" value={formData.prim_nombre} onChange={handleChange} />
                  </div>
                </div>
                <div className="ios-list-item">
                  <div className="ios-item-content">
                    <span className="ios-item-subtitle">Apellido</span>
                    <input type="text" className="ios-inline-input" name="apellido1" value={formData.apellido1} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mb-5 pe-2">
                <button className="btn-ios px-4" onClick={initiateUpdate} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              <div className="ios-section-header">Seguridad y Acceso</div>
              <div className="ios-list-group">
                <div className="p-3 ios-item-subtitle" style={{fontSize: '0.85rem', borderBottom: '1px solid var(--ios-separator)'}}>
                  Para cambiar su contraseña, ingrese sus datos actuales para recibir un código de verificación.
                </div>
                <div className="ios-list-item">
                   <div className="ios-item-content">
                    <span className="ios-item-subtitle">Confirmar Usuario</span>
                    <input 
                      type="text" 
                      className="ios-inline-input" 
                      placeholder="Username actual"
                      value={formData.confirmUsername || ''} 
                      onChange={(e) => setFormData({ ...formData, confirmUsername: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="ios-list-item">
                   <div className="ios-item-content">
                    <span className="ios-item-subtitle">Confirmar Email</span>
                    <input 
                      type="email" 
                      className="ios-inline-input" 
                      placeholder="Email actual"
                      value={formData.confirmEmail || ''} 
                      onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })} 
                    />
                  </div>
                </div>
                <button 
                  className="ios-list-item w-100 border-0 text-danger fw-bold justify-content-center"
                  onClick={requestPasswordChange}
                  disabled={loading}
                  style={{background: 'transparent', cursor: 'pointer'}}
                >
                  {loading ? 'Procesando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </>
          ) : (
            <div className="ios-card text-center py-5">
              <i className="bi bi-shield-lock text-danger mb-3" style={{fontSize: '3rem'}}></i>
              <h4 className="ios-item-title mb-1">Verificación de Seguridad</h4>
              <p className="ios-item-subtitle mb-4">Ingresa el código enviado a tu correo.</p>

              <div className="mb-4">
                <input 
                  type="text" 
                  className="ios-search-bar text-center fs-2 fw-bold" 
                  style={{maxWidth: '220px', letterSpacing: '6px'}} 
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>

              <div className="ios-section-header text-start mt-4">Nuevas Credenciales</div>
              <div className="ios-list-group mb-4 text-start">
                 <div className="ios-list-item">
                    <input 
                      type="password" 
                      className="ios-inline-input" 
                      placeholder="Nueva Contraseña" 
                      name="password" value={formData.password} onChange={handleChange} 
                    />
                 </div>
                 <div className="ios-list-item">
                    <input 
                      type="password" 
                      className="ios-inline-input" 
                      placeholder="Confirmar Nueva Contraseña" 
                      name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} 
                    />
                 </div>
              </div>

              <div className="d-flex flex-column gap-2 px-4">
                <button className="btn-ios w-100 py-3" onClick={verifyAndSave}>Guardar Nueva Contraseña</button>
                <button className="btn-ios-secondary w-100" onClick={() => setStep('edit')}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="ios-content">
           <div className="ios-section-header">Resumen de Clientes</div>
           <div className="ios-widget-grid">
              <div className="ios-widget">
                 <h4 className="text-muted small">MES ACTUAL</h4>
                 <p className="value" style={{color: 'var(--ios-blue)'}}>{stats?.newClientsCurrentMonth || 0}</p>
                 <span className="ios-item-subtitle">Nuevos registros</span>
              </div>
              <div className="ios-widget">
                 <h4 className="text-muted small">MES PASADO</h4>
                 <p className="value text-secondary">{stats?.newClientsLastMonth || 0}</p>
                 <span className="ios-item-subtitle">Comparativa mensual</span>
              </div>
              <div className="ios-widget" style={{backgroundColor: 'var(--ios-red)', color: 'white'}}>
                 <h4 className="text-white-50 small">TOTAL ACTIVOS</h4>
                 <p className="value text-white">{stats?.totalActiveClients || 0}</p>
                 <span className="text-white-50">Clientes actuales</span>
              </div>
           </div>

           <div className="ios-section-header mt-4">Predicción y Análisis</div>
           <div className="ios-card mt-2">
              <h5 className="ios-item-title mb-2">Estado del Crecimiento</h5>
              <p className="ios-item-subtitle mb-0">
                Tu base de datos de clientes activos es de {stats?.totalActiveClients || 0}. 
                El flujo de nuevos registros se mantiene constante.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};
export default SettingsTab;