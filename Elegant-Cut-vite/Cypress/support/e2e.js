// ***********************************************************
// Global Configuration & Command Overrides
// ***********************************************************

import './commands';

// Configuración global limpia
Cypress.config('defaultCommandTimeout', 6000);
Cypress.config('requestTimeout', 6000);
Cypress.config('responseTimeout', 6000);