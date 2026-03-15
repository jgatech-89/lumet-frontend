import { get, post, patch, del } from '../../../utils/funciones';

const BASE = '/api/servicios/';

export const mapServicioFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre ?? '',
  estado: item.estado ?? (item.estado_servicio === '1' ? 'Activa' : 'Inactiva'),
  estado_servicio: item.estado_servicio ?? (item.estado === 'Activa' ? '1' : '0'),
});

/**
 * Lista servicios con paginación, búsqueda y filtro por estado.
 */
export const listarServicios = async (page = 1, pageSize = 5, params = {}) => {
  const query = { page, page_size: pageSize };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.estado === '1' || params.estado === '0') query.estado = params.estado;
  const { data } = await get(BASE, query);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map(mapServicioFromApi),
    count,
  };
};

/**
 * Lista todos los servicios para selectores (dropdowns en contratistas/campos).
 */
export const listarServiciosParaSelect = async () => {
  const { data } = await get(BASE, { page: 1, page_size: 100 });
  const results = Array.isArray(data) ? data : data?.results ?? [];
  return results.map(mapServicioFromApi);
};

/**
 * Lista servicios activos para select (solo id y nombre). Usa endpoint ligero.
 * @returns {Promise<Array<{ id: number, nombre: string }>>}
 */
export const listarServiciosActivasParaSelect = async () => {
  const { data } = await get(`${BASE}activas/`);
  const raw = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  return raw.map((item) => ({
    id: item?.id ?? item?.pk,
    nombre: String(item?.nombre ?? ''),
  }));
};

export const crearServicio = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};

export const actualizarServicio = async (id, payload) => {
  const { data } = await patch(`${BASE}${id}/`, payload);
  return data?.data ?? data;
};

export const eliminarServicio = async (id) => {
  await del(`${BASE}${id}/`);
};
