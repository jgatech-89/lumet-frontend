/**
 * Utilidades para manejo de JWT y persistencia en localStorage.
 * NOTA: La seguridad real debe implementarse en el backend. Este módulo
 * solo facilita la capa de UX y el envío del token al API.
 */

const TOKEN_KEY = 'lumet_access_token';
const USER_KEY = 'lumet_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setUserInStorage = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const removeUserFromStorage = () => localStorage.removeItem(USER_KEY);

/**
 * Decodifica el payload de un JWT (sin verificar firma; eso lo hace el backend).
 * Solo útil para leer exp/roles en el cliente. NO usar para decisiones de seguridad.
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/**
 * Comprueba si el token ha expirado según el claim 'exp'.
 * El backend debe rechazar requests con token expirado (401).
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || decoded.exp == null) return true;
  const expSeconds = decoded.exp;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return expSeconds <= nowSeconds;
};
