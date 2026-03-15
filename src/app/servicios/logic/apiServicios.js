import { get, post, patch, del } from '../../../utils/funciones';

const BASE = '/api/contratistas/';

export const mapContratistaFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre ?? '',
  servicio_id: item.servicio_id,
  servicio_nombre: item.servicio_nombre ?? '',
  estado: item.estado_contratista === '1' ? 'Activa' : 'Inactiva',
  estado_contratista: item.estado_contratista ?? (item.estado === 'Activa' ? '1' : '0'),
});

/**
 * Lista contratistas con paginación, búsqueda y filtro por estado/servicio.
 */
export const listarContratistas = async (page = 1, pageSize = 5, params = {}) => {
  const query = { page, page_size: pageSize };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.estado === '1' || params.estado === '0') query.estado = params.estado;
  if (params.servicio != null) query.servicio = params.servicio;
  const { data } = await get(BASE, query);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map(mapContratistaFromApi),
    count,
  };
};

/**
 * Lista contratistas de un servicio para select.
 * @param {number} servicioId
 * @returns {Promise<Array>}
 */
export const listarContratistasPorServicio = async (servicioId) => {
  const { results } = await listarContratistas(1, 100, { servicio: Number(servicioId), estado: '1' });
  return results;
};

/**
 * Lista todos los contratistas para selectores.
 */
export const listarContratistasParaSelect = async () => {
  const { data } = await get(BASE, { page_size: 500 });
  const results = Array.isArray(data) ? data : data?.results ?? [];
  return results.map(mapContratistaFromApi);
};

export const crearContratista = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};

export const actualizarContratista = async (id, payload) => {
  const { data } = await patch(`${BASE}${id}/`, payload);
  return data?.data ?? data;
};

export const eliminarContratista = async (id) => {
  await del(`${BASE}${id}/`);
};
