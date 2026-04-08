import api from '../lib/axios';

export class AuthClient {

  // FUNCIÓN: Registro - ACTUALIZADO
  static async register(registerData) {
    try {
      console.log('Enviando registro al servidor...');

      const response = await api.post('/auth/register', registerData);
      const data = response.data;

      console.log(' Respuesta del servidor (registro):', data);

      if (data.success) {
        // Guardar datos del usuario (el token ya está en la cookie HttpOnly)
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log(' Registro exitoso!');
        return { success: true, user: data.user };
      } else {
        console.log(' Error en registro:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.log(' Error de conexión:', error);
      return { success: false, error: 'No se pudo conectar al servidor' };
    }
  }

  // Subir foto de perfil
  static async uploadProfilePhoto(formData) {
    try {
      const response = await api.post('/users/profile-photo', formData);

      const data = response.data;

      if (data.success) {
        // Actualizar datos locales del usuario con la nueva foto
        const userData = this.getUser();
        if (userData) {
          userData.photoUrl = data.photoUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        return { success: true, photoUrl: data.photoUrl };
      } else {
        return { success: false, error: data.message || 'Error al subir imagen' };
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Función para hacer login
  static async login(username, password) {
    try {
      console.log('📞 Enviando login al servidor...');

      const response = await api.post('/auth/login', { username, password });
      const data = response.data;

      console.log('📨 Respuesta del servidor:', data);

      if (data.success) {
        // Guardar solo los datos del usuario (el token está en la cookie)
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('✅ Login exitoso!');
        return { success: true, user: data.user };
      } else {
        console.log('❌ Error en login:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.log('🚨 Error de conexión:', error);
      return { success: false, error: 'No se pudo conectar al servidor' };
    }
  }

  // ✅ NUEVO: Solicitar código de recuperación por email
  static async solicitarRecuperacion(email) {
    try {
      console.log('📧 Solicitando código de recuperación para:', email);

      // Usar el endpoint real del backend: /auth/forgot-password
      const response = await api.post('/auth/forgot-password', { email });
      const data = response.data;

      console.log('📨 Respuesta del servidor (forgot-password):', data);

      return {
        success: true,
        message: data.message || 'Se ha enviado un código a tu correo.'
      };
    } catch (error) {
      console.log('🚨 Error de conexión:', error);
      return { success: false, error: error.response?.data?.message || 'No se pudo conectar al servidor' };
    }
  }

  // ✅ NUEVO: Verificar código y cambiar contraseña
  static async verificarCodigoRecuperacion(email, codigo, nuevaContrasena) {
    try {
      console.log('🔐 Verificando código para:', email);

      // Usar el endpoint real del backend: /auth/reset-password (PUT)
      const response = await api.put('/auth/reset-password', { 
        email, 
        codigo, 
        newPassword: nuevaContrasena 
      });
      const data = response.data;

      console.log('📨 Respuesta del servidor (reset-password):', data);

      if (data.success) {
        console.log('✅ Contraseña cambiada exitosamente!');
        return { success: true, message: data.message };
      } else {
        console.log('❌ Error verificando código:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.log('🚨 Error de conexión:', error);
      return { success: false, error: error.response?.data?.message || 'Error al cambiar contraseña' };
    }
  }

  // ✅ MANTENER: Olvidar contraseña (método antiguo por compatibilidad)
  static async forgotPassword(username, newPassword) {
    try {
      console.log('📞 Recuperando contraseña para:', username);

      const response = await api.post('/auth/forgot-password', { username, newPassword });
      const data = response.data;

      console.log('📨 Respuesta del servidor (forgot-password):', data);

      if (data.success) {
        console.log('✅ Contraseña recuperada!');
        return { success: true, message: data.message };
      } else {
        console.log('❌ Error recuperando contraseña:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.log('🚨 Error de conexión:', error);
      return { success: false, error: 'No se pudo conectar al servidor' };
    }
  }

  // ✅ MANTENER: Actualizar contraseña (por compatibilidad)
  static async updatePassword(username, newPassword) {
    try {
      console.log('📞 Actualizando contraseña para:', username);

      const response = await api.post('/auth/forgot-password', { username, newPassword });
      const data = response.data;

      console.log('📨 Respuesta del servidor (update-password):', data);

      if (data.success) {
        console.log('✅ Contraseña actualizada!');
        return { success: true, message: data.message };
      } else {
        console.log('❌ Error actualizando contraseña:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.log('🚨 Error de conexión:', error);
      return { success: false, error: 'No se pudo conectar al servidor' };
    }
  }

  // Función para cerrar sesión
  static async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    }
    localStorage.removeItem('user');
    console.log('👋 Sesión cerrada');
  }

  // Obtener token (Ya no es posible con HttpOnly)
  static getToken() {
    return null; 
  }

  // Obtener datos del usuario
  static getUser() {
    const userData = localStorage.getItem('user');
    if (userData && userData !== 'undefined' && userData !== 'null') {
      try { return JSON.parse(userData); } catch(e) {}
    }
    return null;
  }

  // Verificar si está logueado (Aproximación basada en datos de usuario locales)
  static isLoggedIn() {
    return this.getUser() !== null;
  }

  // Verificar si es admin
  static isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  // Verificar si es barbero
  static isBarber() {
    const user = this.getUser();
    return user && (user.role === 'barbero' || user.role === 'barber');
  }

  // Verificar si es cliente
  static isClient() {
    const user = this.getUser();
    return user && user.role === 'cliente';
  }

  // Verificar si el token es válido
  static async isTokenValid() {
    try {
      const response = await api.post('/auth/check-token');
      return response.data.success || response.data.id !== undefined;
    } catch (error) {
      return false;
    }
  }
}