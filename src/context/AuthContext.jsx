import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getToken, setToken as persistToken, isTokenExpired, decodeToken } from '../utils/auth';
import { clearTokens } from '../js/funciones';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
};

/**
 * AuthProvider: gestiona token, usuario y estado de autenticación.
 * Solo persiste el access token (clave "access_token"). El usuario no se persiste.
 * NOTA: Las rutas protegidas aquí son solo una capa de UX. La seguridad
 * real debe estar en el backend (validar token, roles y permisos en cada request).
 */
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
    setUser(null);
  }, []);

  const login = useCallback((token, userData = null) => {
    if (!token) return;
    if (isTokenExpired(token)) {
      logout();
      return;
    }
    persistToken(token);
    setAccessToken(token);
    const decoded = decodeToken(token);
    const resolvedUser = userData ?? (decoded?.sub ? { sub: decoded.sub, role: decoded.role ?? 'user' } : null);
    if (resolvedUser) {
      setUser(resolvedUser);
    }
  }, [logout]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitialized(true);
      return;
    }
    if (isTokenExpired(token)) {
      logout();
    }
    setInitialized(true);
  }, [logout]);

  const isAuthenticated = Boolean(accessToken && !isTokenExpired(accessToken));

  const value = {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
