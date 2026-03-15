import { get, post, patch, del } from '../../../utils/funciones';

const BASE = '/api/productos/';

export const mapProductoFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre ?? '',
  estado: item.estado ?? (item.estado_producto === '1' ? 'Activo' : 'Inactivo'),
  estadoProducto: item.estado_producto ?? (item.estado === 'Activo' ? '1' : '0'),
});

/**
 * Lista productos con paginación, búsqueda y filtro por estado producto.
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamaño de página
 * @param {{ search?: string, estado?: string }} filters - estado: '1' Activo, '0' Inactivo
 * @returns {Promise<{ results: Array, count: number }>}
 */
export const listarProductos = async (page = 1, pageSize = 5, filters = {}) => {
  const params = { page, page_size: pageSize };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.estado === '1' || filters.estado === '0') params.estado = filters.estado;
  const { data } = await get(BASE, params);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map(mapProductoFromApi),
    count,
  };
};

export const crearProducto = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};

export const actualizarProducto = async (id, payload) => {
  const { data } = await patch(`${BASE}${id}/`, payload);
  return data?.data ?? data;
};

export const eliminarProducto = async (id) => {
  await del(`${BASE}${id}/`);
};
