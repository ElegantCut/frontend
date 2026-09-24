describe('Gestión de Barberos - Rol Admin', () => {
  const adminUser = {
    id_usuario: 1,
    userId: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    id_rol: 1,
    name: 'Administrador'
  };

  // Barbero inicial existente
  const initialBarbers = [
    {
      id_usuario: 1,
      prim_nombre: 'Carlos',
      apellido1: 'Rivera',
      email: 'carlos.rivera@example.com',
      telefono: '+1234567890',
      experiencia: '5 años',
      biografia: 'Especialista en degradados y barba.',
      especialidades: '["Fade", "Barba", "Tijera"]',
      estado: true,
    },
    {
      id_usuario: 2,
      prim_nombre: 'María',
      apellido1: 'Rodríguez',
      email: 'maria.rodriguez@example.com',
      telefono: '+1987654321',
      experiencia: '3 años',
      biografia: 'Experta en corte clásico y diseño.',
      especialidades: '["Corte Clásico", "Diseño"]',
      estado: false,
    },
  ];

  // Datos del ÚNICO nuevo barbero a registrar
  const singleNewBarber = {
    id_usuario: 3,
    prim_nombre: 'Alejandro',
    seg_nombre: 'David',
    apellido1: 'Morales',
    apellido2: 'Castro',
    username: 'alejandro_barber',
    email: 'alejandro.morales@example.com',
    telefono: '+573155554433',
    biografia: 'Especialista en cortes modernos, barbas perfiladas y degradados de alta precisión.',
    experiencia: '6 años de experiencia',
    especialidades: 'Fade, Barba Clásica, Diseños Freehand',
    password_hash: 'BarberPass2026!',
    estado: true,
  };

  beforeEach(() => {
    // Interceptar la verificación de autenticación
    cy.intercept('POST', '**/api/auth/check-token', {
      statusCode: 200,
      body: { user: adminUser }
    }).as('checkTokenAdmin');

    // Interceptores de módulos del Admin Panel
    cy.intercept('GET', '**/api/dashboard/stats*', {
      statusCode: 200,
      body: {
        totalAppointments: 124,
        totalClients: 85,
        totalBarbers: 3,
        totalServices: 12,
        monthlyEarnings: 3450000,
      }
    }).as('getDashboardStats');

    cy.intercept('GET', '**/api/appointments/admin/all', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getAppointments');

    cy.intercept('GET', '**/api/clients', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getClients');

    cy.intercept('GET', '**/api/admin/administrators', {
      statusCode: 200,
      body: { success: true, data: [adminUser] }
    }).as('getAdmins');

    cy.intercept('GET', '**/api/services/categories', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getServiceCategories');

    cy.intercept('GET', '**/api/services/admin/all', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getServices');

    cy.intercept('GET', '**/api/reviews*', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getReviews');

    cy.intercept('GET', '**/api/pqrs', {
      statusCode: 200,
      body: { success: true, data: [] }
    }).as('getPqrs');

    // Mock inicial de barberos
    cy.intercept('GET', '**/api/barbers/all', {
      statusCode: 200,
      body: {
        success: true,
        data: initialBarbers,
      },
    }).as('getBarbers');

    // Iniciar sesión como administrador
    cy.loginAsAdmin();
    cy.visit('/admin/barberos');
    cy.wait('@getBarbers');
  });

  /* ==========================================================================
     FLUJO PRINCIPAL: REGISTRO DE 1 SOLO BARBERO, VISUALIZACIÓN Y RECORRIDO DE VISTAS
     ========================================================================== */
  it('Flujo Completo: Registra UN barbero, verifica que se vea en el listado y recorre las demás vistas', () => {
    // ----------------------------------------------------
    // PASO 1: VERIFICAR LISTA INICIAL DE BARBEROS
    // ----------------------------------------------------
    cy.get('.tab-header h2').should('contain', 'Barberos');
    cy.contains('.ios-list-item', 'Carlos Rivera').should('be.visible');
    cy.contains('.ios-list-item', 'María Rodríguez').should('be.visible');

    // ----------------------------------------------------
    // PASO 2: ABRIR MODAL Y REGISTRAR EL ÚNICO BARBERO
    // ----------------------------------------------------
    cy.contains('button', 'Nuevo Barbero').should('be.visible').click();
    cy.get('.admin-overlay').should('be.visible');
    cy.contains('h3', 'Nuevo Barbero').should('be.visible');

    // Interceptar creación en el backend
    cy.intercept('POST', '**/api/barbers', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Barbero creado correctamente',
        data: singleNewBarber,
      },
    }).as('createSingleBarber');

    // Interceptar recarga con el nuevo barbero agregado
    cy.intercept('GET', '**/api/barbers/all', {
      statusCode: 200,
      body: {
        success: true,
        data: [...initialBarbers, singleNewBarber],
      },
    }).as('getBarbersWithNew');

    // Diligenciar los campos del formulario
    cy.get('input[name="username"]').clear().type(singleNewBarber.username, { delay: 30 });
    cy.get('input[name="email"]').clear().type(singleNewBarber.email, { delay: 30 });
    cy.get('input[name="prim_nombre"]').clear().type(singleNewBarber.prim_nombre, { delay: 30 });
    cy.get('input[name="apellido1"]').clear().type(singleNewBarber.apellido1, { delay: 30 });
    cy.get('input[name="telefono"]').clear().type(singleNewBarber.telefono, { delay: 30 });
    cy.get('input[name="biografia"]').clear().type(singleNewBarber.biografia, { delay: 20 });
    cy.get('input[name="experiencia"]').clear().type(singleNewBarber.experiencia, { delay: 30 });
    cy.get('input[name="especialidades"]').clear().type(singleNewBarber.especialidades, { delay: 30 });
    cy.get('input[name="password_hash"]').clear().type(singleNewBarber.password_hash, { delay: 30 });

    // Guardar barbero
    cy.get('button[type="submit"]').contains('Guardar').click();

    cy.wait('@createSingleBarber');
    cy.wait('@getBarbersWithNew');

    // ----------------------------------------------------
    // PASO 3: VERIFICAR QUE EL BARBERO CREADO SE VEA EN LA LISTA DEL ADMIN
    // ----------------------------------------------------
    cy.get('.alert.alert-success')
      .should('be.visible')
      .and('contain', 'Barbero creado correctamente');
    cy.get('.admin-overlay').should('not.exist');

    cy.contains('.ios-list-item', 'Alejandro Morales').should('be.visible').within(() => {
      cy.contains(singleNewBarber.email).should('be.visible');
      cy.contains(singleNewBarber.telefono).should('be.visible');
      cy.get('.ios-badge').should('have.class', 'success').and('contain', 'Activo');
      cy.get('button.ios-icon-btn').should('have.class', 'danger').and('have.attr', 'title', 'Desactivar');
    });

    // ----------------------------------------------------
    // PASO 4: INTERACCIÓN DE ESTADO CON EL BARBERO CREADO
    // ----------------------------------------------------
    cy.intercept('PUT', '**/api/barbers/3/toggle', {
      statusCode: 200,
      body: {
        success: true,
        newStatus: false,
      },
    }).as('toggleAlejandro');

    cy.on('window:confirm', () => true);

    cy.contains('.ios-list-item', 'Alejandro Morales').within(() => {
      cy.get('button.ios-icon-btn').click();
    });

    cy.wait('@toggleAlejandro');

    cy.contains('.ios-list-item', 'Alejandro Morales').within(() => {
      cy.get('.ios-badge').should('have.class', 'danger').and('contain', 'Inactivo');
    });

    // ----------------------------------------------------
    // PASO 5: MOSTRAR LAS DEMÁS VISTAS DEL PANEL ADMINISTRADOR
    // ----------------------------------------------------
    // Vista 1: Dashboard
    cy.get('.sidebar-nav a[href="/admin/dashboard"]').click({ force: true });
    cy.url().should('include', '/admin/dashboard');
    cy.get('.admin-main').should('be.visible');
    cy.wait(1000);

    // Vista 2: Citas
    cy.get('.sidebar-nav a[href="/admin/citas"]').click({ force: true });
    cy.url().should('include', '/admin/citas');
    cy.get('.admin-main').should('be.visible');
    cy.wait(1000);

    // Vista 3: Clientes
    cy.get('.sidebar-nav a[href="/admin/clientes"]').click({ force: true });
    cy.url().should('include', '/admin/clientes');
    cy.get('.admin-main').should('be.visible');
    cy.wait(1000);

    // Vista 4: Administradores
    cy.get('.sidebar-nav a[href="/admin/administradores"]').click({ force: true });
    cy.url().should('include', '/admin/administradores');
    cy.get('.admin-main').should('be.visible');
    cy.wait(1000);

    // Vista 5: Servicios
    cy.get('.sidebar-nav a[href="/admin/servicios"]').click({ force: true });
    cy.url().should('include', '/admin/servicios');
    cy.get('.admin-main').should('be.visible');
    cy.wait(1000);

    // Vista 6: Reseñas
    cy.get('.sidebar-nav a[href="/admin/resenas"]').click({ force: true });
    cy.url().should('include', '/admin/resenas');
    cy.get('.admin-main').should('be.visible');
    cy.wait(1000);

    // Vista 7: PQRS
    cy.get('.sidebar-nav a[href="/admin/pqrs"]').click({ force: true });
    cy.url().should('include', '/admin/pqrs');
    cy.get('.admin-main').should('be.visible');
    cy.wait(1000);

    // Regresar a la vista de Barberos
    cy.get('.sidebar-nav a[href="/admin/barberos"]').click({ force: true });
    cy.url().should('include', '/admin/barberos');
    cy.get('.admin-main').should('be.visible');
    cy.contains('.ios-list-item', 'Alejandro Morales').should('be.visible');
    cy.wait(1000);

    // ----------------------------------------------------
    // PASO 6: MOSTRAR QUE EL BARBERO CREADO SE VE EN LA VISTA PÚBLICA DE BARBEROS
    // ----------------------------------------------------
    cy.intercept('GET', '**/api/barbers', {
      statusCode: 200,
      body: [
        ...initialBarbers,
        {
          ...singleNewBarber,
          calificacion_promedio: '5.0',
          total_resenas: '12',
          portafolios: {
            experiencia: singleNewBarber.experiencia,
            biografia: singleNewBarber.biografia,
            especialidades: '["Fade", "Barba Clásica", "Diseños Freehand"]'
          }
        }
      ],
    }).as('getPublicBarbersView');

    cy.visit('/barberos');
    cy.wait('@getPublicBarbersView');

    // Verificar que la vista pública de barberos cargue y muestre al nuevo barbero
    cy.url().should('include', '/barberos');
    cy.contains('Alejandro Morales').should('be.visible');
  });

  /* ==========================================================================
     PRUEBAS COMPLEMENTARIAS: VALIDACIONES Y MANEJO DE ERRORES DEL MODAL
     ========================================================================== */
  describe('Pruebas de Controles y Validaciones', () => {
    it('Debe abrir y cerrar el modal correctamente con botones Cerrar (x) y Cancelar', () => {
      // Abrir modal
      cy.contains('button', 'Nuevo Barbero').click();
      cy.get('.admin-overlay').should('be.visible');

      // Cerrar con la 'x'
      cy.get('.admin-overlay button.btn-close').click();
      cy.get('.admin-overlay').should('not.exist');

      // Volver a abrir y cerrar con 'Cancelar'
      cy.contains('button', 'Nuevo Barbero').click();
      cy.get('.admin-overlay').should('be.visible');
      cy.contains('button', 'Cancelar').click();
      cy.get('.admin-overlay').should('not.exist');
    });

    it('Debe validar que los campos tengan el atributo HTML5 required y no se envíe vacío', () => {
      cy.contains('button', 'Nuevo Barbero').click();
      cy.get('input[name="username"]').should('have.attr', 'required');
      cy.get('input[name="email"]').should('have.attr', 'required');
      cy.get('input[name="prim_nombre"]').should('have.attr', 'required');
      cy.get('input[name="apellido1"]').should('have.attr', 'required');
      cy.get('input[name="telefono"]').should('have.attr', 'required');
      cy.get('input[name="password_hash"]').should('have.attr', 'required');
    });

    it('Debe advertir si se intenta subir una imagen de más de 2 MB', () => {
      cy.contains('button', 'Nuevo Barbero').click();

      // Simular imagen pesada de 3 MB
      const bigFileContent = 'x'.repeat(3 * 1024 * 1024);
      cy.get('input[name="image"]').then(($input) => {
        const blob = new Blob([bigFileContent], { type: 'image/jpeg' });
        const file = new File([blob], 'foto_pesada.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        cy.wrap($input).trigger('change', { force: true });
      });

      cy.get('.alert.alert-danger')
        .should('be.visible')
        .and('contain', 'La imagen de perfil debe pesar menos de 2 MB');
    });

    it('Debe mostrar alerta de error si el servidor rechaza la creación por correo duplicado', () => {
      cy.contains('button', 'Nuevo Barbero').click();

      cy.intercept('POST', '**/api/barbers', {
        statusCode: 400,
        body: {
          success: false,
          message: 'El correo electrónico o usuario ya está en uso',
        },
      }).as('createBarberDuplicated');

      cy.get('input[name="username"]').type('carlos');
      cy.get('input[name="email"]').type('carlos.rivera@example.com');
      cy.get('input[name="prim_nombre"]').type('Carlos');
      cy.get('input[name="apellido1"]').type('Rivera');
      cy.get('input[name="telefono"]').type('+1234567890');
      cy.get('input[name="biografia"]').type('Barbero');
      cy.get('input[name="experiencia"]').type('5 años');
      cy.get('input[name="especialidades"]').type('Fade');
      cy.get('input[name="password_hash"]').type('Pass123456');

      cy.get('button[type="submit"]').contains('Guardar').click();
      cy.wait('@createBarberDuplicated');

      cy.get('.admin-overlay').should('be.visible');
      cy.get('.admin-overlay .alert.alert-danger')
        .should('be.visible')
        .and('contain', 'El correo electrónico o usuario ya está en uso');
    });
  });
});
