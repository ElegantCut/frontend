/// <reference types="cypress" />

Cypress.Commands.add('loginAs', (role = 'admin') => {
  cy.fixture('users').then((users) => {
    const user = users[role] || users.admin;

    // Interceptar llamadas de auth para garantizar que pasen en local sin caídas de backend
    cy.intercept('POST', '**/api/auth/check-token', {
      statusCode: 200,
      body: { user }
    }).as('checkToken');

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { success: true, user }
    }).as('loginRequest');

    cy.visit('/login');
    cy.wait(400);
    cy.get('input#login-usuario, input[name="username"], input[name="email"]')
      .first()
      .clear()
      .type(user.username || user.email, { delay: 40 });
    cy.wait(200);
    cy.get('#login-contrasena')
      .clear()
      .type(user.password, { delay: 40 });
    cy.wait(200);
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