export const CONFIG_FILAS_POR_PAGINA = 5;

export const CAMPOS_INICIAL = [
  { id: 1, campo: 'CUPS luz', empresa: 'Energía', servicio: 'Luz', tipo: 'text', tipoCampo: 'Texto', estado: 'Activa', orden: 0, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: [] },
  { id: 2, campo: 'Tarifa luz', empresa: 'Energía', servicio: 'Luz', tipo: 'select', tipoCampo: 'Select', estado: 'Activa', orden: 1, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: ['Básica', 'Premium'] },
  { id: 3, campo: 'Portabilidad', empresa: 'Telefonía', servicio: 'Portabilidad', tipo: 'select', tipoCampo: 'Select', estado: 'Activa', orden: 0, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: ['Sí', 'No'] },
  { id: 4, campo: 'Tipo de donación', empresa: 'ONG', servicio: 'Donación', tipo: 'select', tipoCampo: 'Select', estado: 'Activa', orden: 0, activo: true, requerido: false, placeholder: '', visible_si: '', opciones: ['Única', 'Recurrente'] },
];
