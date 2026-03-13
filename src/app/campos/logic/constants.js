export const CONFIG_FILAS_POR_PAGINA = 5;

/** Secciones fijas del formulario (debe coincidir con el backend). */
export const SECCIONES_FORMULARIO = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'datos_base', label: 'Datos base' },
  { value: 'campos_formulario', label: 'Campos del formulario' },
  { value: 'vendedor', label: 'Vendedor' },
];

export const CAMPOS_INICIAL = [
  { id: 1, campo: 'CUPS luz', empresa: 'Energía', servicio: 'Luz', tipo: 'text', tipoCampo: 'Texto', estado: 'Activa', orden: 0, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: [] },
  { id: 2, campo: 'Tarifa luz', empresa: 'Energía', servicio: 'Luz', tipo: 'select', tipoCampo: 'Select', estado: 'Activa', orden: 1, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: ['Básica', 'Premium'] },
  { id: 3, campo: 'Portabilidad', empresa: 'Telefonía', servicio: 'Portabilidad', tipo: 'select', tipoCampo: 'Select', estado: 'Activa', orden: 0, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: ['Sí', 'No'] },
  { id: 4, campo: 'Tipo de donación', empresa: 'ONG', servicio: 'Donación', tipo: 'select', tipoCampo: 'Select', estado: 'Activa', orden: 0, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: ['Única', 'Recurrente'] },
];
