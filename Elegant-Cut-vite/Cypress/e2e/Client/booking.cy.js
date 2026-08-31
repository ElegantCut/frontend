describe('Flujo de Agendamiento de Citas - Rol Cliente', () => {
  const clientUser = {
    id_usuario: 3,
    userId: 3,
    username: 'cliente',
    email: 'cliente@example.com',
    role: 'client',
    id_rol: 2,
    name: 'Cliente'
  };

  const mockServicesCaballero = [
    {
      id_servicio: 1,
      nombre: 'Corte Clásico',
      precio: 25000,
      duracion: 30,
      descripcion: 'Corte tradicional de caballero',
      imagen: 'default.png',
      id_categoria_servicio: 1,
      categorias: { id_categoria: 1, nombre: 'Cortes de Cabello' }
    },
    {
      id_servicio: 2,
      nombre: 'Perfilado de Barba',
      precio: 15000,
      duracion: 20,
      descripcion: 'Arreglo y perfilado de barba con navaja',
      imagen: 'default.png',
      id_categoria_servicio: 2,
      categorias: { id_categoria: 2, nombre: 'Barba y Afeitado' }
    }
  ];

  const mockBarbers = [
    {
      id_usuario: 2,
      id: 2,
      prim_nombre: 'Carlos',
      apellido1: 'Rivera',
      name: 'Carlos',
      last: 'Rivera',
      especialidad: 'Fade & Diseño',
      specialty: 'Fade & Diseño',
      emoji: 'CR',
      estado: true
    },
    {
      id_usuario: 4,
      id: 4,
      prim_nombre: 'Luis',
      apellido1: 'García',
      name: 'Luis',
      last: 'García',
      especialidad: 'Cortes Clásicos',
      specialty: 'Cortes Clásicos',
      emoji: 'LG',
      estado: true
    }
  ];

  const mockHorarios = [
    { id_horarios: 1, hora_inicio: '0900', hora_fin: '0930' },
    { id_horarios: 2, hora_inicio: '1000', hora_fin: '1030' },
    { id_horarios: 3, hora_inicio: '1100', hora_fin: '1130' },
    { id_horarios: 4, hora_inicio: '1400', hora_fin: '1430' },
    { id_horarios: 5, hora_inicio: '1600', hora_fin: '1630' }
  ];

  const mockAvailability = [
    { time: '09:00', isAvailable: true },
    { time: '09:30', isAvailable: true },
    { time: '10:00', isAvailable: true },
    { time: '10:30', isAvailable: true },
    { time: '11:00', isAvailable: true },
    { time: '11:30', isAvailable: true },
    { time: '14:00', isAvailable: true },
    { time: '16:00', isAvailable: true }
  ];

  beforeEach(() => {
    // Interceptar llamadas de autenticación
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

    // Interceptar llamadas de servicios y barberos
    cy.intercept('GET', '**/api/services/gender/1', {
      statusCode: 200,
      body: mockServicesCaballero
    }).as('getServicesByGender');

    cy.intercept('GET', '**/api/services', {
      statusCode: 200,
      body: mockServicesCaballero
    }).as('getAllServices');

    cy.intercept('GET', '**/api/barbers/public', {
      statusCode: 200,
      body: mockBarbers
    }).as('getPublicBarbers');

    cy.intercept('GET', '**/api/barbers', {
      statusCode: 200,
      body: mockBarbers
    }).as('getBarbers');

    // Interceptar horarios y disponibilidad
    cy.intercept('GET', '**/api/appointments/horarios', {
      statusCode: 200,
      body: mockHorarios
    }).as('getHorarios');

    cy.intercept('GET', '**/api/appointments/availability*', {
      statusCode: 200,
      body: mockAvailability
    }).as('getAvailability');

    // Interceptar creación de citas
    cy.intercept('POST', '**/api/appointments', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Cita creada exitosamente',
        data: {
          id_cita: 101,
          fecha: '2026-09-01T00:00:00.000Z',
          id_usuario: 3,
          id_empleado: 2,
          id_servicio: 1,
          id_horarios: 2,
          id_estado_cita: 1
        }
      }
    }).as('createAppointment');
  });

  it('Debe seleccionar un servicio, ir al formulario, configurar barbero, fecha, hora, pago y confirmar cita', () => {
    // ----------------------------------------------------
    // PASO 1: INICIAR SESIÓN COMO CLIENTE
    // ----------------------------------------------------
    cy.loginAsClient();
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 2: VISTA DE SERVICIOS - SELECCIONAR UN PRODUCTO/SERVICIO
    // ----------------------------------------------------
    cy.visit('/Servicios_caballero');
    cy.url().should('include', '/Servicios_caballero');
    cy.contains('Corte Clásico', { timeout: 8000 }).should('be.visible');
    cy.wait(3500);

    // Agregar al carrito
    cy.get('.service-card')
      .first()
      .within(() => {
        cy.contains('button', /Agregar al Carrito/i).click();
      });

    // Validar que el carrito se abre y muestra el servicio agregado
    cy.get('#cart').should('be.visible');
    cy.get('.cart-item').should('have.length.at.least', 1);
    cy.contains('#cart', 'Corte Clásico').should('be.visible');
    cy.wait(3500);

    // Clic en AGENDAR CITA AHORA para transferir el servicio a la vista de agendamiento
    cy.get('#agendarBtn').should('be.visible').click();
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 3: FORMULARIO DE AGENDAMIENTO - PASO 1 (FECHA Y HORA)
    // ----------------------------------------------------
    cy.url().should('include', '/Form_agenda');
    cy.get('.fa-panel').scrollIntoView({ duration: 600, offset: { top: -100, left: 0 } });
    cy.contains('Selecciona fecha y hora de tu servicio').should('be.visible');

    // Seleccionar un día disponible (que no esté deshabilitado)
    cy.get('.fa-days .fa-day:not(.disabled)').first().click({ scrollBehavior: false });
    cy.get('.fa-days .fa-day.selected').should('exist');
    cy.wait(2000);

    // Seleccionar un horario (ej. 10:00 am o el primer slot disponible)
    cy.get('.fa-slots-section .fa-slot:not(.disabled)').first().click({ scrollBehavior: false });
    cy.get('.fa-slot.selected').should('exist');
    cy.wait(3500);

    // Continuar al paso 2
    cy.get('.fa-btn-next').contains(/Continuar/i).should('not.be.disabled').click({ scrollBehavior: false });
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 4: FORMULARIO DE AGENDAMIENTO - PASO 2 (PROFESIONAL Y SERVICIO)
    // ----------------------------------------------------
    cy.get('.fa-panel').scrollIntoView({ duration: 600, offset: { top: -100, left: 0 } });
    cy.contains('Elige tu profesional y servicio').should('be.visible');

    // Verificar que el servicio preseleccionado del carrito aparece en la lista
    cy.contains('Corte Clásico').should('be.visible');

    // Seleccionar barbero
    cy.get('.fa-barber-card').first().click({ scrollBehavior: false });
    cy.get('.fa-barber-card.selected').should('exist');
    cy.wait(3500);

    // Continuar al paso 3
    cy.get('.fa-btn-next').contains(/Continuar/i).should('not.be.disabled').click({ scrollBehavior: false });
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 5: FORMULARIO DE AGENDAMIENTO - PASO 3 (CONTACTO Y PAGO)
    // ----------------------------------------------------
    // Asegurar que el panel de formulario quede perfectamente encuadrado y visible
    cy.get('.fa-panel').scrollIntoView({ duration: 600, offset: { top: -100, left: 0 } });
    cy.contains('Datos de contacto').should('be.visible');

    // Llenar campos de contacto sin que Cypress mueva bruscamente el scroll
    cy.get('input[name="name"]')
      .clear({ scrollBehavior: false })
      .type('Juan Cliente Prueba', { delay: 40, scrollBehavior: false });
    cy.wait(1500);

    cy.get('input[name="phone"]')
      .clear({ scrollBehavior: false })
      .type('3109876543', { delay: 40, scrollBehavior: false });
    cy.wait(1500);

    cy.get('input[name="email"]')
      .clear({ scrollBehavior: false })
      .type('cliente.prueba@example.com', { delay: 30, scrollBehavior: false });
    cy.wait(1500);

    cy.get('textarea[name="notes"]')
      .clear({ scrollBehavior: false })
      .type('Corte con degradado medio y lavado', { delay: 30, scrollBehavior: false });
    cy.wait(2000);

    // Seleccionar método de pago (ej. Transferencia o Efectivo)
    cy.contains('.fa-pay-opt', 'Transferencia').click({ scrollBehavior: false });
    cy.contains('.fa-pay-opt.active', 'Transferencia').should('exist');
    cy.wait(3500);

    // ----------------------------------------------------
    // PASO 6: CONFIRMAR CITA Y VALIDAR RESULTADO
    // ----------------------------------------------------
    cy.get('.fa-btn-next').contains(/Confirmar cita/i).click({ scrollBehavior: false });

    // Esperar la petición de agendamiento
    cy.wait('@createAppointment').its('request.body').should((body) => {
      expect(body).to.have.property('id_usuario');
      expect(body).to.have.property('id_empleado');
      expect(body).to.have.property('id_servicio');
      expect(body).to.have.property('id_horarios');
    });

    // Validar pantalla de éxito
    cy.get('.fa-success', { timeout: 8000 }).should('be.visible');
    cy.contains('¡Cita confirmada!').should('be.visible');
    cy.contains('Tu reserva ha sido registrada correctamente.').should('be.visible');
    cy.contains('Juan Cliente Prueba').should('be.visible');
    cy.contains('Agendar otra cita').should('be.visible');
    cy.wait(4000);
  });

  it('Debe permitir agendar directamente desde Form_agenda seleccionando servicio y barbero en la vista', () => {
    cy.loginAsClient();
    cy.wait(3500);

    cy.visit('/Form_agenda');
    cy.url().should('include', '/Form_agenda');
    cy.get('.fa-panel').scrollIntoView({ duration: 600, offset: { top: -100, left: 0 } });
    cy.wait(3500);

    // Paso 1: Seleccionar día y hora
    cy.get('.fa-days .fa-day:not(.disabled)').first().click({ scrollBehavior: false });
    cy.wait(1500);
    cy.get('.fa-slots-section .fa-slot:not(.disabled)').first().click({ scrollBehavior: false });
    cy.wait(3000);
    cy.get('.fa-btn-next').contains(/Continuar/i).click({ scrollBehavior: false });
    cy.wait(3500);

    // Paso 2: Seleccionar barbero y servicio manualmente
    cy.get('.fa-panel').scrollIntoView({ duration: 600, offset: { top: -100, left: 0 } });
    cy.get('.fa-barber-card').first().click({ scrollBehavior: false });
    cy.wait(1500);
    cy.get('.fa-service-card').first().click({ scrollBehavior: false });
    cy.wait(3000);
    cy.get('.fa-btn-next').contains(/Continuar/i).click({ scrollBehavior: false });
    cy.wait(3500);

    // Paso 3: Llenar datos y seleccionar Efectivo
    cy.get('.fa-panel').scrollIntoView({ duration: 600, offset: { top: -100, left: 0 } });
    cy.get('input[name="name"]').type('Pedro Gómez', { delay: 30, scrollBehavior: false });
    cy.wait(1500);
    cy.get('input[name="phone"]').type('3007654321', { delay: 30, scrollBehavior: false });
    cy.wait(1500);
    cy.contains('.fa-pay-opt', 'Efectivo').click({ scrollBehavior: false });
    cy.wait(3000);

    // Confirmar cita
    cy.get('.fa-btn-next').contains(/Confirmar cita/i).click({ scrollBehavior: false });
    cy.wait('@createAppointment');

    // Validar éxito
    cy.get('.fa-success').should('be.visible');
    cy.contains('¡Cita confirmada!').should('be.visible');
    cy.wait(4000);
  });
});
