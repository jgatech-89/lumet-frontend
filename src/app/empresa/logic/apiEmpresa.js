import { get, post, patch, del } from '../../../utils/funciones';

const BASE = '/api/empresas/';

export const mapEmpresaFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre ?? '',
  estado: item.estado ?? (item.estado_empresa === '1' ? 'Activa' : 'Inactiva'),
  estado_empresa: item.estado_empresa ?? (item.estado === 'Activa' ? '1' : '0'),
});

/**
 * Lista empresas con paginación, búsqueda y filtro por estado.
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamaño de página
 * @param {{ search?: string, estado?: string }} params - search: texto (nombre), estado: '1' Activa, '0' Inactiva (omitir = todos)
 * @returns {Promise<{ results: Array, count: number }>}
 */
export const listarEmpresas = async (page = 1, pageSize = 5, params = {}) => {
  const query = { page, page_size: pageSize };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.estado === '1' || params.estado === '0') query.estado = params.estado;
  const { data } = await get(BASE, query);
  const results = Array.isArray(data) ? data : data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results: results.map(mapEmpresaFromApi),
    count,
  };
};

/**
 * Lista todas las empresas para selectores (dropdowns en servicios/campos).
 * @returns {Promise<Array>}
 */
export const listarEmpresasParaSelect = async () => {
  const { data } = await get(BASE, { page_size: 100 });
  const results = Array.isArray(data) ? data : data?.results ?? [];
  return results.map(mapEmpresaFromApi);
};

/**
 * Crea una empresa.
 * @param {{ nombre: string }} payload
 */
export const crearEmpresa = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};

/**
 * Actualiza una empresa.
 * @param {number|string} id
 * @param {{ nombre?: string, estado_empresa?: string }} payload
 */
export const actualizarEmpresa = async (id, payload) => {
  const { data } = await patch(`${BASE}${id}/`, payload);
  return data?.data ?? data;
};

/**
 * Elimina una empresa (borrado lógico).
 * @param {number|string} id
 */
export const eliminarEmpresa = async (id) => {
  await del(`${BASE}${id}/`);
};
