import { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const dashboardLink = user ? DASHBOARD_LINKS[user.role] : null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-indigo-600 font-bold text-lg tracking-tight">
          MentorMatch
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <>
              <span className="text-gray-500">{user.name}</span>
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

        {/* Hamburger button — mobile only */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            // X icon
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3 text-sm pb-2">
          {isAuthenticated ? (
            <>
              <span className="text-gray-500 font-medium">{user.name}</span>
              {dashboardLink && (
                <Link
                  to={dashboardLink.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
                >
                  {dashboardLink.label}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-left text-gray-500 hover:text-red-600 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="inline-block bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
