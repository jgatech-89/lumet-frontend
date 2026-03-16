import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { COMPACT_MEDIA } from '../../../utils/theme';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { useClientes } from '../logic/useClientes';
import { ClienteRow } from './ClienteRow';
import { ClienteDetalleModal } from './ClienteDetalleModal';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';
import { TableLoader, LoadingButton } from '../../../components/loading';
import { SearchIcon } from '../../../utils/icons';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';
import * as apiCliente from '../logic/apiCliente';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Pagination,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const DownloadExcelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z" />
  </svg>
);

export function ClientesList() {
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDark } = useThemeMode();
  const { showSnackbar } = useSnackbar();
  const CHIP_ESTADOS = getChipEstadosVenta(isDark);
  const {
    clientes,
    total,
    loading,
    pagina,
    inicio,
    fin,
    totalPaginas,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    handleChangePagina,
    opcionesEstadoVenta,
    recargar,
  } = useClientes();

  const [modalVerDetalle, setModalVerDetalle] = useState(false);
  const [clienteVerDetalle, setClienteVerDetalle] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [exportando, setExportando] = useState(false);

  // Solo abrir modal con la fila; el detalle se carga dentro del modal (una sola consulta).
  const handleAbrirVer = useCallback((row) => {
    setClienteVerDetalle(row);
    setModalVerDetalle(true);
  }, []);

  const handleCerrarVer = useCallback(() => {
    setModalVerDetalle(false);
    setClienteVerDetalle(null);
  }, []);

  const handleCambiarEstado = useCallback(async (clienteId, nuevoEstado) => {
    try {
      await apiCliente.cambiarEstadoCliente(clienteId, nuevoEstado);
      showSnackbar('Estado actualizado correctamente.', 'success');
      recargar();
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al actualizar estado'), 'error');
      throw e;
    }
  }, [showSnackbar, recargar]);

  const handleAbrirEliminar = useCallback((row) => {
    setClienteAEliminar(row);
    setModalEliminar(true);
  }, []);

  const handleCerrarEliminar = useCallback(() => {
    setModalEliminar(false);
    setClienteAEliminar(null);
  }, []);

  const handleConfirmarEliminar = useCallback(async () => {
    if (!clienteAEliminar?.id) return;
    setEliminando(true);
    try {
      await apiCliente.eliminarCliente(clienteAEliminar.id);
      showSnackbar('Cliente eliminado correctamente.', 'success');
      handleCerrarEliminar();
      recargar();
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al eliminar cliente'), 'error');
    } finally {
      setEliminando(false);
    }
  }, [clienteAEliminar?.id, showSnackbar, recargar]);

  const handleDescargarPdf = useCallback(async (row) => {
    try {
      const blob = await apiCliente.descargarPdfCliente(row.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cliente_${row.id}_${(row.nombre || 'contrato').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showSnackbar('PDF descargado correctamente.', 'success');
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al descargar PDF'), 'error');
    }
  }, [showSnackbar]);

  const handleExportarExcel = useCallback(async () => {
    setExportando(true);
    try {
      const filters = { search: busqueda?.trim() || undefined };
      if (filtroEstado && filtroEstado !== 'todos') filters.estado_venta = filtroEstado;
      const blob = await apiCliente.exportarExcelClientes(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clientes.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      showSnackbar('Exportación completada.', 'success');
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al exportar'), 'error');
    } finally {
      setExportando(false);
    }
  }, [busqueda, filtroEstado, showSnackbar]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        [COMPACT_MEDIA]: { borderRadius: 2 },
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          pb: { xs: 3, sm: 5 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          [COMPACT_MEDIA]: { p: 1.5, pb: 2, overflowY: 'auto', overflowX: 'hidden' },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 3, flexShrink: 0, [COMPACT_MEDIA]: { mb: 1.5, gap: 1 } }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="text.primary"
              gutterBottom
              sx={{ letterSpacing: '-0.02em', [COMPACT_MEDIA]: { fontSize: '1.25rem' } }}
            >
              Clientes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ [COMPACT_MEDIA]: { fontSize: '0.8125rem' } }}>
              Administra tu base de clientes
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/nuevo-cliente"
            variant="contained"
            startIcon={<Typography component="span" sx={{ fontSize: '1.25rem', lineHeight: 1, fontWeight: 300 }}>+</Typography>}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1.25,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
              '&:hover': { boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)' },
              [COMPACT_MEDIA]: { px: 1.5, py: 0.75, fontSize: '0.8125rem' },
            }}
          >
            Nuevo cliente
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          alignItems={{ sm: 'center' }}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 4, flexShrink: 0, [COMPACT_MEDIA]: { mb: 2.5, gap: 1 } }}
        >
          <TextField
            placeholder="Buscar por nombre o nº identificación..."
            size="small"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '100%', minWidth: { xs: 0, sm: 280 }, flex: { xs: 'none', sm: 1 }, maxWidth: { sm: 420 } }}
          />
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 220 }, minWidth: { xs: 0, sm: 220 }, flexShrink: 0 }}>
            <InputLabel id="filtro-estado-label">Estado venta</InputLabel>
            <Select
              labelId="filtro-estado-label"
              value={filtroEstado}
              label="Estado venta"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <MenuItem value="">Seleccionar una opción</MenuItem>
              <MenuItem value="todos">Todos los estados</MenuItem>
              {opcionesEstadoVenta.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <LoadingButton
            variant="outlined"
            size="small"
            startIcon={!exportando ? <DownloadExcelIcon /> : null}
            onClick={handleExportarExcel}
            loading={exportando}
            loadingText="Exportando..."
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 0.75,
              px: 2.5,
              minHeight: 40,
              minWidth: { xs: '100%', sm: 160 },
              flexShrink: 0,
              fontSize: '0.875rem',
            }}
          >
            Exportar Excel
          </LoadingButton>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      fontSize: '0.8125rem',
                      py: 1.5,
                      [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 },
                    }}
                  >
                    Nombre
                  </TableCell>
                  {!isCompactView && (
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        fontSize: '0.8125rem',
                        py: 1.5,
                      }}
                    >
                      Nº identificación
                    </TableCell>
                  )}
                  {!isCompactView && (
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        fontSize: '0.8125rem',
                        py: 1.5,
                      }}
                    >
                      Teléfono
                    </TableCell>
                  )}
                  {!isCompactView && (
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        fontSize: '0.8125rem',
                        py: 1.5,
                      }}
                    >
                      Correo
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      fontSize: '0.8125rem',
                      py: 1.5,
                      [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 },
                    }}
                    align="center"
                  >
                    Opciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableLoader columnCount={isCompactView ? 2 : 5} message="Cargando clientes..." />
                ) : (
                  clientes.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        '&:last-child td': { borderBottom: 0 },
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ClienteRow
                        row={row}
                        chipEstados={CHIP_ESTADOS}
                        opcionesEstadoVenta={opcionesEstadoVenta}
                        onDescargar={handleDescargarPdf}
                        onEliminar={handleAbrirEliminar}
                        onVer={handleAbrirVer}
                        compact={isCompactView}
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
            Mostrando {inicio}–{fin} de {total} clientes
          </Typography>
          <Pagination
            count={totalPaginas}
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
        </Box>
      </Box>

      <ClienteDetalleModal
        open={modalVerDetalle}
        cliente={clienteVerDetalle}
        onClose={handleCerrarVer}
        opcionesEstadoVenta={opcionesEstadoVenta}
        onCambiarEstado={handleCambiarEstado}
        onExito={recargar}
      />

      <ConfirmDeleteDialog
        open={modalEliminar}
        onClose={handleCerrarEliminar}
        onConfirm={handleConfirmarEliminar}
        title="Eliminar cliente"
        message="¿Está seguro que desea eliminar este cliente?"
        itemName={clienteAEliminar?.nombre}
        loading={eliminando}
      />
    </Paper>
  );
}
