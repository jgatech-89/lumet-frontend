import { useState } from 'react';
import { TableCell, Chip, IconButton, Stack, Menu, MenuItem, useTheme, useMediaQuery, SvgIcon } from '@mui/material';

const MoreVertIcon = () => (
  <SvgIcon fontSize="small"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></SvgIcon>
);
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { getActionBtnBlue, getActionBtnRed } from '../../../components/shared/actionButtonStyles';
import { compactCellSx, compactChipSx } from '../../../components/shared/actionButtonStyles';
import { EditIcon, DeleteIcon, AddIcon, EyeIcon } from '../../../utils/icons';

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fontSize="small">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

export function ClienteRow({ row, chipEstados = {}, opcionesEstadoVenta = [], onEdit, onDescargar, onCambiarEstado, onEliminar, onAgregarProducto, onVer, compact = false }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const { isDark } = useThemeMode();
  const actionBtnBlue = getActionBtnBlue(isDark);
  const actionBtnRed = getActionBtnRed(isDark);
  const handleCloseMenu = () => setMenuAnchor(null);

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.nombre}</TableCell>
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.numero_identificacion || '-'}</TableCell>}
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.telefono}</TableCell>}
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.correo}</TableCell>}
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
              <MenuItem onClick={() => { onVer?.(row); handleCloseMenu(); }}>
                Ver detalle
              </MenuItem>
              <MenuItem onClick={() => { onEliminar?.(row); handleCloseMenu(); }} sx={{ color: 'error.main' }}>
                Eliminar
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Stack direction="row" justifyContent="center" spacing={0.75}>
            <IconButton size="small" aria-label="Ver detalle" title="Ver detalle" sx={actionBtnBlue} onClick={() => onVer?.(row)}>
              <EyeIcon />
            </IconButton>
            <IconButton size="small" aria-label="Agregar producto" title="Agregar producto" sx={actionBtnBlue} onClick={() => onAgregarProducto?.(row)}>
              <AddIcon />
            </IconButton>
            <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue} onClick={() => onEdit?.(row)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" aria-label="Descargar" title="Descargar" sx={actionBtnBlue} onClick={() => onDescargar?.(row)}>
              <DownloadIcon />
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
