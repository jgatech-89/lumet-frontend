import { get, post, patch, del } from '../../../utils/funciones';
import { listarOpcionesDestino } from '../../configuracion/logic/apiRelaciones';

const BASE = '/api/contratistas/';

export const mapContratistaFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre ?? '',
  estado: item.estado_contratista === '1' ? 'Activa' : 'Inactiva',
  estado_contratista: item.estado_contratista ?? (item.estado === 'Activa' ? '1' : '0'),
});

/**
 * Lista contratistas con paginación, búsqueda y filtro por estado.
 * La relación con Servicio se gestiona vía app relaciones.
 */
export const listarContratistas = async (page = 1, pageSize = 5, params = {}) => {
  const query = { page, page_size: pageSize };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.estado === '1' || params.estado === '0') query.estado = params.estado;
  const { data } = await get(BASE, query);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map(mapContratistaFromApi),
    count,
  };
};

/**
 * Lista contratistas relacionados con un servicio (vía app relaciones) para select.
 * @param {number} servicioId
 * @returns {Promise<Array<{ id: number, nombre: string }>>}
 */
export const listarContratistasPorServicio = async (servicioId) => {
  const opciones = await listarOpcionesDestino('servicio', Number(servicioId), 'contratista');
  const ids = opciones.map((o) => o.id);
  if (!ids.length) return [];
  const { results } = await listarContratistas(1, 500, { estado: '1' });
  return results.filter((c) => ids.includes(c.id));
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
