describe('Gestión de Barberos - Rol Admin', () => {
  beforeEach(() => {
    // Interceptar la autenticación
    cy.intercept('POST', '**/api/auth/check-token', {
      statusCode: 200,
      body: {
        user: {
          id_usuario: 1,
          userId: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          id_rol: 1,
          name: 'Administrador'
        }
      }
    }).as('checkTokenAdmin');

    // Mockear los datos de la API de barberos
    cy.intercept('GET', '**/api/barbers/**', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id_usuario: 1,
            prim_nombre: 'Carlos',
            apellido1: 'Rivera',
            email: 'carlos.rivera@example.com',
            telefono: '+1234567890',
            experiencia: 5,
            estado: true,
          },
          {
            id_usuario: 2,
            prim_nombre: 'María',
            apellido1: 'Rodríguez',
            email: 'maria.rodriguez@example.com',
            telefono: '+1987654321',
            experiencia: 3,
            estado: false,
          },
        ],
      },
    }).as('getBarbers');

    // Iniciar sesión como administrador
    cy.loginAsAdmin();
    cy.visit('/admin/barberos');
    cy.wait(800);
  });

  it('Debe cargar la vista y mostrar el listado de barberos', () => {
    cy.contains('Barberos').should('be.visible');
    cy.wait(600);
    cy.contains('Carlos Rivera').should('be.visible');
    cy.wait(600);
    cy.contains('María Rodríguez').should('be.visible');
    cy.wait(800);
  });

  it('Debe abrir el modal de Nuevo Barbero', () => {
    cy.contains('button', 'Nuevo Barbero').click();
    cy.wait(600);
    cy.contains('h3', 'Nuevo Barbero').should('be.visible');
    cy.get('input[name="prim_nombre"]').should('be.visible');
    cy.wait(800);
  });
});
