describe('Cliente - Perfil', () => {
  beforeEach(() => {
    cy.loginAsClient();
  });

  it('Debe cargar la vista de perfil de usuario', () => {
    cy.visit('/perfil');
    cy.get('body').should('be.visible');
  });
});
