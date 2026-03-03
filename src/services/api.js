import axios from 'axios';
import { getToken, isTokenExpired } from '../utils/auth';

/**
 * Cliente Axios centralizado para el API.
 * - Añade Authorization: Bearer <token> en cada request si hay token válido.
 * - En 401: ejecuta logout (callback registrado por AuthContext) para limpiar sesión.
 * NOTA: La seguridad real está en el backend. Este interceptor solo mejora la UX
 * (evitar enviar token inválido, cerrar sesión al recibir 401).
 */

const baseURL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let logoutCallback = () => {};

export const setLogoutCallback = (fn) => {
  logoutCallback = typeof fn === 'function' ? fn : () => {};
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logoutCallback();
    }
    return Promise.reject(error);
  }
);

export default api;
