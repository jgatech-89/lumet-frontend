import axios from 'axios';
import { getToken, setTokens, clearTokens, getRefreshToken } from './auth';
import { api } from './config';

// ─── Callback 401 (logout) ───────────────────────────────────────────────────
let onUnauthorized = () => {
  clearTokens();
  window.location.href = "/login";
};

export const setOnUnauthorized = (fn) => {
  onUnauthorized = typeof fn === "function" ? fn : onUnauthorized;
};
export const setLogoutCallback = setOnUnauthorized;

// ─── Cliente HTTP ───────────────────────────────────────────────────────────
const http = axios.create({
  baseURL: api,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

http.interceptors.request.use((config) => {
  if (config.skipAuth === true) return config;
  const access = getToken();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

const resolveQueue = (error, newAccess = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newAccess);
  });
  refreshQueue = [];
};

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");
  const refreshUrl = `${api}/auth/refresh`;
  const { data } = await axios.post(
    refreshUrl,
    { refresh },
    { headers: { "Content-Type": "application/json", Accept: "application/json" } }
  );
  if (!data?.access) throw new Error("Refresh no devolvió access");
  setTokens({ access: data.access });
  return data.access;
};

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    if (!originalRequest || status !== 401) return Promise.reject(error);
    if (originalRequest.skipAuth === true) return Promise.reject(error);
    if (originalRequest._retry) {
      onUnauthorized();
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (newAccess) => {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            resolve(http(originalRequest));
          },
          reject,
        });
      });
    }
    isRefreshing = true;
    try {
      const newAccess = await refreshAccessToken();
      resolveQueue(null, newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return http(originalRequest);
    } catch (refreshErr) {
      resolveQueue(refreshErr, null);
      onUnauthorized();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Request base (usado por get, post, put, patch, del en funciones.js) ───
const normalizePath = (url) => (String(url).startsWith("/") ? url : `/${url}`);

/**
 * Hace la petición al API. Resuelve con { data, status, headers } o rechaza con { err, status, response }.
 * Exportado para que funciones.js pueda implementar consulta().
 */
export const request = async (url, data, method, authorization = true) => {
  const m = String(method).toUpperCase();
  const path = normalizePath(url);
  const config = {
    url: path,
    method: m,
    skipAuth: !authorization,
    headers: authorization ? undefined : {},
  };
  if (data != null) {
    if (m === "GET") config.params = data;
    else config.data = data;
  }
  try {
    const res = await http.request(config);
    return { data: res.data, status: res.status, headers: res.headers };
  } catch (err) {
    const status = err?.response?.status ?? 0;
    const response = err?.response?.data ?? null;
    if (status === 401 && authorization) onUnauthorized();
    throw { err, status, response };
  }
};

export const parseAuthResponse = (resp) => {
  if (!resp || typeof resp !== "object") return { access: null, refresh: null };
  return {
    access: resp.access ?? resp.access_token ?? null,
    refresh: resp.refresh ?? resp.refresh_token ?? null,
  };
};

export { setTokens } from './auth';
export default http;
