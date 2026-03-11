import { get, post, patch, del } from '../../../utils/funciones';

const BASE = '/api/vendedores/';

export const mapVendedorFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre_completo ?? item.nombre ?? '',
  numeroIdentificacion: item.numero_identificacion ?? '',
  tipoIdentificacion: item.tipo_identificacion ?? '',
  estado: item.estado ?? (item.estado_vendedor === '1' ? 'Activo' : 'Inactivo'),
  estadoVendedor: item.estado_vendedor ?? (item.estado === 'Activo' ? '1' : '0'),
});

/**
 * Lista vendedores con paginación, búsqueda y filtro por estado.
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamaño de página
 * @param {{ search?: string, estado?: string }} filters
 * @returns {Promise<{ results: Array, count: number }>}
 */
export const listarVendedores = async (page = 1, pageSize = 5, filters = {}) => {
  const params = { page, page_size: pageSize };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.estado === '1' || filters.estado === '0') params.estado = filters.estado;
  const { data } = await get(BASE, params);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map(mapVendedorFromApi),
    count,
  };
};

export const crearVendedor = async (payload) => {
  const { data } = await post(BASE, payload);
  return data;
};

export const actualizarVendedor = async (id, payload) => {
  const { data } = await patch(`${BASE}${id}/`, payload);
  return data;
};

export const eliminarVendedor = async (id) => {
  await del(`${BASE}${id}/`);
};
