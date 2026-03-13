import { get, post, patch, del } from '../../../utils/funciones';
import { api } from '../../../utils/config';
import { getToken } from '../../../utils/auth';

const BASE = '/api/clientes/';
const BASE_FORMULARIO = '/api/formulario/';
const BASE_OPCIONES_ESTADO_VENTA = '/api/campos/opciones-estado-venta/';

/** Cache de la promesa para evitar peticiones duplicadas (p. ej. por React Strict Mode). */
let promiseOpcionesEstadoVenta = null;

/**
 * Obtiene las opciones del campo estado de venta (desde API o fallback).
 * Reutiliza la misma petición si se llama varias veces.
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export const obtenerOpcionesEstadoVenta = async () => {
  if (promiseOpcionesEstadoVenta) return promiseOpcionesEstadoVenta;
  promiseOpcionesEstadoVenta = get(BASE_OPCIONES_ESTADO_VENTA).then(({ data }) =>
    Array.isArray(data) ? data : []
  );
  return promiseOpcionesEstadoVenta;
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
 * @param {boolean} [soloSinProducto] - Si true, solo campos sin restricción por producto (producto vacío)
 * @returns {Promise<Array>} Campos con id, nombre, tipo, opciones, requerido, etc.
 * Si no se pasan empresaId ni servicioId, devuelve campos globales.
 * Si soloSinProducto=true: solo campos que aplican a todos los productos.
 * Si se pasa producto: filtra campos que aplican a ese producto o a todos.
 */
export const obtenerCamposFormulario = async (empresaId, servicioId, producto, soloSinProducto = false) => {
  const params = {};
  if (empresaId != null) params.empresa_id = empresaId;
  if (servicioId != null) params.servicio_id = servicioId;
  if (producto != null && String(producto).trim() !== '' && producto !== '__todos__') {
    params.producto = String(producto).trim();
  }
  if (soloSinProducto) params.solo_sin_producto = 'true';
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
 * Cambia el estado de venta del cliente (o de un producto específico).
 * @param {number|string} id - ID del cliente
 * @param {string} estado
 * @param {number|null} [clienteEmpresaId] - ID del ClienteEmpresa (producto). Si se envía, el estado se aplica a ese producto.
 */
export const cambiarEstadoCliente = async (id, estado, clienteEmpresaId = null) => {
  const payload = { estado: estado || 'pendiente' };
  if (clienteEmpresaId != null) payload.cliente_empresa_id = clienteEmpresaId;
  const { data } = await post(`${BASE}${id}/cambiar-estado/`, payload);
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

/**
 * Agrega un nuevo producto a un cliente existente.
 * POST /api/clientes/{id}/agregar-producto/
 * @param {number|string} clienteId
 * @param {Object} payload - servicio_id, producto, respuestas
 */
export const agregarProductoCliente = async (clienteId, payload) => {
  const { data } = await post(`${BASE}${clienteId}/agregar-producto/`, payload);
  return data;
};

/**
 * Actualiza un producto (ClienteEmpresa) existente. No modifica estado de venta.
 * @param {number|string} clienteId
 * @param {Object} payload - cliente_empresa_id, tipo_cliente?, servicio_id?, producto?, respuestas?
 */
export const actualizarProductoCliente = async (clienteId, payload) => {
  const { data } = await post(`${BASE}${clienteId}/actualizar-producto/`, payload);
  return data;
};
