describe('Barbero - Agenda y Citas', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: {
        success: true,
        data: []
      }
    }).as('getAppointments');

    cy.loginAsBarber();
  });

  it('Debe cargar la vista del panel del barbero', () => {
    cy.visit('/barber/appointments');
    cy.get('body').should('be.visible');
  });
});
