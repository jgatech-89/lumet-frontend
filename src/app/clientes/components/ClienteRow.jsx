import { TableCell, Chip, IconButton, Stack } from '@mui/material';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { getActionBtnBlue, getActionBtnRed } from '../../../components/shared/actionButtonStyles';
import { compactCellSx, compactChipSx } from '../../../components/shared/actionButtonStyles';
import { EditIcon, DeleteIcon } from '../../../utils/icons';

const VisibilityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fontSize="small">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fontSize="small">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

export function ClienteRow({ row, chipEstados }) {
  const { isDark } = useThemeMode();
  const actionBtnBlue = getActionBtnBlue(isDark);
  const actionBtnRed = getActionBtnRed(isDark);
  const chipStyle = chipEstados[row.estado] ?? {
    bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    color: 'text.secondary',
  };

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.nombre}</TableCell>
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.telefono}</TableCell>
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.correo}</TableCell>
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.vendedor ?? '-'}</TableCell>
      <TableCell sx={compactCellSx}>
        <Chip
          label={row.estado}
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
      <TableCell align="center" sx={compactCellSx}>
        <Stack direction="row" justifyContent="center" spacing={0.75}>
          <IconButton size="small" aria-label="Ver" title="Ver" sx={actionBtnBlue}>
            <VisibilityIcon />
          </IconButton>
          <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" aria-label="Descargar" title="Descargar" sx={actionBtnBlue}>
            <DownloadIcon />
          </IconButton>
          <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </TableCell>
    </>
  );
}
