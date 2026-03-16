/**
 * Evalúa si un campo debe mostrarse según su condición de visibilidad (visible_si)
 * y el estado actual del formulario. Solo frontend; no hace consultas al backend.
 *
 * @param {Object} campo - Campo con visible_si (null, {} o { campo_id, operador, valor } o legacy { campo, valor })
 * @param {Object} formState - Estado del formulario (respuestas) clave por nombre de campo
 * @param {Map<number, string>|Object<number, string>} [idToNombreMap] - Mapa campo_id -> nombre (para visible_si con campo_id)
 * @returns {boolean} true si el campo debe mostrarse
 */
export function esVisible(campo, formState, idToNombreMap = null) {
  const vs = campo?.visible_si;
  if (!vs) return true;
  if (typeof vs === 'string' && !vs.trim()) return true;
  if (typeof vs !== 'object') return true;

  let nombreCampoDependiente = null;
  if (vs.campo_id != null) {
    const map = idToNombreMap instanceof Map ? idToNombreMap : (idToNombreMap && typeof idToNombreMap === 'object' ? new Map(Object.entries(idToNombreMap).map(([k, v]) => [Number(k), v])) : null);
    nombreCampoDependiente = map ? map.get(Number(vs.campo_id)) : null;
  } else if (vs.campo) {
    nombreCampoDependiente = vs.campo;
  }
  if (!nombreCampoDependiente) return true;

  const valorEsperado = vs.valor;
  const valorActual = formState[nombreCampoDependiente];
  const normalizado = (v) => {
    if (v === true || v === '1' || String(v).toLowerCase() === 'si' || String(v).toLowerCase() === 'yes') return '1';
    return v != null ? String(v).trim() : '';
  };
  const op = (vs.operador || 'igual').toLowerCase();
  const actual = normalizado(valorActual);
  const esperado = normalizado(valorEsperado);
  if (op === 'igual') return actual === esperado;
  if (op === 'diferente') return actual !== esperado;
  if (op === 'contiene') return actual.includes(esperado);
  if (op === 'mayor') return Number(actual) > Number(esperado);
  if (op === 'menor') return Number(actual) < Number(esperado);
  return actual === esperado;
}

/**
 * Construye un mapa campo_id -> nombre a partir de una lista de campos (para esVisible).
 * @param {Array<{ id: number, nombre: string }>} campos
 * @returns {Map<number, string>}
 */
export function buildIdToNombreMap(campos) {
  const map = new Map();
  (campos || []).forEach((c) => { if (c.id != null && c.nombre != null) map.set(Number(c.id), c.nombre); });
  return map;
}
