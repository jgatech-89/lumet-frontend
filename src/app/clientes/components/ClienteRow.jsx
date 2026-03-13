import { TableCell, Chip, IconButton, Stack } from '@mui/material';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { getActionBtnBlue, getActionBtnRed } from '../../../components/shared/actionButtonStyles';
import { compactCellSx, compactChipSx } from '../../../components/shared/actionButtonStyles';
import { EditIcon, DeleteIcon, SettingsIcon, AddIcon } from '../../../utils/icons';

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fontSize="small">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

export function ClienteRow({ row, chipEstados, opcionesEstadoVenta = [], onEdit, onDescargar, onCambiarEstado, onEliminar, onAgregarProducto }) {
  const { isDark } = useThemeMode();
  const actionBtnBlue = getActionBtnBlue(isDark);
  const actionBtnRed = getActionBtnRed(isDark);
  const valorEstadoVenta = (row.estado_venta || '').trim() || 'venta_iniciada';
  const labelEstadoVenta = opcionesEstadoVenta.find((o) => (o.value || '').toLowerCase() === valorEstadoVenta.toLowerCase())?.label ?? valorEstadoVenta;
  const chipStyle = labelEstadoVenta && chipEstados[labelEstadoVenta]
    ? chipEstados[labelEstadoVenta]
    : { bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: 'text.secondary' };

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.nombre}</TableCell>
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.telefono}</TableCell>
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.correo}</TableCell>
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>
        <Chip
          label={labelEstadoVenta}
          size="small"
          variant="filled"
          sx={{
            fontWeight: 500,
            borderRadius: 999,
            px: 1.25,
            bgcolor: chipStyle.bg,
            color: chipStyle.color,
            '& .MuiChip-label': { px: 0.5 },
            ...compactChipSx,
          }}
        />
      </TableCell>
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.vendedor ?? '-'}</TableCell>
      <TableCell align="center" sx={compactCellSx}>
        <Stack direction="row" justifyContent="center" spacing={0.75}>
          <IconButton size="small" aria-label="Agregar producto" title="Agregar producto" sx={actionBtnBlue} onClick={() => onAgregarProducto?.(row)}>
            <AddIcon />
          </IconButton>
          <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue} onClick={() => onEdit?.(row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" aria-label="Descargar" title="Descargar" sx={actionBtnBlue} onClick={() => onDescargar?.(row)}>
            <DownloadIcon />
          </IconButton>
          <IconButton size="small" aria-label="Gestionar estado" title="Gestionar estado" sx={actionBtnBlue} onClick={() => onCambiarEstado?.(row)}>
            <SettingsIcon />
          </IconButton>
          <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed} onClick={() => onEliminar?.(row)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </TableCell>
    </>
  );
}
