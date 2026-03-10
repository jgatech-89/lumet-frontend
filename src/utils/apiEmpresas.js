import { get, post, patch, del } from './funciones';

const BASE = '/api/empresas/';

export const mapEmpresaFromApi = (item) => ({
  id: item.id,
  nombre: item.nombre ?? '',
  estado: item.estado === '1' ? 'Activa' : 'Inactiva',
});

/**
 * Lista empresas con paginación (igual que vendedores, 5 por página).
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamaño de página
 * @returns {Promise<{ results: Array, count: number }>}
 */
export const listarEmpresas = async (page = 1, pageSize = 5) => {
  const { data } = await get(BASE, { page, page_size: pageSize });
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
 * @returns {Promise<object>}
 */
export const crearEmpresa = async (payload) => {
  const { data } = await post(BASE, payload);
  return data?.data ?? data;
};

/**
 * Actualiza una empresa.
 * @param {number|string} id
 * @param {{ nombre?: string }} payload
 * @returns {Promise<object>}
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
