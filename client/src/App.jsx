import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MentorProfile from './pages/MentorProfile.jsx';
import MenteeDashboard from './pages/MenteeDashboard.jsx';
import MentorDashboard from './pages/MentorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

/**
 * Guards a route by authentication and optional role.
 * Unauthenticated users are sent to /login.
 * Wrong-role users are redirected to their own dashboard.
 */
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mentors/:id" element={<MentorProfile />} />

        {/* Mentee */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="mentee">
              <MenteeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Mentor */}
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute role="mentor">
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
