import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-message toast-${toast.type} fade-in-toast`}
          >
            <div className="toast-icon">
              {toast.type === 'success' && '✨'}
              {toast.type === 'error' && '⚠️'}
              {toast.type === 'info' && '💡'}
              {toast.type === 'warning' && '🔔'}
            </div>
            <div className="toast-text">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          max-width: 360px;
          width: calc(100vw - 48px);
        }

        .toast-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: var(--border-radius-md);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          pointer-events: auto;
          transition: var(--transition-smooth);
        }

        [data-theme='light'] .toast-message {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.06);
          color: #0f172a;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        .toast-success {
          border-left: 4px solid #10b981;
        }

        .toast-error {
          border-left: 4px solid #ef4444;
        }

        .toast-warning {
          border-left: 4px solid #f59e0b;
        }

        .toast-info {
          border-left: 4px solid #3b82f6;
        }

        .toast-icon {
          font-size: 1.15rem;
        }

        .toast-text {
          flex-grow: 1;
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .toast-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 2px 6px;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .toast-close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        [data-theme='light'] .toast-close-btn:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(120%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-in-toast {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
