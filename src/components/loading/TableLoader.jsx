import { TableRow, TableCell, CircularProgress, Typography } from '@mui/material';

/**
 * Fila de carga para tablas. Se usa dentro de <TableBody>.
 * @param {number} columnCount - Número de columnas de la tabla (para colSpan)
 * @param {string} message - Mensaje opcional bajo el spinner
 */
const TableLoader = ({ columnCount = 1, message = 'Cargando...' }) => (
  <TableRow>
    <TableCell colSpan={columnCount} align="center" sx={{ py: 4 }}>
      <CircularProgress size={28} sx={{ color: 'primary.main', display: 'block', mx: 'auto' }} aria-hidden="true" />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {message}
        </Typography>
      )}
    </TableCell>
  </TableRow>
);

export default TableLoader;
