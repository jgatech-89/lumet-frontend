/**
 * Tipos de identificación para comerciales (alineado con apps.core.choices.TIPO_IDENTIFICACION).
 * Se usa como respaldo y para garantizar CC/CE aunque /api/choices/ esté cacheado o desactualizado.
 */
export const TIPOS_IDENTIFICACION_VENDEDOR_BASE = [
  { value: 'CC', label: 'CÉDULA DE CIUDADANÍA' },
  { value: 'CE', label: 'CÉDULA DE EXTRANJERÍA' },
  { value: 'NIT', label: 'NÚMERO DE IDENTIFICACIÓN TRIBUTARIO' },
  { value: 'PAS', label: 'PASAPORTE' },
  { value: 'PPT', label: 'PERMISO PROVISIONAL DE TRABAJO' },
  { value: 'DNI', label: 'DOCUMENTO NACIONAL DE IDENTIDAD' },
  { value: 'NIE', label: 'NÚMERO DE IDENTIFICACIÓN DE EXTRANJERO' },
  { value: 'CIF', label: 'CÓDIGO DE IDENTIFICACIÓN FISCAL' },
];

const ORDER = TIPOS_IDENTIFICACION_VENDEDOR_BASE.map((x) => x.value);


export function mergeTiposIdentificacionVendedor(apiList) {
  const byValue = new Map();
  TIPOS_IDENTIFICACION_VENDEDOR_BASE.forEach((d) => {
    byValue.set(d.value, { ...d });
  });
  (apiList || []).forEach((t) => {
    if (!t?.value) return;
    const prev = byValue.get(t.value);
    byValue.set(t.value, prev ? { ...prev, ...t, label: t.label ?? prev.label } : { ...t });
  });
  const seen = new Set();
  const out = [];
  for (const v of ORDER) {
    if (byValue.has(v)) {
      out.push(byValue.get(v));
      seen.add(v);
    }
  }
  for (const t of apiList || []) {
    if (t?.value && !seen.has(t.value)) {
      out.push(t);
      seen.add(t.value);
    }
  }
  return out;
}
