import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { EyeIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import * as apiCliente from '../logic/apiCliente';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { useThemeMode } from '../../../context/ThemeContext';
import { useSnackbar } from '../../../context/SnackbarContext';

function DataRow({ label, value }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Stack>
  );
}

export function ClienteDetalleModal({
  open,
  cliente,
  onClose,
  opcionesEstadoVenta = [],
  onCambioEstado,
  onExito,
}) {
  const { isDark } = useThemeMode();
  const { showSnackbar } = useSnackbar();
  const CHIP_ESTADOS = getChipEstadosVenta(isDark);

  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [productoVerDetalle, setProductoVerDetalle] = useState(null);
  const [estadosPorProducto, setEstadosPorProducto] = useState({});
  const [guardandoPorProducto, setGuardandoPorProducto] = useState({});

  useEffect(() => {
    if (!cliente?.id || !open) {
      setClienteDetalle(null);
      setProductoVerDetalle(null);
      return;
    }
    let cancelled = false;
    apiCliente.obtenerCliente(cliente.id).then((data) => {
      if (!cancelled) {
        setClienteDetalle(data);
        const emp = data.cliente_empresas || [];
        const init = {};
        emp.forEach((ce) => {
          init[ce.id] = (ce.estado_venta ?? '').trim() || 'venta_iniciada';
        });
        setEstadosPorProducto(init);
      }
    }).catch(() => {
      if (!cancelled) setClienteDetalle(null);
    });
    return () => { cancelled = true; };
  }, [cliente?.id, open]);

  useEffect(() => {
    const emp = clienteDetalle?.cliente_empresas || [];
    const next = {};
    emp.forEach((ce) => {
      next[ce.id] = (ce.estado_venta ?? '').trim() || 'venta_iniciada';
    });
    setEstadosPorProducto(next);
  }, [clienteDetalle?.cliente_empresas]);

  const handleCambiarEstado = useCallback(async (ce) => {
    if (!clienteDetalle?.id || !ce?.id) return;
    const nuevoEstado = estadosPorProducto[ce.id] ?? 'venta_iniciada';
    setGuardandoPorProducto((p) => ({ ...p, [ce.id]: true }));
    try {
      await apiCliente.cambiarEstadoCliente(clienteDetalle.id, nuevoEstado, ce.id);
      showSnackbar('Estado actualizado correctamente.', 'success');
      onCambioEstado?.();
      onExito?.();
      setEstadosPorProducto((p) => ({ ...p, [ce.id]: nuevoEstado }));
      setClienteDetalle((prev) => {
        if (!prev) return null;
        const empresas = (prev.cliente_empresas || []).map((e) =>
          e.id === ce.id ? { ...e, estado_venta: nuevoEstado } : e
        );
        return { ...prev, cliente_empresas: empresas };
      });
    } catch (e) {
      showSnackbar('Error al actualizar estado.', 'error');
    } finally {
      setGuardandoPorProducto((p) => ({ ...p, [ce.id]: false }));
    }
  }, [clienteDetalle?.id, estadosPorProducto, onCambioEstado, onExito, showSnackbar]);

  if (!clienteDetalle || !open) return null;

  const productos = clienteDetalle.cliente_empresas || [];
  const respuestas = clienteDetalle.respuestas || [];
  const respuestasOrdenadas = [...respuestas].sort((a, b) =>
    (a.nombre_campo || '').localeCompare(b.nombre_campo || '')
  );
  const respuestasSinVendedor = respuestasOrdenadas.filter(
    (r) => (r.nombre_campo || '').toLowerCase().replace(/\s+/g, '_') !== 'vendedor'
  );

  const opcionesEstado = opcionesEstadoVenta?.length > 0 ? opcionesEstadoVenta : [
    { value: 'venta_iniciada', label: 'Venta iniciada' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completada', label: 'Venta completada' },
    { value: 'cancelada', label: 'Venta cancelada' },
    { value: 'pospuesta', label: 'Venta pospuesta' },
  ];

  const getChipStyle = (valor) => {
    const label = opcionesEstado.find(
      (o) => (o.value || '').toLowerCase() === (valor || '').toLowerCase()
    )?.label ?? valor;
    return CHIP_ESTADOS[label]
      ? CHIP_ESTADOS[label]
      : { bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: 'text.secondary' };
  };

  const productoSeleccionado = productoVerDetalle
    ? productos.find((p) => p.id === productoVerDetalle.id)
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { ...modalPaperSx, maxWidth: 880, maxHeight: '90vh' } }}
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Detalle del cliente — {clienteDetalle.nombre}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems="stretch"
          sx={{ minHeight: 0 }}
        >
          {/* Izquierda: Datos generales del cliente */}
          <Box
            sx={{
              flex: { xs: 'none', md: '0 0 280px' },
              minWidth: 0,
              pr: { md: 2 },
              borderRight: { md: '1px solid rgba(0,0,0,0.08)' },
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Datos del cliente
            </Typography>
            <DataRow label="Nombre" value={clienteDetalle.nombre} />
            <DataRow label="Tipo identificación" value={clienteDetalle.tipo_identificacion} />
            <DataRow label="Nº identificación" value={clienteDetalle.numero_identificacion} />
            <DataRow label="Teléfono" value={clienteDetalle.telefono} />
            <DataRow label="Correo" value={clienteDetalle.correo} />
            <DataRow label="Vendedor" value={clienteDetalle.vendedor_nombre} />
          </Box>

          {/* Derecha: Tabla de productos */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Productos
            </Typography>
            {productos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Sin productos registrados.</Typography>
            ) : (
              <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25 }}>Producto</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25 }}>Empresa</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25 }}>Servicio</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25 }} align="center" width={200}>Opciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productos.map((ce) => {
                      const ev = (ce.estado_venta ?? '').trim() || 'venta_iniciada';
                      const labelEv = opcionesEstado.find((o) => (o.value || '').toLowerCase() === ev.toLowerCase())?.label ?? ev;
                      const chipStyle = getChipStyle(ev);
                      const estadoActual = estadosPorProducto[ce.id] ?? ev;
                      const guardando = guardandoPorProducto[ce.id];
                      return (
                        <TableRow key={ce.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{ce.producto || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{ce.empresa_nombre || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{ce.servicio_nombre || '-'}</TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              sx={{
                                px: 1.25,
                                py: 0.25,
                                borderRadius: 999,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                bgcolor: chipStyle.bg,
                                color: chipStyle.color,
                              }}
                            >
                              {labelEv}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75}>
                              <IconButton
                                size="small"
                                aria-label="Ver detalle completo"
                                title="Ver toda la información"
                                onClick={() => setProductoVerDetalle(ce)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'action.hover' },
                                }}
                              >
                                <EyeIcon />
                              </IconButton>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={estadoActual}
                                  onChange={(e) => setEstadosPorProducto((p) => ({ ...p, [ce.id]: e.target.value }))}
                                  displayEmpty
                                  sx={{
                                    height: 30,
                                    fontSize: '0.75rem',
                                    '& .MuiSelect-select': { py: 0.4 },
                                  }}
                                >
                                  {opcionesEstado.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleCambiarEstado(ce)}
                                disabled={guardando || estadoActual === ev}
                                sx={{ textTransform: 'none', fontWeight: 600, minWidth: 70, py: 0.4 }}
                              >
                                {guardando ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  'Actualizar'
                                )}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>

        {/* Panel de detalle completo (al hacer clic en ojito) */}
        {productoSeleccionado && (
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                Información completa — {productoSeleccionado.producto || 'Producto'}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProductoVerDetalle(null)}
                sx={{ textTransform: 'none' }}
              >
                Cerrar
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              <DataRow label="Empresa" value={productoSeleccionado.empresa_nombre} />
              <DataRow label="Servicio" value={productoSeleccionado.servicio_nombre} />
              <DataRow label="Producto" value={productoSeleccionado.producto} />
              <DataRow
                label="Estado de venta"
                value={
                  opcionesEstado.find(
                    (o) => (o.value || '').toLowerCase() === (productoSeleccionado.estado_venta || '').toLowerCase()
                  )?.label ?? productoSeleccionado.estado_venta
                }
              />
            </Stack>
            {respuestasSinVendedor.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Información adicional
                </Typography>
                {respuestasSinVendedor.map((r) => (
                  <DataRow key={r.nombre_campo} label={r.nombre_campo} value={r.respuesta_campo} />
                ))}
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
