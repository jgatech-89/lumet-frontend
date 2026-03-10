import { request } from './api';
import { api } from './config';

export { api };

export const get = (url, params = null, authorization = true) =>
  request(url, params, "GET", authorization);
export const post = (url, data, authorization = true) =>
  request(url, data, "POST", authorization);
export const put = (url, data, authorization = true) =>
  request(url, data, "PUT", authorization);
export const patch = (url, data, authorization = true) =>
  request(url, data, "PATCH", authorization);
export const del = (url, data = null, authorization = true) =>
  request(url, data, "DELETE", authorization);

export const mostrarError = (errores) => {
  if (!errores || typeof errores !== "object") return "Ocurrió un error.";
  for (const k in errores) {
    const r = errores[k];
    if (Array.isArray(r)) return `${k}: ${r.join(" ")}`;
    return `${k}: ${String(r)}`;
  }
  return "Ocurrió un error.";
};

export const getErrorMessage = (first, second, third, fourth) => {
  let status;
  let response;
  let defaultMsg = "Ocurrió un error.";
  if (first != null && typeof first === "object" && "status" in first && "response" in first) {
    status = first.status;
    response = first.response;
    defaultMsg = second ?? defaultMsg;
  } else {
    status = second;
    response = third;
    defaultMsg = fourth ?? defaultMsg;
  }
  if (status === 400 && response) return mostrarError(response);
  if (response && typeof response.detail === "string") return response.detail;
  if (response && typeof response.message === "string") return response.message;
  return defaultMsg;
};