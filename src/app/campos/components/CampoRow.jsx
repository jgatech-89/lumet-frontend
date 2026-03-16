import { TableCell, Chip, IconButton, Stack } from '@mui/material';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadoActivo, getChipEstadoInactivo } from '../../../utils/chipColors';
import { getChipTipoCampo } from '../../../utils/chipColors';
import { getActionBtnBlue, getActionBtnRed, getActionBtnGray } from '../../../components/shared/actionButtonStyles';
import { compactCellSx, compactChipSx } from '../../../components/shared/actionButtonStyles';
import { EditIcon, DeleteIcon, LinkIcon, EyeIcon } from '../../../utils/icons';

export function CampoRow({ row, onEdit, onDelete, onRelacionar, onVerDetalles, getTipoLabel }) {
  const { isDark } = useThemeMode();
  const isActivo = row.estado === 'Activa' || row.estado === 'Activo';
  const chipEstado = isActivo ? getChipEstadoActivo(isDark) : getChipEstadoInactivo(isDark);
  const chipTipoCampo = getChipTipoCampo(isDark);
  const actionBtnBlue = getActionBtnBlue(isDark);
  const actionBtnRed = getActionBtnRed(isDark);
  const actionBtnGray = getActionBtnGray(isDark);

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.campo}</TableCell>
      <TableCell sx={compactCellSx}>
        <Chip
          label={getTipoLabel ? (getTipoLabel(row.tipo) || row.tipoCampo) : row.tipoCampo}
          size="small"
          variant="filled"
          sx={{
            fontWeight: 500,
            borderRadius: 999,
            px: 1.25,
            bgcolor: chipTipoCampo.bg,
            color: chipTipoCampo.color,
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
          {onVerDetalles && (
            <IconButton size="small" aria-label="Ver detalles" title="Ver detalles" sx={actionBtnGray} onClick={() => onVerDetalles(row)}>
              <EyeIcon />
            </IconButton>
          )}
          <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue} onClick={() => onEdit(row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed} onClick={() => onDelete(row)}>
            <DeleteIcon />
          </IconButton>
          {onRelacionar && (
            <IconButton size="small" aria-label="Relacionar" title="Relacionar" sx={actionBtnGray} onClick={() => onRelacionar(row)}>
              <LinkIcon />
            </IconButton>
          )}
        </Stack>
      </TableCell>
    </>
  );
}
