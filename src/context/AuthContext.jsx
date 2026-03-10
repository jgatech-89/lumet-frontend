import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getToken, setToken as persistToken, isTokenExpired, clearTokens } from '../utils/auth';
import { get } from '../utils/funciones';

const AuthContext = createContext(null);

/** Promesa de la petición /me en curso. Evita doble petición cuando Strict Mode monta dos veces. */
let meRequestPromise = null;

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
};

/**
 * Normaliza la respuesta del endpoint /me al objeto usuario que usa la app.
 */
const mapMeToUser = (data) => {
  if (!data || typeof data !== 'object') return null;
  return {
    id: data.id,
    correo: data.correo ?? '',
    primer_nombre: data.primer_nombre ?? '',
    primer_apellido: data.primer_apellido ?? '',
    perfil: data.perfil ?? '',
    estado: data.estado ?? '',
    role: data.perfil ?? '', // alias para validación de roles (RoleRoute, etc.)
  };
};

/**
 * AuthProvider: gestiona token, usuario y estado de autenticación.
 * La información del usuario se obtiene siempre desde el endpoint /me (tras login y al cargar la app).
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

  /**
   * Obtiene los datos del usuario autenticado desde el endpoint /me y actualiza el estado.
   * Debe llamarse tras un login exitoso y se llama automáticamente al cargar la app si hay token válido.
   */
  const fetchMe = useCallback(async () => {
    const { data } = await get('auth/me');
    const mapped = mapMeToUser(data);
    if (mapped) setUser(mapped);
    return mapped;
  }, []);

  const login = useCallback((token) => {
    if (!token) return;
    if (isTokenExpired(token)) {
      logout();
      return;
    }
    persistToken(token);
    setAccessToken(token);
    // El usuario se cargará con fetchMe() desde quien llame a login (ej. página de login)
  }, [logout]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitialized(true);
      return;
    }
    if (isTokenExpired(token)) {
      logout();
      setInitialized(true);
      return;
    }
    // Marcar como inicializado de inmediato para no bloquear la primera pintada (evita pantalla en blanco).
    setInitialized(true);
    let cancelled = false;

    const applyMeResult = ({ data }) => {
      if (!cancelled) {
        const mapped = mapMeToUser(data);
        if (mapped) setUser(mapped);
      }
    };
    const applyMeError = () => {
      if (!cancelled) logout();
    };

    if (meRequestPromise) {
      // Reutilizar la petición ya en curso (p. ej. segundo montaje por Strict Mode)
      meRequestPromise.then(applyMeResult).catch(applyMeError);
      return () => { cancelled = true; };
    }

    meRequestPromise = get('auth/me');
    const currentPromise = meRequestPromise;
    meRequestPromise
      .then(applyMeResult)
      .catch(applyMeError)
      .finally(() => {
        // Dejar un tick para que el segundo montaje (Strict Mode) pueda reutilizar la promesa
        setTimeout(() => { if (meRequestPromise === currentPromise) meRequestPromise = null; }, 0);
      });
    return () => { cancelled = true; };
  }, [logout]);

  const isAuthenticated = Boolean(accessToken && !isTokenExpired(accessToken));

  const value = {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
    fetchMe,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
