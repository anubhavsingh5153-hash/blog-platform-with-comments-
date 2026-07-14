import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✍️</span>
          <span className="logo-text gradient-text">InkFlow</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <>
              <Link to="/create-post" className="nav-link">Create Post</Link>
              <div className="user-profile-menu">
                <span className="user-badge">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
                <span className="user-name">Hi, {user.username}</span>
                <button onClick={handleLogout} className="btn-secondary btn-sm-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-nav-buttons">
              <Link to="/auth?mode=login" className="nav-link">Login</Link>
              <Link to="/auth?mode=register" className="btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
        </nav>
      </div>

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: var(--bg-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-glass);
          z-index: 1000;
          display: flex;
          align-items: center;
          transition: var(--transition-smooth);
        }

        .navbar-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.5rem;
        }

        .logo-icon {
          font-size: 1.6rem;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .auth-nav-buttons {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          padding: 4px 12px 4px 6px;
          border-radius: 30px;
          border: 1px solid var(--border-glass);
        }

        [data-theme='light'] .user-profile-menu {
          background: rgba(0, 0, 0, 0.02);
        }

        .user-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent-gradient);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .btn-sm-logout {
          padding: 4px 10px;
          font-size: 0.8rem;
          border-radius: 20px;
        }

        .theme-toggle-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: var(--transition-smooth);
        }

        .theme-toggle-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          transform: rotate(15deg);
        }

        [data-theme='light'] .theme-toggle-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
          .user-name {
            display: none;
          }
          .navbar-container {
            padding: 0 16px;
          }
          .navbar-links {
            gap: 16px;
          }
          .user-profile-menu {
            padding: 4px;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
