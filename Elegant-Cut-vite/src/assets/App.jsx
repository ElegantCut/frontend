import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './routes/home/Home'
import Reseñas from './routes/Reseñas'
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'
import Barberos from './routes/Barberos'
import './App.css'
import LoginForm from '../auth/LoginForm'
import Servicios_dama from './routes/Servicios_dama'
import Servicios_caballero from './routes/Servicios_caballero'
import Form_agenda from './routes/Form_agenda'
import AdminPanel from './routes/admin/AdminPanel'
import Pqrs from './routes/Pqrs'
import Perfil from './routes/Perfil'
import ProtectedRoute from './components/shared/ProtectedRoute'
import EjemploDB from './routes/EjemploDB'
import Unauthorized from '../auth/Unauthorized'

// Importar componentes de Admin
import DashboardTab from './components/admin/DashboardTab'
import ServicesTab from './components/admin/ServicesTab'
import BarbersTab from './components/admin/BarbersTab'
import AdminsTab from './components/admin/AdminsTab'
import AppointmentsTab from './components/admin/AppointmentsTab'
import ClientsTab from './components/admin/ClientsTab'
import SettingsTab from './components/admin/SettingsTab'
import ReviewsTab from './components/admin/ReviewsTab'

// Importar componentes de Barber
import BarberPanel from './routes/barber/BarberPanel'
import BarberAppointments from './routes/barber/BarberAppointments'
import BarberSettings from './routes/barber/BarberSettings'

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginForm />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardTab />} />
          <Route path="citas" element={<AppointmentsTab />} />
          <Route path="clientes" element={<ClientsTab />} />
          <Route path="barberos" element={<BarbersTab />} />
          <Route path="administradores" element={<AdminsTab />} />
          <Route path="servicios" element={<ServicesTab />} />
          <Route path="resenas" element={<ReviewsTab />} />
          <Route path="configuracion" element={<SettingsTab />} />
        </Route>

        <Route
          path="/barber"
          element={
            <ProtectedRoute requiredRole="barber">
              <BarberPanel />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/barber/appointments" replace />} />
          <Route path="appointments" element={<BarberAppointments />} />
          <Route path="configuracion" element={<BarberSettings />} />
        </Route>

        <Route path="/*" element={
          <>
            <Header />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/barberos" element={<Barberos />} />
                <Route path="/reseñas" element={<Reseñas />} />
                <Route path="/Servicios_dama" element={<Servicios_dama />} />
                <Route path="/Servicios_caballero" element={<Servicios_caballero />} />
                <Route path="/Form_agenda" element={<Form_agenda />} />
                <Route path="/Pqrs" element={<Pqrs />} />
                <Route path="/ejemplo-db" element={<EjemploDB />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Routes>
            </AnimatePresence>
            <Footer />
          </>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App