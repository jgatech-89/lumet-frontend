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
import { VendedorRow } from './VendedorRow';
import { VendedorModals } from './VendedorModals';
import { VENDEDORES_POR_PAGINA } from '../logic/constants';
import { COMPACT_MEDIA } from '../../../utils/theme';

const COLUMNS = ['Nombre', 'Nº identificación', 'Tipo identificación', 'Estado', 'Opciones'];

export function VendedorConfigSection({ vendedores, pagina, setPagina }) {
  const { isDark } = useThemeMode();
  const totalItems = vendedores.total;
  const totalPages = Math.max(1, Math.ceil(totalItems / VENDEDORES_POR_PAGINA));
  const inicio = totalItems === 0 ? 0 : (pagina - 1) * VENDEDORES_POR_PAGINA + 1;
  const fin = totalItems === 0 ? 0 : Math.min(pagina * VENDEDORES_POR_PAGINA, totalItems);
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
            {vendedores.loading ? (
              <TableLoader columnCount={COLUMNS.length} message="Cargando vendedores..." />
            ) : (
              vendedores.vendedores.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <VendedorRow
                    row={row}
                    onEdit={vendedores.handleAbrirEditar}
                    onDelete={vendedores.handleAbrirEliminar}
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
          Mostrando {inicio}–{fin} de {totalItems} vendedores
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

      <VendedorModals
        modalNueva={vendedores.modalNueva}
        modalEditar={vendedores.modalEditar}
        modalEliminar={vendedores.modalEliminar}
        nombre={vendedores.nombre}
        setNombre={vendedores.setNombre}
        numeroIdentificacion={vendedores.numeroIdentificacion}
        setNumeroIdentificacion={vendedores.setNumeroIdentificacion}
        tipoIdentificacion={vendedores.tipoIdentificacion}
        setTipoIdentificacion={vendedores.setTipoIdentificacion}
        estado={vendedores.estado}
        setEstado={vendedores.setEstado}
        guardandoNuevo={vendedores.guardandoNuevo}
        guardandoEditar={vendedores.guardandoEditar}
        eliminando={vendedores.eliminando}
        aEliminar={vendedores.aEliminar}
        numeroIdentificacionValido={vendedores.numeroIdentificacionValido}
        handleCerrarNueva={vendedores.handleCerrarNueva}
        handleGuardarNueva={vendedores.handleGuardarNueva}
        handleCerrarEditar={vendedores.handleCerrarEditar}
        handleGuardarEditar={vendedores.handleGuardarEditar}
        handleCerrarEliminar={vendedores.handleCerrarEliminar}
        handleConfirmarEliminar={vendedores.handleConfirmarEliminar}
      />
    </>
  );
}
