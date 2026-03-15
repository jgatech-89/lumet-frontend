import { TableCell, Chip, IconButton, Stack } from '@mui/material';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadoActivo, getChipEstadoInactivo } from '../../../utils/chipColors';
import { getActionBtnBlue, getActionBtnRed } from '../../../components/shared/actionButtonStyles';
import { compactCellSx, compactChipSx } from '../../../components/shared/actionButtonStyles';
import { EditIcon, DeleteIcon } from '../../../utils/icons';

export function ProductoRow({ row, onEdit, onDelete }) {
  const { isDark } = useThemeMode();
  const isActivo = row.estado === 'Activo' || row.estadoProducto === '1';
  const chip = isActivo ? getChipEstadoActivo(isDark) : getChipEstadoInactivo(isDark);

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.nombre}</TableCell>
      <TableCell sx={compactCellSx}>
        <Chip
          label={row.estado ?? (row.estadoProducto === '1' ? 'Activo' : 'Inactivo')}
          size="small"
          variant="filled"
          sx={{
            fontWeight: 500,
            borderRadius: 999,
            px: 1.25,
            bgcolor: chip.bg,
            color: chip.color,
            '& .MuiChip-label': { px: 0.5 },
            ...compactChipSx,
          }}
        />
      </TableCell>
      <TableCell align="center" sx={compactCellSx}>
        <Stack direction="row" justifyContent="center" spacing={0.75}>
          <IconButton size="small" aria-label="Editar" title="Editar" sx={getActionBtnBlue(isDark)} onClick={() => onEdit(row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={getActionBtnRed(isDark)} onClick={() => onDelete(row)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </TableCell>
    </>
  );
}
