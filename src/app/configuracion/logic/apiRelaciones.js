import { get, post, patch } from '../../../utils/funciones';

const BASE = '/api/relaciones/';

/**
 * Lista relaciones con filtros opcionales.
 * @param {{ origen_tipo?: string, origen_id?: number, destino_tipo?: string, destino_id?: number }} params
 * @returns {Promise<Array<{ id: number, origen_tipo: string, origen_id: number, destino_tipo: string, destino_id: number }>>}
 */
export const listarRelaciones = async (params = {}) => {
  const query = { page_size: 500 };
  if (params.origen_tipo != null) query.origen_tipo = params.origen_tipo;
  if (params.origen_id != null) query.origen_id = params.origen_id;
  if (params.destino_tipo != null) query.destino_tipo = params.destino_tipo;
  if (params.destino_id != null) query.destino_id = params.destino_id;
  const { data } = await get(BASE, query);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  return results;
};

/**
 * Crea una relación entre dos entidades.
 * @param {{ origen_tipo: string, origen_id: number, destino_tipo: string, destino_id: number }} payload
 * @returns {Promise<Object>} Objeto creado con id, origen_tipo, origen_id, destino_tipo, destino_id, created_at
 */
export const crearRelacion = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};

/**
 * Desactiva una relación por id (estado=false). No borra el registro; permite historial y reactivación.
 * @param {number} id - ID de la relación
 */
export const eliminarRelacion = async (id) => {
  await patch(`${BASE}${id}/`, { estado: '0' });
};

/**
 * Reactiva una relación por id (estado=true). Útil si se desactivó y se quiere volver a activar.
 * @param {number} id - ID de la relación
 * @returns {Promise<Object>} Relación actualizada
 */
export const reactivarRelacion = async (id) => {
  const { data } = await patch(`${BASE}${id}/`, { estado: '1' });
  return data?.data ?? data;
};

const ENTIDAD_BASES = {
  servicio: '/api/servicios/',
  contratista: '/api/contratistas/',
  producto: '/api/productos/',
  campo: '/api/campos/',
  vendedor: '/api/vendedores/',
};

/**
 * Obtiene el nombre de una entidad por tipo e id (GET /api/{tipo}/{id}/).
 * Usado para mostrar en el modal de detalles del campo las entidades relacionadas.
 * @param {string} tipo - servicio | contratista | producto | campo | vendedor
 * @param {number} id - ID de la entidad
 * @returns {Promise<string|null>} Nombre de la entidad o null si falla
 */
export const obtenerNombreEntidad = async (tipo, id) => {
  const base = ENTIDAD_BASES[tipo];
  if (!base || id == null) return null;
  try {
    const { data } = await get(`${base}${id}/`);
    if (tipo === 'vendedor') return data?.nombre_completo ?? data?.nombre ?? null;
    if (tipo === 'campo') return data?.nombre ?? data?.campo ?? null;
    return data?.nombre ?? null;
  } catch {
    return null;
  }
};

/**
 * Lista opciones de destino para selects dependientes (ej. contratistas de un servicio).
 * GET /api/relaciones/opciones/?origen_tipo=...&origen_id=...&destino_tipo=...
 * @returns {Promise<Array<{ id: number, tipo: string }>>}
 */
export const listarOpcionesDestino = async (origen_tipo, origen_id, destino_tipo) => {
  const { data } = await get(`${BASE}opciones/`, {
    origen_tipo: String(origen_tipo),
    origen_id: Number(origen_id),
    destino_tipo: String(destino_tipo),
  });
  return Array.isArray(data) ? data : [];
};
