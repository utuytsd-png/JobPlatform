import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VacanciesPage from './pages/VacanciesPage';
import VacancyDetailPage from './pages/VacancyDetailPage';
import CreateVacancyPage from './pages/CreateVacancyPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import VacancyApplicationsPage from './pages/VacancyApplicationsPage';
import EditVacancyPage from './pages/EditVacancyPage';
import ProfilePage from './pages/ProfilePage';
import RecommendationsPage from './pages/RecommendationsPage';
import AdminPage from './pages/AdminPage';
import SavedVacanciesPage from './pages/SavedVacanciesPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; 

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/vacancies" element={<VacanciesPage />} />
        <Route path="/vacancies/:id" element={<VacancyDetailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['JOB_SEEKER']} />}>
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/saved-vacancies" element={<SavedVacanciesPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
          <Route path="/vacancies/create" element={<CreateVacancyPage />} />
          <Route path="/vacancies/:id/edit" element={<EditVacancyPage />} />
          <Route path="/vacancies/:id/applications" element={<VacancyApplicationsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;