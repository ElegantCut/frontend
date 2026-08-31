describe('Publicación de Reseñas - Rol Cliente', () => {
  const clientUser = {
    id_usuario: 3,
    userId: 3,
    username: 'cliente',
    email: 'cliente@example.com',
    role: 'client',
    id_rol: 2,
    name: 'Cliente'
  };

  const commentText = 'El servicio fue muy bueno,excelente calidad la atencion';

  const initialReviews = [
    {
      id_resena: 1,
      comentario: 'Servicio impecable y puntual.',
      calificacion: 5,
      nombre_cliente: 'Cliente',
      usuarios_resenas_id_clienteTousuarios: { prim_nombre: 'Cliente' },
      barbero: null
    }
  ];

  const updatedReviews = [
    {
      id_resena: 2,
      comentario: commentText,
      calificacion: 5,
      nombre_cliente: 'Cliente',
      usuarios_resenas_id_clienteTousuarios: { prim_nombre: 'Cliente' },
      barbero: null
    },
    ...initialReviews
  ];

  let currentReviews = initialReviews;

  beforeEach(() => {
    currentReviews = [...initialReviews];

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
        rol: { nombre_rol: 'Cliente' }
      }
    }).as('getMe');

    // Interceptar barberos públicos
    cy.intercept('GET', '**/api/barbers/public', {
      statusCode: 200,
      body: [
        {
          id_usuario: 2,
          prim_nombre: 'Carlos',
          apellido1: 'Rivera',
          estado: true
        }
      ]
    }).as('getPublicBarbers');

    // GET dinámico de reseñas
    cy.intercept('GET', '**/api/reviews', (req) => {
      req.reply({
        statusCode: 200,
        body: currentReviews
      });
    }).as('getReviews');

    // POST de creación de reseña: actualiza currentReviews y responde con éxito
    cy.intercept('POST', '**/api/reviews', (req) => {
      currentReviews = [
        {
          id_resena: 2,
          comentario: commentText,
          calificacion: 5,
          nombre_cliente: 'Cliente',
          usuarios_resenas_id_clienteTousuarios: { prim_nombre: 'Cliente' },
          barbero: null
        },
        ...initialReviews
      ];

      req.reply({
        statusCode: 201,
        body: {
          success: true,
          message: '¡Gracias por tu reseña!'
        }
      });
    }).as('createReview');
  });


  it('Debe iniciar sesión, ir a la vista de reseñas, calificar con 5 estrellas, escribir la opinión, publicarla y mostrarla en la lista', () => {
    // ----------------------------------------------------
    // PASO 1: INICIAR SESIÓN COMO CLIENTE
    // ----------------------------------------------------
    cy.loginAsClient();
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 2: NAVEGAR A LA VISTA DE RESEÑAS
    // ----------------------------------------------------
    // Navegar haciendo clic en el enlace de Reseñas del Header
    cy.get('.header-desktop-links [data-tooltip="Reseñas"], .header-desktop-links a[href*="ese"]')
      .first()
      .click();

    cy.contains('Tu Opinión', { timeout: 8000 }).should('be.visible');
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 3: SELECCIONAR CALIFICACIÓN DE 5 ESTRELLAS
    // ----------------------------------------------------
    // Hacer clic en la 5ta estrella
    cy.get('.rf-star-btn').eq(4).should('be.visible').click({ scrollBehavior: false });
    cy.get('.rf-star-label').should('contain', '¡Excelente!');
    cy.wait(3000);

    // ----------------------------------------------------
    // PASO 4: ESCRIBIR LA DESCRIPCIÓN DE LA RESEÑA
    // ----------------------------------------------------
    cy.get('textarea[name="comentario"]')
      .should('be.visible')
      .should('not.be.disabled')
      .clear({ scrollBehavior: false })
      .type(commentText, { delay: 40, scrollBehavior: false });

    // Validar que el texto quedó visiblemente escrito en el campo
    cy.get('textarea[name="comentario"]').should('have.value', commentText);
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 5: PUBLICAR LA RESEÑA
    // ----------------------------------------------------
    cy.contains('button.rf-submit', /Publicar Reseña/i)
      .should('be.visible')
      .should('not.be.disabled')
      .click({ scrollBehavior: false });

    // Validar que se envíe la petición POST
    cy.wait('@createReview').its('request.body').should((body) => {
      expect(body.calificacion).to.equal('5');
      expect(body.comentario).to.equal(commentText);
      expect(body.dirigido_a).to.equal('establecimiento');
    });

    // ----------------------------------------------------
    // PASO 6: VALIDAR MENSAJE DE ÉXITO Y VISUALIZACIÓN DE LA RESEÑA
    // ----------------------------------------------------
    cy.get('.rf-alert.success', { timeout: 8000 })
      .should('be.visible')
      .and('contain', '¡Gracias por tu reseña!');

    // Validar que la reseña publicada sea visible en la lista de reseñas
    cy.contains('.it-card-text', commentText, { timeout: 8000 }).should('be.visible');

    cy.wait(4000);
  });
});
