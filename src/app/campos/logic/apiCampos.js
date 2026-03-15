import { get, post, patch, del } from '../../../utils/funciones';

const BASE_CAMPOS = '/api/campos/';
const BASE_OPCIONES = '/api/campo-opciones/';
const BASE_OPCIONES_POR_NOMBRE = '/api/campos/opciones-por-nombre/';

/**
 * Convierte un item de la API (CampoReadSerializer) al formato usado en la tabla/modales.
 * @param {Object} item - Respuesta del backend
 * @param {function(string): string} getTipoLabel - Función para obtener etiqueta del tipo
 */
/**
 * Obtiene las opciones de un campo por su nombre (ej. Producto).
 * Si se pasan servicioId y contratistaId, devuelve las opciones del campo más específico.
 * @param {string} nombre - Nombre del campo
 * @param {{ servicioId?: number, contratistaId?: number }} [params] - Opcionales para filtrar por servicio/contratista
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export const obtenerOpcionesCampoPorNombre = async (nombre, params = {}) => {
  if (!nombre?.trim()) return [];
  const query = { nombre: nombre.trim() };
  if (params?.servicioId != null) query.servicio_id = params.servicioId;
  if (params?.contratistaId != null) query.contratista_id = params.contratistaId;
  const { data } = await get(BASE_OPCIONES_POR_NOMBRE, query);
  return Array.isArray(data) ? data : [];
};

export const mapCampoFromApi = (item, getTipoLabel) => ({
  id: item.id,
  campo: item.nombre ?? '',
  empresa: item.servicio_nombre ?? (item.servicio == null ? 'Todos los servicios' : ''),
  servicio: item.contratista_nombre?.trim() || (item.contratista == null ? 'Todos los contratistas' : ''),
  producto: item.producto ?? '',
  tipo: item.tipo ?? '',
  tipoCampo: getTipoLabel ? getTipoLabel(item.tipo) : item.tipo,
  seccion: item.seccion ?? 'campos_formulario',
  estado: item.activo ? 'Activa' : 'Inactiva',
  orden: item.orden ?? 1,
  activo: item.activo ?? true,
  requerido: item.requerido ?? false,
  placeholder: item.placeholder ?? '',
  visible_si: item.visible_si ?? '',
  opciones: (item.opciones ?? []).map((o) => o.label ?? o.value ?? ''),
});

/**
 * Lista campos con paginación y filtros opcionales.
 * Misma firma que listarEmpresas, listarServicios, listarVendedores: page, pageSize, params.
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamaño de página (ej. 5)
 * @param {{ search?: string, servicio?: number, contratista?: number, activo?: boolean, producto?: string }} params
 * @returns {Promise<{ results: Array, count: number }>}
 */
export const listarCampos = async (page = 1, pageSize = 5, params = {}) => {
  const query = { page, page_size: pageSize };
  if (params.search != null && String(params.search).trim() !== '') query.search = params.search.trim();
  if (params.servicio != null) query.servicio = params.servicio;
  if (params.contratista != null) query.contratista = params.contratista;
  if (params.activo === true || params.activo === false) query.activo = params.activo;
  if (params.producto != null && String(params.producto).trim() !== '') query.producto = params.producto.trim();
  const { data } = await get(BASE_CAMPOS, query);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return { results, count };
};

/**
 * Crea un campo.
 * @param {Object} payload - nombre, tipo, servicio_id, contratista_id, orden, placeholder, visible_si, requerido, activo
 * @returns {Promise<Object>} - data.data del backend (campo creado)
 */
export const crearCampo = async (payload) => {
  const { data } = await post(BASE_CAMPOS, payload);
  return data?.data ?? data;
};

/**
 * Actualiza un campo (PATCH).
 * @param {number|string} id
 * @param {Object} payload
 */
export const actualizarCampo = async (id, payload) => {
  const { data } = await patch(`${BASE_CAMPOS}${id}/`, payload);
  return data?.data ?? data;
};

/**
 * Elimina un campo (borrado lógico).
 * @param {number|string} id
 */
export const eliminarCampo = async (id) => {
  await del(`${BASE_CAMPOS}${id}/`);
};

/**
 * Lista opciones de un campo.
 * @param {number|string} campoId
 * @returns {Promise<Array>}
 */
export const listarOpcionesCampo = async (campoId) => {
  const { data } = await get(BASE_OPCIONES, { campo: campoId });
  const results = Array.isArray(data) ? data : data?.results ?? [];
  return results;
};

/**
 * Crea una opción de campo.
 * @param {{ campo: number, label: string, value: string, orden?: number, activo?: boolean }} payload
 */
export const crearOpcionCampo = async (payload) => {
  const { data } = await post(BASE_OPCIONES, {
    campo: payload.campo,
    label: payload.label,
    value: payload.value ?? payload.label,
    orden: payload.orden ?? 0,
    activo: payload.activo ?? true,
  });
  return data?.data ?? data;
};

/**
 * Crea varias opciones de un campo en una sola petición.
 * @param {number} campoId - ID del campo
 * @param {Array<{ label: string, value?: string, orden?: number }>} opciones
 * @returns {Promise<Array>}
 */
export const crearOpcionesCampoBulk = async (campoId, opciones) => {
  const body = {
    campo: campoId,
    opciones: opciones.map((o, i) => ({
      label: typeof o === 'string' ? o : (o.label ?? o.value ?? ''),
      value: typeof o === 'string' ? o : (o.value ?? o.label ?? ''),
      orden: typeof o === 'object' && o != null && Number.isInteger(o.orden) ? o.orden : i,
    })),
  };
  const { data } = await post(`${BASE_OPCIONES}crear-lote/`, body);
  return Array.isArray(data) ? data : [];
};

/**
 * Actualiza una opción de campo (PATCH).
 */
export const actualizarOpcionCampo = async (id, payload) => {
  const { data } = await patch(`${BASE_OPCIONES}${id}/`, payload);
  return data?.data ?? data;
};

/**
 * Actualiza varias opciones de un campo en una sola petición.
 * @param {Array<{ id: number, label: string, value: string, orden: number }>} opciones
 * @returns {Promise<Array>}
 */
export const actualizarOpcionesCampoLote = async (opciones) => {
  const list = opciones.filter((o) => o.id != null).map((o) => ({
    id: o.id,
    label: o.label ?? '',
    value: o.value ?? o.label ?? '',
    orden: o.orden ?? 0,
  }));
  if (list.length === 0) return [];
  const { data } = await post(`${BASE_OPCIONES}actualizar-lote/`, { opciones: list });
  return Array.isArray(data) ? data : [];
};

/**
 * Elimina una opción de campo.
 */
export const eliminarOpcionCampo = async (id) => {
  await del(`${BASE_OPCIONES}${id}/`);
};
