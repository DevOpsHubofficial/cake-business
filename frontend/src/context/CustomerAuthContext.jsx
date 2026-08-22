import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCustomerProfile } from "../services/api";

const CustomerAuthContext = createContext(null);

const CUSTOMER_TOKEN_KEY = "customer_jwt_token";
const CUSTOMER_DATA_KEY = "customer_profile_data";

export function CustomerAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CUSTOMER_TOKEN_KEY));
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_DATA_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const storedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      if (storedToken) {
        try {
          const profile = await getCustomerProfile(storedToken);
          if (isMounted) {
            setCustomer(profile);
            localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(profile));
          }
        } catch {
          if (isMounted) {
            logout();
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((newToken, customerData) => {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, newToken);
    localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(customerData));
    setToken(newToken);
    setCustomer(customerData);
  }, []);

  const updateCustomer = useCallback((updatedData) => {
    setCustomer((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_DATA_KEY);
    setToken(null);
    setCustomer(null);
  }, []);

  const isAuthenticated = Boolean(token && customer);

  return (
    <CustomerAuthContext.Provider
      value={{
        token,
        customer,
        isAuthenticated,
        loading,
        login,
        updateCustomer,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}
