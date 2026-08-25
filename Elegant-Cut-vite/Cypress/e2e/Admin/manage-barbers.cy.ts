describe('Gestión de Barberos', () => {
  beforeEach(() => {
    // Mockear los datos iniciales de los barberos
    cy.intercept('GET', '**/barbers*', {
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
  });

  it('Debe cargar la vista de gestión de barberos', () => {
    cy.get('body').should('be.visible');
  });
});
