import { useState } from 'react';
import { TableCell, Chip, IconButton, Stack, Menu, MenuItem, useTheme, useMediaQuery, SvgIcon } from '@mui/material';

const MoreVertIcon = () => (
  <SvgIcon fontSize="small"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></SvgIcon>
);
import { useThemeMode } from '../../../context/ThemeContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { getActionBtnBlue, getActionBtnRed } from '../../../components/shared/actionButtonStyles';
import { compactCellSx, compactChipSx } from '../../../components/shared/actionButtonStyles';
import { DeleteIcon, EyeIcon } from '../../../utils/icons';

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fontSize="small">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

export function ClienteRow({ row, chipEstados = {}, opcionesEstadoVenta = [], onDescargar, onCambiarEstado, onEliminar, onVer, compact = false }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const { isDark } = useThemeMode();
  const { canDeleteClient, canExportImportPdfClientes } = usePermissions();
  const actionBtnBlue = getActionBtnBlue(isDark);
  const actionBtnRed = getActionBtnRed(isDark);
  const handleCloseMenu = () => setMenuAnchor(null);

  return (
    <>
      <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.nombre}</TableCell>
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.tipo_identificacion || '-'}</TableCell>}
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.numero_identificacion || '-'}</TableCell>}
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.cups || '-'}</TableCell>}
      {!compact && (
        <TableCell
          sx={{
            ...compactCellSx,
            color: 'text.secondary',
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={row.direccion}
        >
          {row.direccion || '-'}
        </TableCell>
      )}
      {!compact && <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.telefono}</TableCell>}
      {!compact && (
        <TableCell
          sx={{
            ...compactCellSx,
            color: 'text.secondary',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-all',
          }}
          title={row.correo_electronico_o_carta}
        >
          {row.correo_electronico_o_carta || '-'}
        </TableCell>
      )}
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
              {canExportImportPdfClientes && (
                <MenuItem onClick={() => { onDescargar?.(row); handleCloseMenu(); }}>
                  Descargar PDF
                </MenuItem>
              )}
              <MenuItem onClick={() => { onVer?.(row); handleCloseMenu(); }}>
                Ver detalle
              </MenuItem>
              {canDeleteClient && (
              <MenuItem onClick={() => { onEliminar?.(row); handleCloseMenu(); }} sx={{ color: 'error.main' }}>
                Eliminar
              </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <Stack direction="row" justifyContent="center" spacing={0.75}>
            <IconButton size="small" aria-label="Ver detalle" title="Ver detalle" sx={actionBtnBlue} onClick={() => onVer?.(row)}>
              <EyeIcon />
            </IconButton>
            {canExportImportPdfClientes && (
            <IconButton size="small" aria-label="Descargar" title="Descargar" sx={actionBtnBlue} onClick={() => onDescargar?.(row)}>
              <DownloadIcon />
            </IconButton>
            )}
            {canDeleteClient && (
            <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed} onClick={() => onEliminar?.(row)}>
                <DeleteIcon />
              </IconButton>
            )}
        </Stack>
        )}
      </TableCell>
    </>
  );
}
