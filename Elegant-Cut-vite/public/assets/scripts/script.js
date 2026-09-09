// script.js
function switchToRegister() {
    const book = document.querySelector('.book');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    
    // Activar la animación de flip
    book.classList.add('flipped');
    
    // Cambiar las páginas activas después de un breve delay
    setTimeout(() => {
        loginPage.classList.remove('active');
        registerPage.classList.add('active');
    }, 400); // Mitad del tiempo de la animación (0.8s / 2)
}

function switchToLogin() {
    const book = document.querySelector('.book');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    
    // Remover el flip para volver a la página inicial
    book.classList.remove('flipped');
    
    // Cambiar las páginas activas después de un breve delay
    setTimeout(() => {
        registerPage.classList.remove('active');
        loginPage.classList.add('active');
    }, 400); // Mitad del tiempo de la animación (0.8s / 2)
}

// Manejo del envío de formularios
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    
    // Manejar envío del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usuario = this.querySelector('input[name="usuario"]').value;
            const contrasena = this.querySelector('input[name="contrasena"]').value;
            
            // Aquí va tu lógica de autenticación
            console.log('Login attempt:', { usuario, contrasena });
            
            // Ejemplo de validación básica
            if (usuario && contrasena) {
                alert('Inicio de sesión exitoso (simulado)');
                // window.location.href = 'dashboard.html'; // Redirigir al dashboard
            } else {
                alert('Por favor completa todos los campos');
            }
        });
    }
    
    // Manejar envío del formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[name="email"]').value;
            const usuario = this.querySelector('input[name="usuario"]').value;
            const contrasena = this.querySelector('input[name="contrasena"]').value;
            
            // Aquí va tu lógica de registro
            console.log('Register attempt:', { email, usuario, contrasena });
            
            // Ejemplo de validación básica
            if (email && usuario && contrasena) {
                alert('Registro exitoso (simulado)');
                // Cambiar a página de login después del registro
                setTimeout(() => {
                    switchToLogin();
                }, 1300);
            } else {
                alert('Por favor completa todos los campos');
            }
        });
    }
    
    // Prevenir el comportamiento por defecto de los enlaces
    document.querySelectorAll('.switch-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
});