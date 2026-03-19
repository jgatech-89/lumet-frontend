import { get, post, patch, del } from '../../../utils/funciones';

const BASE = '/api/servicios/';

export const mapServicioFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre ?? '',
  servicio: item.nombre ?? '',
  empresa_id: item.empresa_id,
  tipoEmpresa: item.empresa_nombre ?? '',
  estado: item.estado_servicio === '1' ? 'Activa' : 'Inactiva',
  estado_servicio: item.estado_servicio ?? (item.estado === 'Activa' ? '1' : '0'),
});

/**
 * Lista servicios con paginación, búsqueda y filtro por estado/empresa.
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamaño de página
 * @param {{ search?: string, estado?: string, empresa?: number }} params - empresa: ID empresa para filtrar
 * @returns {Promise<{ results: Array, count: number }>}
 */
export const listarServicios = async (page = 1, pageSize = 5, params = {}) => {
  const query = { page, page_size: pageSize };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.estado === '1' || params.estado === '0') query.estado = params.estado;
  if (params.empresa != null) query.empresa = params.empresa;
  const { data } = await get(BASE, query);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map(mapServicioFromApi),
    count,
  };
};

/**
 * Lista servicios de una empresa para select. Una sola consulta.
 * @param {number} empresaId
 * @returns {Promise<Array>}
 */
export const listarServiciosPorEmpresa = async (empresaId) => {
  const { results } = await listarServicios(1, 100, { empresa: Number(empresaId), estado: '1' });
  return results;
};

/**
 * Lista todos los servicios para selectores (campos, etc.).
 * @returns {Promise<Array>}
 */
export const listarServiciosParaSelect = async () => {
  const { data } = await get(BASE, { page_size: 500 });
  const results = Array.isArray(data) ? data : data?.results ?? [];
  return results.map(mapServicioFromApi);
};

/**
 * Crea un servicio.
 * @param {{ nombre: string, empresa_id: number }} payload
 */
export const crearServicio = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};

/**
 * Actualiza un servicio.
 * @param {number|string} id
 * @param {{ nombre?: string, empresa_id?: number, estado_servicio?: string }} payload
 */
export const actualizarServicio = async (id, payload) => {
  const { data } = await patch(`${BASE}${id}/`, payload);
  return data?.data ?? data;
};

/**
 * Elimina un servicio (borrado lógico).
 * @param {number|string} id
 */
export const eliminarServicio = async (id) => {
  await del(`${BASE}${id}/`);
};
