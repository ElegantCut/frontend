// login.js - Manejo de login con JWT
document.addEventListener('DOMContentLoaded', function () {
    // Manejar el formulario de login
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Evitar envío normal del formulario

            // Obtener datos del formulario
            const formData = new FormData(loginForm);
            const username = formData.get('usuario');
            const password = formData.get('contrasena');

            // Mostrar mensaje de carga
            mostrarMensaje('Procesando login...', 'info');

            try {
                // Enviar petición al servidor JWT
                const respuesta = await fetch('http://localhost:3000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });

                const datos = await respuesta.json();

                if (datos.success) {
                    // Login exitoso - guardar token y redirigir
                    localStorage.setItem('jwt_token', datos.token);
                    localStorage.setItem('user_data', JSON.stringify(datos.user));

                    mostrarMensaje('¡Login exitoso! Redirigiendo...', 'success');

                    //  REDIRECCIÓN SEGÚN ROL 
                    setTimeout(() => {
                        if (datos.user.role === 'admin') {
                            window.location.href = '../page/admin.html'; // Admin va a admin.html
                        } else {
                            window.location.href = '../page/index.html'; // Usuarios van a index.html
                        }
                    }, 1000);
                    //  HASTA AQUÍ 

                } else {
                    // Login fallido
                    mostrarMensaje('Error: ' + datos.error, 'error');
                }

            } catch (error) {
                mostrarMensaje('Error de conexión: ' + error.message, 'error');
            }
        });
    }

    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, tipo) {
        // Eliminar mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.mensaje-login');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        // Crear nuevo mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `mensaje-login mensaje-${tipo}`;
        mensajeDiv.textContent = mensaje;
        mensajeDiv.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            ${tipo === 'error' ? 'background: #ffebee; color: #c62828; border: 1px solid #f44336;' : ''}
            ${tipo === 'success' ? 'background: #e8f5e8; color: #2e7d32; border: 1px solid #4caf50;' : ''}
            ${tipo === 'info' ? 'background: #e3f2fd; color: #1565c0; border: 1px solid #2196f3;' : ''}
        `;

        // Insertar después del formulario
        const formBox = document.querySelector('.form-box');
        formBox.appendChild(mensajeDiv);
    }
});