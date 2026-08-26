describe('E2E Completo: Ciclo de vida - Rol Cliente', () => {
  beforeEach(() => {
    const clientUser = {
      id_usuario: 3,
      userId: 3,
      username: 'cliente',
      email: 'cliente@example.com',
      role: 'client',
      id_rol: 2,
      name: 'Cliente'
    };

    // Interceptar llamadas de autenticación y recursos
    cy.intercept('POST', '**/api/auth/check-token', {
      statusCode: 200,
      body: { user: clientUser }
    }).as('checkToken');

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { success: true, user: clientUser }
    }).as('loginRequest');

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
  });

  it('Debe iniciar sesión, recorrer las vistas del cliente y cerrar sesión', () => {
    cy.fixture('users').then((users) => {
      const user = users.client;

      // ----------------------------------------------------
      // PASO 1: INICIO DE SESIÓN
      // ----------------------------------------------------
      cy.visit('/login');
      cy.get('#login-usuario')
        .should('be.visible')
        .clear()
        .type(user.username || 'cliente', { delay: 40 });

      cy.get('#login-contrasena')
        .should('be.visible')
        .clear()
        .type(user.password, { delay: 40 });

      cy.get('button[type="submit"]')
        .should('be.enabled')
        .click();

      // Validar que redirige al home tras el login
      cy.url({ timeout: 6000 }).should('not.include', '/login');

      // ----------------------------------------------------
      // PASO 2: NAVEGACIÓN - VISTA DE AGENDAR CITA
      // ----------------------------------------------------
      cy.visit('/Form_agenda');
      cy.url().should('include', '/Form_agenda');
      cy.get('body').should('be.visible');

      // ----------------------------------------------------
      // PASO 3: NAVEGACIÓN - VISTA DE PERFIL
      // ----------------------------------------------------
      cy.visit('/perfil');
      cy.url().should('include', '/perfil');
      cy.contains('Información Personal', { timeout: 8000 }).should('be.visible');

      // ----------------------------------------------------
      // PASO 4: CERRAR SESIÓN
      // ----------------------------------------------------
      cy.get('button[aria-label="Cerrar sesión"], button.action-btn.danger')
        .first()
        .should('be.visible')
        .click();

      // Validar salida
      cy.url().should('satisfy', (url) => url.includes('/login') || url.endsWith('/'));
    });
  });
});
