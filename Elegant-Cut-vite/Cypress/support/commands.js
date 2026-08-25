// ***********************************************
// Custom Cypress Commands
// ***********************************************

Cypress.Commands.add('loginAs', (role = 'admin') => {
  cy.fixture('users').then((users) => {
    const user = users[role] || users.admin;
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"], input[name="username"]').first().clear().type(user.email);
    cy.get('input[type="password"], input[name="password"]').first().clear().type(user.password);
    cy.get('button[type="submit"]').click();
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginAs('admin');
});

Cypress.Commands.add('loginAsBarber', () => {
  cy.loginAs('barber');
});

Cypress.Commands.add('loginAsClient', () => {
  cy.loginAs('client');
});