import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import ConsultationSearch from '../features/consultation/pages/ConsultationPage'
import NewConsultation    from '../features/consultation/pages/NewConsultation'
import PatientList from '../features/patients/pages/PatientList'
import Dashboard from '../features/dashboard/pages/Dashboard'
import ArchivePage from '../features/consultation/pages/ArchivePage'
import PatientDetails from '../features/patients/pages/PatientDetails'
import ConsultationReport from '../features/consultation/pages/ConsultationReport'
import AddPatient from '../features/patients/pages/AddPatient'
import ContactPage from '../features/Contact/pages/ContactPage'
import PaymentsPage from '../features/payments/pages/PaymentsPage'
import Profile from '../features/profile/pages/Profile'
import { ROUTES } from '../constants/routes'

const Placeholder = ({ name }) => (
  <div className="text-2xl font-semibold text-gray-700">{name} — coming soon</div>
)

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
       
<Route path={ROUTES.PATIENT_DETAILS} element={<PatientDetails />} />
       <Route path={ROUTES.ADD_PATIENT} element={<AddPatient />} />
       <Route path={ROUTES.PATIENTS} element={<PatientList />} />
       <Route path={ROUTES.CONTACT} element={<ContactPage />} />
       <Route path="/consultations/archive" element={<ArchivePage />} />
       <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
        <Route path={ROUTES.APPOINTMENTS} element={<Placeholder name="Rendez-vous" />} />
        <Route path={ROUTES.PAYMENTS} element={<Placeholder name="Recette" />} />
      <Route path={ROUTES.PROFILE} element={<Profile />} />
      <Route path="/consultation"            element={<ConsultationSearch />} />
      <Route path="/consultation/rapport/:id" element={<ConsultationReport />} />
<Route path="/consultation/:patientId" element={<NewConsultation />}    />

      </Route>

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}