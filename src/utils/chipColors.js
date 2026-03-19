/**
 * Colores de chips para estados (Activa/Inactiva) y venta (completada, cancelada, etc.)
 * Adaptados a modo claro y oscuro para buena legibilidad.
 */

export const getChipEstadosVenta = (isDark) => {
  const ventaIniciadaStyle = {
    bg: isDark ? 'rgba(129, 199, 132, 0.28)' : 'rgba(56, 142, 60, 0.12)',
    color: isDark ? '#66bb6a' : '#2e7d32',
  };
  return {
  'Venta iniciada': ventaIniciadaStyle,
  'venta_iniciada': ventaIniciadaStyle,
  'Venta completada': {
    bg: isDark ? 'rgba(102, 187, 106, 0.28)' : 'rgba(46, 125, 50, 0.12)',
    color: isDark ? '#81c784' : '#1b5e20',
  },
  'Venta cancelada': {
    bg: isDark ? 'rgba(239, 83, 80, 0.28)' : 'rgba(198, 40, 40, 0.12)',
    color: isDark ? '#e57373' : '#b71c1c',
  },
  'Venta pospuesta': {
    bg: isDark ? 'rgba(255, 167, 38, 0.28)' : 'rgba(245, 124, 0, 0.12)',
    color: isDark ? '#ffb74d' : '#e65100',
  },
  'Venta pendiente': {
    bg: isDark ? 'rgba(100, 181, 246, 0.28)' : 'rgba(21, 101, 192, 0.12)',
    color: isDark ? '#64b5f6' : '#0d47a1',
  },
}; };

export const getChipEstadoActivo = (isDark) => ({
  bg: isDark ? 'rgba(102, 187, 106, 0.28)' : 'rgba(46, 125, 50, 0.12)',
  color: isDark ? '#81c784' : '#1b5e20',
});

export const getChipEstadoInactivo = (isDark) => ({
  bg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  color: isDark ? '#8b949e' : 'text.secondary',
});

export const getChipTipoCampo = (isDark) => ({
  bg: isDark ? 'rgba(100, 181, 246, 0.28)' : 'rgba(33, 150, 243, 0.12)',
  color: isDark ? '#64b5f6' : '#0d47a1',
});

export const getChipTipoEmpresa = (isDark) => ({
  bg: isDark ? 'rgba(100, 181, 246, 0.28)' : 'rgba(33, 150, 243, 0.12)',
  color: isDark ? '#64b5f6' : '#0d47a1',
});
