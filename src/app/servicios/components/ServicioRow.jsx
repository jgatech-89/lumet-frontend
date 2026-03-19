import { TableCell, Chip, IconButton, Stack } from '@mui/material';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadoActivo, getChipEstadoInactivo } from '../../../utils/chipColors';
import { getChipTipoEmpresa } from '../../../utils/chipColors';
import { getActionBtnBlue, getActionBtnRed } from '../../../components/shared/actionButtonStyles';
import { compactCellSx, compactChipSx } from '../../../components/shared/actionButtonStyles';
import { EditIcon, DeleteIcon } from '../../../utils/icons';

export function ContratistaRow({ row, onEdit, onDelete }) {
  const { isDark } = useThemeMode();
  const isActivo = row.estado === 'Activa' || row.estado === 'Activo';
  const chipEstado = isActivo ? getChipEstadoActivo(isDark) : getChipEstadoInactivo(isDark);
  const chipTipoEmpresa = getChipTipoEmpresa(isDark);
  const actionBtnBlue = getActionBtnBlue(isDark);
  const actionBtnRed = getActionBtnRed(isDark);

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.servicio}</TableCell>
      <TableCell sx={compactCellSx}>
        <Chip
          label={row.tipoEmpresa}
          size="small"
          variant="filled"
          sx={{
            fontWeight: 500,
            borderRadius: 999,
            px: 1.25,
            bgcolor: chipTipoEmpresa.bg,
            color: chipTipoEmpresa.color,
            '& .MuiChip-label': { px: 0.5 },
            ...compactChipSx,
          }}
        />
      </TableCell>
      <TableCell sx={compactCellSx}>
        <Chip
          label={row.estado}
          size="small"
          variant="filled"
          sx={{
            fontWeight: 500,
            borderRadius: 999,
            px: 1.25,
            bgcolor: chipEstado.bg,
            color: chipEstado.color,
            '& .MuiChip-label': { px: 0.5 },
            ...compactChipSx,
          }}
        />
      </TableCell>
      <TableCell align="center" sx={compactCellSx}>
        <Stack direction="row" justifyContent="center" spacing={0.75}>
          <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue} onClick={() => onEdit(row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed} onClick={() => onDelete(row)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </TableCell>
    </>
  );
}
