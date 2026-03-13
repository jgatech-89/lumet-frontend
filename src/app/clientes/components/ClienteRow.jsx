import { useState } from 'react';
import { TableCell, Chip, IconButton, Stack, Menu, MenuItem, useTheme, useMediaQuery, SvgIcon } from '@mui/material';

const MoreVertIcon = () => (
  <SvgIcon fontSize="small"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></SvgIcon>
);
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

export function ClienteRow({ row, chipEstados, opcionesEstadoVenta = [], onEdit, onDescargar, onCambiarEstado, onEliminar, onAgregarProducto, compact = false }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const { isDark } = useThemeMode();
  const actionBtnBlue = getActionBtnBlue(isDark);
  const actionBtnRed = getActionBtnRed(isDark);
  const valorEstadoVenta = (row.estado_venta || '').trim() || 'venta_iniciada';
  const labelEstadoVenta = opcionesEstadoVenta.find((o) => (o.value || '').toLowerCase() === valorEstadoVenta.toLowerCase())?.label ?? valorEstadoVenta;
  const chipStyle = labelEstadoVenta && chipEstados[labelEstadoVenta]
    ? chipEstados[labelEstadoVenta]
    : { bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: 'text.secondary' };

  const handleCloseMenu = () => setMenuAnchor(null);

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.nombre}</TableCell>
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.telefono}</TableCell>}
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.correo}</TableCell>}
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
      <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{compact ? (row.vendedor ?? '-') : (row.vendedor ?? '-')}</TableCell>
      <TableCell align="center" sx={compactCellSx}>
        {isSmallScreen ? (
          <>
            <IconButton
              size="small"
              aria-label="Opciones"
              aria-haspopup="true"
              aria-controls={menuAnchor ? 'cliente-row-menu' : undefined}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={actionBtnBlue}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="cliente-row-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { minWidth: 200 } }}
            >
              <MenuItem onClick={() => { onAgregarProducto?.(row); handleCloseMenu(); }}>
                Agregar producto
              </MenuItem>
              <MenuItem onClick={() => { onEdit?.(row); handleCloseMenu(); }}>
                Editar
              </MenuItem>
              <MenuItem onClick={() => { onDescargar?.(row); handleCloseMenu(); }}>
                Descargar PDF
              </MenuItem>
              <MenuItem onClick={() => { onCambiarEstado?.(row); handleCloseMenu(); }}>
                Cambiar estado
              </MenuItem>
              <MenuItem onClick={() => { onEliminar?.(row); handleCloseMenu(); }} sx={{ color: 'error.main' }}>
                Eliminar
              </MenuItem>
            </Menu>
          </>
        ) : (
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
        )}
      </TableCell>
    </>
  );
}
