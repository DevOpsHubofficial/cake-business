import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Use a ref so removeToast inside setTimeout always gets the latest version
  const removeToastRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Keep ref in sync
  removeToastRef.current = removeToast;

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToastRef.current(id);
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* aria-live="polite" announces after current speech;
          aria-atomic="false" lets each toast be announced individually */}
      <div
        className="toast-container"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions removals"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item toast-${toast.type}`}
            role="status"
          >
            <span className="toast-icon" aria-hidden="true">
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "⚠️"}
              {toast.type === "info" && "ℹ️"}
              {toast.type === "cart" && "🛒"}
              {toast.type === "delete" && "🗑️"}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
