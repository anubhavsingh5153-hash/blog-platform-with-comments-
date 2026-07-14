import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, register, error: authError, setError } = useAuth();
  const { addToast } = useToast();

  // Mode state: 'login' or 'register'
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectPath = searchParams.get('redirect') || '/';

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // If user is already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  // Clear errors when toggling modes
  useEffect(() => {
    setError(null);
    setValidationError('');
  }, [mode, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    // Validation checks
    if (mode === 'register') {
      if (!username || !email || !password || !confirmPassword) {
        setValidationError('All fields are required.');
        addToast('All fields are required.', 'warning');
        return;
      }
      if (username.length < 3) {
        setValidationError('Username must be at least 3 characters.');
        addToast('Username must be at least 3 characters.', 'warning');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        addToast('Password must be at least 6 characters.', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        addToast('Passwords do not match.', 'warning');
        return;
      }
    } else {
      if (!username || !password) {
        setValidationError('Please enter your credentials.');
        addToast('Please enter your credentials.', 'warning');
        return;
      }
    }

    setSubmitting(true);

    try {
      let result;
      if (mode === 'register') {
        result = await register(username, email, password);
      } else {
        result = await login(username, password); // username field is used as identifier (username/email)
      }

      if (result.success) {
        addToast(
          mode === 'login' ? `Welcome back, ${username}!` : 'Account registered successfully!',
          'success'
        );
        navigate(redirectPath);
      } else {
        addToast(result.error || 'Authentication failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('An unexpected error occurred during sign in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    const nextMode = mode === 'login' ? 'register' : 'login';
    navigate(`/auth?mode=${nextMode}&redirect=${encodeURIComponent(redirectPath)}`);
  };

  return (
    <div className="auth-page-container fade-in">
      <div className="glass-card auth-card-wrapper">
        <header className="auth-header">
          <span className="auth-icon-badge">🔑</span>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Enter your credentials to continue reading and writing.' 
              : 'Sign up to start sharing articles and participating in discussions.'}
          </p>
        </header>

        {validationError && (
          <div className="alert-banner alert-error">{validationError}</div>
        )}
        {authError && (
          <div className="alert-banner alert-error">{authError}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-elements">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input
                type="text"
                id="reg-username"
                className="form-input"
                placeholder="e.g. dev_guru"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          )}

          {/* For login, this input acts as Username OR Email identifier */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-identifier">
              {mode === 'login' ? 'Username or Email' : 'Email Address'}
            </label>
            <input
              type={mode === 'login' ? 'text' : 'email'}
              id="auth-identifier"
              className="form-input"
              placeholder={mode === 'login' ? 'Enter username or email' : 'e.g. you@example.com'}
              value={mode === 'login' ? username : email}
              onChange={(e) => mode === 'login' ? setUsername(e.target.value) : setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="auth-confirm-password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={submitting}
          >
            {submitting 
              ? (mode === 'login' ? 'Authenticating...' : 'Registering Account...') 
              : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <footer className="auth-card-footer">
          <p>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={toggleMode} className="auth-toggle-link">
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </footer>
      </div>

      <style>{`
        .auth-page-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          min-height: calc(100vh - 180px);
        }

        .auth-card-wrapper {
          width: 100%;
          max-width: 460px;
          padding: 40px;
          display: flex;
          flex-direction: column;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .auth-icon-badge {
          font-size: 2.2rem;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-glass);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        [data-theme='light'] .auth-icon-badge {
          background: rgba(0, 0, 0, 0.02);
        }

        .auth-title {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .auth-form-elements {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-submit-btn {
          width: 100%;
          justify-content: center;
          margin-top: 16px;
          padding: 12px;
        }

        .auth-card-footer {
          margin-top: 24px;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-toggle-link {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-weight: 600;
          cursor: pointer;
          margin-left: 6px;
          font-size: 0.9rem;
          text-decoration: underline;
        }

        .auth-toggle-link:hover {
          color: var(--accent-secondary);
        }

        @media (max-width: 480px) {
          .auth-card-wrapper {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
