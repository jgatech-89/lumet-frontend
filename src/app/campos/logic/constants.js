export const CONFIG_FILAS_POR_PAGINA = 5;

export const CAMPOS_INICIAL = [
  { id: 1, campo: 'CUPS luz', empresa: 'Energía', servicio: 'Luz', tipoCampo: 'Texto', estado: 'Activa', opciones: [] },
  { id: 2, campo: 'Tarifa luz', empresa: 'Energía', servicio: 'Luz', tipoCampo: 'Select', estado: 'Activa', opciones: ['Básica', 'Premium'] },
  { id: 3, campo: 'Portabilidad', empresa: 'Telefonía', servicio: 'Portabilidad', tipoCampo: 'Select', estado: 'Activa', opciones: ['Sí', 'No'] },
  { id: 4, campo: 'Tipo de donación', empresa: 'ONG', servicio: 'Donación', tipoCampo: 'Select', estado: 'Activa', opciones: ['Única', 'Recurrente'] },
];

export const TIPOS_CAMPO = ['Texto', 'Select', 'Número'];
