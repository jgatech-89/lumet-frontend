import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Pagination,
} from '@mui/material';
import { useThemeMode } from '../../../context/ThemeContext';
import { TableLoader } from '../../../components/loading';
import { ContratistaRow } from './ServicioRow';
import { ContratistaModals } from './ServicioModals';
import { CONFIG_FILAS_POR_PAGINA } from '../logic/constants';
import { COMPACT_MEDIA } from '../../../utils/theme';

const COLUMNS = ['Contratista', 'Tipo de servicio', 'Estado', 'Opciones'];

export function ContratistasConfigSection({ contratistas, empresasParaSelect, cargarEmpresasParaSelect, pagina, setPagina }) {
  const { isDark } = useThemeMode();
  const totalItems = contratistas.contratistasTotal ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / CONFIG_FILAS_POR_PAGINA));
  const filasPagina = contratistas.contratistas ?? [];
  const inicio = totalItems === 0 ? 0 : (pagina - 1) * CONFIG_FILAS_POR_PAGINA + 1;
  const fin = totalItems === 0 ? 0 : Math.min(pagina * CONFIG_FILAS_POR_PAGINA, totalItems);
  const handleChangePagina = (_, value) => setPagina(value);

  return (
    <>
      <TableContainer
        sx={{
          flexShrink: 0,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          [COMPACT_MEDIA]: { borderRadius: 1 },
        }}
      >
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.8125rem',
                    py: 1.5,
                    [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 },
                    ...(col === 'Opciones' && { align: 'center' }),
                  }}
                  align={col === 'Opciones' ? 'center' : 'left'}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {contratistas.loading ? (
              <TableLoader columnCount={COLUMNS.length} message="Cargando contratistas..." />
            ) : (
              filasPagina.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ContratistaRow
                  row={row}
                  onEdit={contratistas.handleAbrirEditar}
                  onDelete={contratistas.handleAbrirEliminar}
                />
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ flex: 1, minHeight: 0 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexWrap: 'wrap',
          gap: 1.5,
          borderRadius: '0 0 12px 12px',
          [COMPACT_MEDIA]: { py: 1, px: 1.5, gap: 1 },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, [COMPACT_MEDIA]: { fontSize: '0.75rem' } }}>
          Mostrando {inicio}–{fin} de {totalItems} contratistas
        </Typography>
        <Pagination
          count={totalPages}
          page={pagina}
          onChange={handleChangePagina}
          color="primary"
          size="small"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
          sx={{
            flexShrink: 0,
            '& .MuiPagination-ul': { flexWrap: 'wrap', justifyContent: 'center' },
            [COMPACT_MEDIA]: { '& .MuiPaginationItem-root': { minWidth: 28, height: 28, fontSize: '0.75rem' } },
          }}
        />
      </Stack>

      <ContratistaModals
        serviciosParaSelect={empresasParaSelect}
        modalNueva={contratistas.modalNueva}
        modalEditar={contratistas.modalEditar}
        modalEliminar={contratistas.modalEliminar}
        nombre={contratistas.nombre}
        setNombre={contratistas.setNombre}
        servicioId={contratistas.servicioId}
        setServicioId={contratistas.setServicioId}
        estadoServicio={contratistas.estadoServicio}
        setEstadoServicio={contratistas.setEstadoServicio}
        aEliminar={contratistas.aEliminar}
        guardandoNuevo={contratistas.guardandoNuevo}
        guardandoEditar={contratistas.guardandoEditar}
        eliminando={contratistas.eliminando}
        handleCerrarNueva={contratistas.handleCerrarNueva}
        handleGuardarNueva={contratistas.handleGuardarNueva}
        handleCerrarEditar={contratistas.handleCerrarEditar}
        handleGuardarEditar={contratistas.handleGuardarEditar}
        handleCerrarEliminar={contratistas.handleCerrarEliminar}
        handleConfirmarEliminar={contratistas.handleConfirmarEliminar}
      />
    </>
  );
}
