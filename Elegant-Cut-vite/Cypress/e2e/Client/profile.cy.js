describe('E2E Completo: Ciclo de vida - Rol Cliente', () => {
  const clientUser = {
    id_usuario: 3,
    userId: 3,
    username: 'cliente',
    email: 'cliente@example.com',
    role: 'client',
    id_rol: 2,
    name: 'Cliente'
  };

  beforeEach(() => {
    // Interceptar llamadas de autenticación y usuario
    cy.intercept('POST', '**/api/auth/check-token', {
      statusCode: 200,
      body: { user: clientUser }
    }).as('checkToken');

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { success: true, user: clientUser }
    }).as('loginRequest');

    cy.intercept('POST', '**/api/auth/logout', {
      statusCode: 200,
      body: { success: true, message: 'Sesión cerrada correctamente' }
    }).as('logoutRequest');

    cy.intercept('GET', '**/api/users/me', {
      statusCode: 200,
      body: {
        id_usuario: 3,
        userId: 3,
        username: 'cliente',
        email: 'cliente@example.com',
        prim_nombre: 'Cliente',
        apellido1: 'Prueba',
        telefono: '3001234567',
        rol: { nombre_rol: 'Cliente' },
        created_at: new Date().toISOString()
      }
    }).as('getMe');

    cy.intercept('GET', '**/api/appointments/user/*', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getUserAppointments');

    // Interceptar datos requeridos por la vista de inicio (Home)
    cy.intercept('GET', '**/api/barbers/public', {
      statusCode: 200,
      body: []
    }).as('getPublicBarbers');

    cy.intercept('GET', '**/api/reviews', {
      statusCode: 200,
      body: []
    }).as('getReviews');
  });

  it('Debe iniciar sesión, mostrar el index principal, navegar al perfil y cerrar sesión', () => {
    cy.fixture('users').then((users) => {
      const user = users.client;

      // ----------------------------------------------------
      // PASO 1: INICIO DE SESIÓN
      // ----------------------------------------------------
      cy.visit('/login');
      cy.wait(3500);

      cy.get('#login-usuario')
        .should('be.visible')
        .clear()
        .type(user.username || 'cliente', { delay: 60 });
      cy.wait(1500);

      cy.get('#login-contrasena')
        .should('be.visible')
        .clear()
        .type(user.password, { delay: 60 });
      cy.wait(2000);

      cy.get('button[type="submit"]')
        .should('be.enabled')
        .click();

      // ----------------------------------------------------
      // PASO 2: VISTA DEL INDEX PRINCIPAL (HOME)
      // ----------------------------------------------------
      cy.url({ timeout: 8000 }).should('satisfy', (url) => url.endsWith('/') || url.includes('/home'));
      
      // Validar que se cargue la cabecera y el contenido representativo del Home
      cy.contains('ELEGANTCUT', { timeout: 6000 }).should('be.visible');
      cy.contains(/Donde tu Estilo/i).should('be.visible');
      cy.get('#hero-cta-reservar').should('be.visible');

      // Validar saludo de bienvenida del cliente en el Header
      cy.get('.header-actions .header-welcome').should('be.visible').and('contain', 'Hola, Cliente');
      cy.wait(3500);

      // ----------------------------------------------------
      // PASO 3: NAVEGACIÓN Y VISTA DE PERFIL DE USUARIO
      // ----------------------------------------------------
      // Acceder al perfil desde las acciones del Header visibles
      cy.get('.header-actions').contains('button', /Perfil/i).should('be.visible').click();

      cy.url().should('include', '/perfil');
      cy.contains('Información Personal', { timeout: 8000 }).should('be.visible');

      // Validar datos cargados en el perfil
      cy.contains('Cliente Prueba').should('be.visible');
      cy.contains('@cliente').should('be.visible');
      cy.contains('cliente@example.com').should('be.visible');
      cy.contains('3001234567').should('be.visible');
      cy.wait(3500);

      // ----------------------------------------------------
      // PASO 4: CERRAR SESIÓN (LOGOUT)
      // ----------------------------------------------------
      // Clic en cerrar sesión desde las acciones rápidas del perfil o desde el Header
      cy.contains('.quick-actions button, .header-actions button', /Cerrar Sesión/i)
        .should('be.visible')
        .click();

      // Validar que la sesión finalice y redirija a login o inicio sin credenciales
      cy.url({ timeout: 6000 }).should('satisfy', (url) => url.includes('/login') || url.endsWith('/'));
      cy.wait(3500);
    });
  });
});


