describe('Barbero - Agenda y Citas', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/check-token', {
      statusCode: 200,
      body: {
        user: {
          id_usuario: 2,
          userId: 2,
          username: 'carlos',
          email: 'carlos.rivera@example.com',
          role: 'barber',
          id_rol: 3,
          name: 'Carlos Rivera'
        }
      }
    }).as('checkTokenBarber');

    cy.intercept('GET', '**/api/appointments*', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getAppointments');

    cy.loginAsBarber();
    cy.wait(3500);
    cy.visit('/barber/appointments');
    cy.wait(3500);
  });

  it('Debe cargar la vista del panel del barbero', () => {
    cy.url().should('include', '/barber');
    cy.get('body').should('be.visible');
    cy.wait(3500);
  });
});

