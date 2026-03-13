import { get, post, patch, del } from '../../../utils/funciones';
import { api } from '../../../utils/config';
import { getToken } from '../../../utils/auth';

const BASE = '/api/clientes/';
const BASE_FORMULARIO = '/api/formulario/';
const BASE_OPCIONES_ESTADO_VENTA = '/api/campos/opciones-estado-venta/';

/**
 * Obtiene las opciones del campo estado de venta (desde API o fallback).
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export const obtenerOpcionesEstadoVenta = async () => {
  const { data } = await get(BASE_OPCIONES_ESTADO_VENTA);
  return Array.isArray(data) ? data : [];
};

/**
 * Lista clientes con paginación.
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamaño de página
 * @param {{ search?: string, estado_venta?: string }} filters
 * @returns {Promise<{ results: Array, count: number }>}
 */
export const listarClientes = async (page = 1, pageSize = 20, filters = {}) => {
  const params = { page, page_size: pageSize };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.estado_venta?.trim()) params.estado_venta = filters.estado_venta.trim();
  const { data } = await get(BASE, params);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      tipo_identificacion: c.tipo_identificacion,
      numero_identificacion: c.numero_identificacion,
      telefono: c.telefono,
      correo: c.correo,
      estado_venta: c.estado_venta ?? 'pendiente',
      vendedor: c.vendedor_nombre ?? '-',
      estado: c.estado === '1' ? 'Activo' : 'Inactivo',
    })),
    count,
  };
};

/**
 * Obtiene los campos del formulario para un empresa+servicio+producto (dinámicos).
 * @param {number} [empresaId] - ID de la empresa (opcional)
 * @param {number} [servicioId] - ID del servicio (opcional)
 * @param {string} [producto] - Valor del producto para filtrar campos (opcional)
 * @returns {Promise<Array>} Campos con id, nombre, tipo, opciones, requerido, etc.
 * Si no se pasan empresaId ni servicioId, devuelve campos globales.
 * Si se pasa producto, filtra campos que aplican a ese producto.
 */
export const obtenerCamposFormulario = async (empresaId, servicioId, producto) => {
  const params = {};
  if (empresaId != null) params.empresa_id = empresaId;
  if (servicioId != null) params.servicio_id = servicioId;
  if (producto != null && String(producto).trim() !== '') params.producto = String(producto).trim();
  const { data } = await get(BASE_FORMULARIO, params);
  return Array.isArray(data) ? data : [];
};

/**
 * Obtiene el detalle de un cliente (con respuestas del formulario).
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const obtenerCliente = async (id) => {
  const { data } = await get(`${BASE}${id}/`);
  return data;
};

/**
 * Actualiza un cliente y sus respuestas del formulario.
 * @param {number|string} id
 * @param {Object} payload - nombre, tipo_identificacion, numero_identificacion, telefono, correo, respuestas
 */
export const actualizarCliente = async (id, payload) => {
  const { data } = await patch(`${BASE}${id}/`, payload);
  return data?.data ?? data;
};

/**
 * Cambia el estado de venta del cliente.
 * @param {number|string} id
 * @param {string} estado
 */
export const cambiarEstadoCliente = async (id, estado) => {
  const { data } = await post(`${BASE}${id}/cambiar-estado/`, { estado: estado || 'pendiente' });
  return data;
};

/**
 * Elimina un cliente (borrado lógico).
 * @param {number|string} id
 */
export const eliminarCliente = async (id) => {
  await del(`${BASE}${id}/`);
};

/**
 * Descarga PDF del cliente (espacio de contrato).
 * @param {number|string} id
 * @returns {Promise<Blob>} - blob del PDF
 */
export const descargarPdfCliente = async (id) => {
  const token = getToken();
  const response = await fetch(`${api}/api/clientes/${id}/descargar-pdf/`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!response.ok) throw new Error('Error al descargar PDF');
  return response.blob();
};

/**
 * Exporta clientes a Excel/CSV con los filtros actuales.
 * @param {{ search?: string, estado_venta?: string }} filters
 * @returns {Promise<Blob>}
 */
export const exportarExcelClientes = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.estado_venta?.trim()) params.set('estado_venta', filters.estado_venta.trim());
  const qs = params.toString();
  const url = `${api}/api/clientes/exportar-excel/${qs ? `?${qs}` : ''}`;
  const token = getToken();
  const response = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!response.ok) throw new Error('Error al exportar');
  return response.blob();
};

/**
 * Crea un cliente con sus respuestas del formulario.
 * POST /api/clientes/
 * @param {Object} payload - servicio_id, nombre, tipo_identificacion, numero_identificacion, telefono, correo, respuestas
 * @param {Array} payload.respuestas - [{ nombre_campo, respuesta_campo }]
 */
export const crearCliente = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};
