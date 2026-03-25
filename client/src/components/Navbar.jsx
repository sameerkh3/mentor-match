import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DASHBOARD_LINKS = {
  mentee: { to: '/dashboard', label: 'My Dashboard' },
  mentor: { to: '/mentor/dashboard', label: 'My Dashboard' },
  admin: { to: '/admin', label: 'Admin' },
};

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user ? DASHBOARD_LINKS[user.role] : null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-indigo-600 font-bold text-lg tracking-tight">
        MentorMatch
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {isAuthenticated ? (
          <>
            <span className="text-gray-500 hidden sm:inline">
              {user.name}
            </span>
            {dashboardLink && (
              <Link
                to={dashboardLink.to}
                className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
              >
                {dashboardLink.label}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
