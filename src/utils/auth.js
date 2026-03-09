const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

// ─── Access token ───────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Refresh token ──────────────────────────────────────────────────────────
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_KEY, token);
};

// ─── Ambos tokens (login / refresh) ──────────────────────────────────────────
export const setTokens = ({ access, refresh, access_token, refresh_token }) => {
  const a = access ?? access_token;
  const r = refresh ?? refresh_token;
  if (a) setToken(a);
  if (r) setRefreshToken(r);
};

export const clearTokens = () => {
  removeToken();
  localStorage.removeItem(REFRESH_KEY);
};

// ─── JWT helpers ────────────────────────────────────────────────────────────
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

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || decoded.exp == null) return true;
  return decoded.exp <= Math.floor(Date.now() / 1000);
};