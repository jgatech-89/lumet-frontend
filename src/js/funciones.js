
import axios from 'axios';

export const api = "http://localhost:8000";
export const AUTH_PREFIX = "/auth";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = ({ access, refresh, access_token, refresh_token }) => {
  const a = access ?? access_token;
  const r = refresh ?? refresh_token;

  if (a) localStorage.setItem(ACCESS_KEY, a);
  if (r) localStorage.setItem(REFRESH_KEY, r);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

let onUnauthorized = () => {
  clearTokens();
  window.location.href = "/sin_sesion";
};

export const setOnUnauthorized = (fn) => {
  onUnauthorized = typeof fn === "function" ? fn : onUnauthorized;
};

const http = axios.create({
  baseURL: api,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  if (config.skipAuth === true) return config;

  const access = getAccessToken();
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

  const refreshUrl = `${api}${AUTH_PREFIX}/refresh`;

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

    if (originalRequest.skipAuth === true) {
      return Promise.reject(error);
    }

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

export const consulta = async (
  url,
  data = null,
  method = null,
  callback = () => {},
  authorization = true
) => {
  try {
    let m = method ?? (data ? "POST" : "GET");
    if (String(m).toLowerCase() === "patch") m = "PATCH";
    m = String(m).toUpperCase();

    const path = String(url).startsWith("/") ? url : `/${url}`;

    const config = {
      url: path,
      method: m,
      skipAuth: !authorization,
      headers: authorization ? undefined : {},
    };

    if (data) {
      if (m === "GET") config.params = data;
      else config.data = data;
    }

    const res = await http.request(config);
    callback(null, res.status, res.data);
  } catch (err) {
    const status = err?.response?.status ?? 0;
    const resp = err?.response?.data ?? null;

    if (status === 401 && authorization) onUnauthorized();

    callback(err, status, resp);
  }
};

export const mostrarError = (errores) => {
  if (!errores || typeof errores !== "object") return "Ocurrió un error.";
  for (const k in errores) {
    const r = errores[k];
    if (Array.isArray(r)) return `${k} : ${r.join(" ")}`;
    return `${k} : ${String(r)}`;
  }
  return "Ocurrió un error.";
};

export default http;
