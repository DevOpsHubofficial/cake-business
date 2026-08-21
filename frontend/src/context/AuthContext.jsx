import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "admin_jwt_token";
const USERNAME_KEY = "admin_username";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
    const [username, setUsername] = useState(() => sessionStorage.getItem(USERNAME_KEY));

    const login = useCallback((newToken, newUsername) => {
        sessionStorage.setItem(TOKEN_KEY, newToken);
        sessionStorage.setItem(USERNAME_KEY, newUsername);
        setToken(newToken);
        setUsername(newUsername);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USERNAME_KEY);
        setToken(null);
        setUsername(null);
    }, []);

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider value={{ token, username, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
