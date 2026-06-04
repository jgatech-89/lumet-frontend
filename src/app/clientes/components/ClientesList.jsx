import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { COMPACT_MEDIA } from '../../../utils/theme';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { useClientes } from '../logic/useClientes';
import { COLUMNAS_TIPO_SERVICIO } from '../logic/constants';
import { usePermissions } from '../../../hooks/usePermissions';
import { ClienteRow } from './ClienteRow';
import { ClienteDetalleModal } from './ClienteDetalleModal';
import { ImportarClientesModal } from './ImportarClientesModal';
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

const headerCellSx = (isDark) => ({
  fontWeight: 600,
  color: 'text.secondary',
  fontSize: '0.8125rem',
  py: 1.25,
  whiteSpace: 'nowrap',
  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
  [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 },
});

const DownloadExcelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z" />
  </svg>
);

const UploadExcelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
  </svg>
);

export function ClientesList() {
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDark } = useThemeMode();
  const { showSnackbar } = useSnackbar();
  const CHIP_ESTADOS = getChipEstadosVenta(isDark);
  const { canImportExcelClientes, canExportExcelClientes } = usePermissions();
  const {
    clientes,
    total,
    productosPaginaPorServicio,
    productosTotalPorServicio,
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
  const [modalImportar, setModalImportar] = useState(false);

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
        height: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        [COMPACT_MEDIA]: { borderRadius: 2 },
      }}
    >
      {/* Cabecera + filtros: altura fija según contenido */}
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: { xs: 1.5, sm: 2 },
          [COMPACT_MEDIA]: { px: 1.5, pt: 1.5, pb: 1 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2, [COMPACT_MEDIA]: { mb: 1.5, gap: 1 } }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="text.primary"
              gutterBottom
              sx={{ letterSpacing: '-0.02em', mb: 0.5, [COMPACT_MEDIA]: { fontSize: '1.35rem' } }}
            >
              Clientes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ [COMPACT_MEDIA]: { fontSize: '0.875rem' } }}>
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
              py: 1,
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
              '&:hover': { boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)' },
              [COMPACT_MEDIA]: { px: 1.5, py: 0.75, fontSize: '0.875rem' },
            }}
          >
            Nuevo cliente
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={1.5}
          alignItems={{ sm: 'center' }}
          flexWrap="wrap"
          useFlexGap
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
          {canImportExcelClientes && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadExcelIcon />}
              onClick={() => setModalImportar(true)}
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
              Importar masivo
            </Button>
          )}
          {canExportExcelClientes && (
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
          )}
        </Stack>
      </Box>

      {/* Zona tabla + paginación: altura acotada, scroll solo en la tabla */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          px: { xs: 2, sm: 3 },
          pb: { xs: 1.5, sm: 2 },
          [COMPACT_MEDIA]: { px: 1.5, pb: 1 },
        }}
      >
        <TableContainer
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            overflow: 'auto',
            [COMPACT_MEDIA]: { borderRadius: 1 },
          }}
        >
        <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx(isDark)}>Nombre</TableCell>
              {!isCompactView && <TableCell sx={headerCellSx(isDark)}>Tipo identificación</TableCell>}
              {!isCompactView && <TableCell sx={headerCellSx(isDark)}>Nº identificación</TableCell>}
              {!isCompactView && <TableCell sx={headerCellSx(isDark)}>Dirección</TableCell>}
              {!isCompactView && <TableCell sx={headerCellSx(isDark)}>Teléfono</TableCell>}
              {!isCompactView && <TableCell sx={headerCellSx(isDark)}>Correo</TableCell>}
              {!isCompactView && COLUMNAS_TIPO_SERVICIO.map(({ key, label }) => (
                <TableCell key={key} align="center" sx={headerCellSx(isDark)}>
                  {label}
                </TableCell>
              ))}
              <TableCell sx={headerCellSx(isDark)} align="center">
                Opciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableLoader columnCount={isCompactView ? 2 : 8 + COLUMNAS_TIPO_SERVICIO.length} message="Cargando clientes..." />
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

        <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          flexShrink: 0,
          width: '100%',
          pt: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          flexWrap: 'wrap',
          gap: 1.5,
          [COMPACT_MEDIA]: { pt: 1, gap: 1 },
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
            [COMPACT_MEDIA]: { fontSize: '0.8125rem', textAlign: 'center', width: '100%' },
          }}
        >
          Mostrando {inicio}–{fin} de {total} clientes
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          gap={0.75}
          useFlexGap
          sx={{
            flex: 1,
            minWidth: 0,
            px: { sm: 1 },
            [COMPACT_MEDIA]: { width: '100%', justifyContent: 'center' },
          }}
        >
            {COLUMNAS_TIPO_SERVICIO.map(({ key, label, accent, accentDark }) => {
              const tone = isDark ? accentDark : accent;
              return (
                <Box
                  key={key}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 10,
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                    color: 'text.secondary',
                    bgcolor: `${tone}14`,
                    border: '1px solid',
                    borderColor: `${tone}40`,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: tone,
                      flexShrink: 0,
                    }}
                  />
                  <Typography component="span" variant="caption" sx={{ color: tone }}>
                    {label}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    <Box component="span" sx={{ color: tone }}>
                      {productosPaginaPorServicio[key] ?? 0}
                    </Box>
                    <Box component="span" sx={{ color: 'text.disabled', mx: 0.35 }}>
                      de
                    </Box>
                    {productosTotalPorServicio[key] ?? 0}
                  </Typography>
                </Box>
              );
            })}
        </Stack>
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
            ml: { sm: 'auto' },
            '& .MuiPagination-ul': { flexWrap: 'wrap', justifyContent: 'center' },
            [COMPACT_MEDIA]: {
              ml: 0,
              width: '100%',
              '& .MuiPaginationItem-root': { minWidth: 28, height: 28, fontSize: '0.75rem' },
            },
          }}
        />
      </Stack>
      </Box>

      <ImportarClientesModal
        open={modalImportar}
        onClose={() => setModalImportar(false)}
        onExito={recargar}
      />

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
