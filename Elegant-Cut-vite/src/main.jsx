import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import "./App.css";
import "./tailwind.css";


// Global Styles from src/assets (Migrated for Vite HMR)
import './assets/styles/styles_index/styles_index.css';
import './assets/styles/styles_nav/Nav.css';
import './assets/styles/Menu_hamburguesa/menu.css';
import './assets/styles/Footer/Footer.css';
import './assets/styles/revew/Reseña.css';
import './assets/styles/card_barbero/card_barberos.css';
import './assets/styles/styles_form/styles.css';
import './assets/styles/servicios_dama/servicios.css';
// import './assets/styles/admin_barbero/admin.html.css';
import './assets/styles/perfil/perfil.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="859330875259-h0oa83sb0k5e46rg3bop16unfao1jch6.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
