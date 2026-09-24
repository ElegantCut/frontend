describe('Radicar PQRS - Rol Cliente', () => {
  const clientUser = {
    id_usuario: 3,
    userId: 3,
    username: 'cliente',
    email: 'cliente@example.com',
    role: 'client',
    id_rol: 2,
    name: 'Cliente Prueba'
  };

  beforeEach(() => {
    // Interceptar llamadas de autenticación para asegurar sesión activa del cliente
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
        ...clientUser,
        prim_nombre: 'Cliente',
        apellido1: 'Prueba',
        telefono: '3001234567',
        rol: { nombre_rol: 'Cliente' },
        identificacion: '1010101010'
      }
    }).as('getMe');

    // POST de creación de PQRS
    cy.intercept('POST', '**/api/pqrs', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          radicado: 'PQRS-2026-00123',
          message: 'PQRS creada con éxito'
        }
      });
    }).as('createPqrs');
  });

  it('Debe iniciar sesión, ir a la vista de PQRS, llenar el formulario, aceptar términos y enviarlo', () => {
    // PASO 1: INICIAR SESIÓN COMO CLIENTE
    cy.loginAsClient();
    cy.wait(3500);

    // PASO 2: NAVEGAR A LA VISTA DE PQRS
    cy.visit('/pqrs');
    cy.contains('Servicio al Cliente', { timeout: 8000 }).should('be.visible');
    cy.wait(3500);

    // PASO 3: LLENAR EL FORMULARIO
    cy.get('select[name="requestType"]').select('queja', { force: true });
    
    // Llenaremos explícitamente los campos personales por si no cargan del estado global a tiempo:
    cy.get('input[name="userName"]').clear().type('Cliente Prueba', { delay: 40 });
    cy.get('input[name="userId"]').clear().type('1010101010', { delay: 40 });
    cy.get('input[name="userEmail"]').clear().type('cliente@example.com', { delay: 40 });
    cy.get('input[name="userPhone"]').clear().type('3001234567', { delay: 40 });
    
    // Llenar asunto y descripción
    cy.get('input[name="subject"]').type('Mala atención en mi última cita', { delay: 40 });
    cy.get('textarea[name="description"]').type('El barbero llegó 20 minutos tarde y fue muy descortés. Solicito una revisión de este caso.', { delay: 40 });
    
    cy.wait(2000);

    // PASO 4: ACEPTAR TÉRMINOS Y ENVIAR
    cy.get('input[type="checkbox"]').check({ force: true });
    
    cy.contains('button', /Enviar Solicitud/i)
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    // Validar que se envíe la petición POST al backend con los datos correctos
    cy.wait('@createPqrs').its('request.body').should((body) => {
      expect(body.tipo_solicitud).to.equal('Queja');
      expect(body.asunto).to.equal('Mala atención en mi última cita');
      expect(body.identificacion).to.equal('1010101010');
    });

    // PASO 5: VALIDAR MENSAJE DE ÉXITO Y REDIRECCIÓN/VISTA DE ESTADO
    cy.get('.pqrs-alert.alert-success', { timeout: 8000 })
      .should('be.visible')
      .and('contain', 'PQRS enviada con éxito');

    cy.wait(4000);
  });
});
