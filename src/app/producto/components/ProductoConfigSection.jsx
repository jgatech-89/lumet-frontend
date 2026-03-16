import { useState } from 'react';
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
import { ProductoRow } from './ProductoRow';
import { ProductoModals } from './ProductoModals';
import { RelacionModal } from '../../../components/configuracion/RelacionModal';
import { PRODUCTOS_POR_PAGINA } from '../logic/constants';
import { COMPACT_MEDIA } from '../../../utils/theme';

const COLUMNS = ['Nombre', 'Estado', 'Opciones'];

export function ProductoConfigSection({ productos, pagina, setPagina }) {
  const { isDark } = useThemeMode();
  const [rowForRelacion, setRowForRelacion] = useState(null);
  const totalItems = productos.total;
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTOS_POR_PAGINA));
  const inicio = totalItems === 0 ? 0 : (pagina - 1) * PRODUCTOS_POR_PAGINA + 1;
  const fin = totalItems === 0 ? 0 : Math.min(pagina * PRODUCTOS_POR_PAGINA, totalItems);
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
            {productos.loading ? (
              <TableLoader columnCount={COLUMNS.length} message="Cargando productos..." />
            ) : (
              productos.productos.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ProductoRow
                    row={row}
                    onEdit={productos.handleAbrirEditar}
                    onDelete={productos.handleAbrirEliminar}
                    onRelacionar={setRowForRelacion}
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
          Mostrando {inicio}–{fin} de {totalItems} productos
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

      <ProductoModals
        modalNueva={productos.modalNueva}
        modalEditar={productos.modalEditar}
        modalEliminar={productos.modalEliminar}
        nombre={productos.nombre}
        setNombre={productos.setNombre}
        estadoProducto={productos.estadoProducto}
        setEstadoProducto={productos.setEstadoProducto}
        guardandoNuevo={productos.guardandoNuevo}
        guardandoEditar={productos.guardandoEditar}
        eliminando={productos.eliminando}
        aEliminar={productos.aEliminar}
        handleCerrarNueva={productos.handleCerrarNueva}
        handleGuardarNueva={productos.handleGuardarNueva}
        handleCerrarEditar={productos.handleCerrarEditar}
        handleGuardarEditar={productos.handleGuardarEditar}
        handleCerrarEliminar={productos.handleCerrarEliminar}
        handleConfirmarEliminar={productos.handleConfirmarEliminar}
      />
      <RelacionModal
        open={Boolean(rowForRelacion)}
        onClose={() => setRowForRelacion(null)}
        origen_tipo="producto"
        origen_id={rowForRelacion?.id}
        nombre_entidad="Producto"
      />
    </>
  );
}
