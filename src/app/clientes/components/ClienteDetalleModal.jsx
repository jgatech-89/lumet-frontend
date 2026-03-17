import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Stack,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { EyeIcon } from '../../../utils/icons';
import { SettingsIcon } from '../../../utils/icons';
import { EditIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { SectionLoader } from '../../../components/loading';
import * as apiCliente from '../logic/apiCliente';
import { getErrorMessage } from '../../../utils/funciones';
import { usePermissions } from '../../../hooks/usePermissions';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { useThemeMode } from '../../../context/ThemeContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { ProductoDetalleModal } from './ProductoDetalleModal';
import { CambiarEstadoProductoModal } from './CambiarEstadoProductoModal';
import { ClienteEditModal } from './ClienteEditModal';
import { EditarProductoModal } from './EditarProductoModal';
import { AgregarProductoModal } from './AgregarProductoModal';
import { LoadingButton } from '../../../components/loading';

function DataRow({ label, value }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.5, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          wordBreak: 'break-all',
          overflowWrap: 'break-word',
          minWidth: 0,
        }}
      >
        {value || '-'}
      </Typography>
    </Stack>
  );
}

export function ClienteDetalleModal({
  open,
  cliente,
  onClose,
  opcionesEstadoVenta = [],
  onCambioEstado,
  onCambiarEstado,
  onExito,
}) {
  const onCambioEstadoCb = onCambiarEstado ?? onCambioEstado;
  const { isDark } = useThemeMode();
  const { showSnackbar } = useSnackbar();
  const { canChangeProductState } = usePermissions();
  const CHIP_ESTADOS = getChipEstadosVenta(isDark);

  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [productoVerDetalle, setProductoVerDetalle] = useState(null);
  const [productoParaCambiarEstado, setProductoParaCambiarEstado] = useState(null);
  const [estadosPorProducto, setEstadosPorProducto] = useState({});
  const [guardandoPorProducto, setGuardandoPorProducto] = useState({});
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalEditarProducto, setModalEditarProducto] = useState(false);
  const [productoParaEditarModal, setProductoParaEditarModal] = useState(null);
  const [modalAgregarProducto, setModalAgregarProducto] = useState(false);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [modalSubirArchivos, setModalSubirArchivos] = useState(false);
  const [modalDocumentoPdf, setModalDocumentoPdf] = useState(null); // 'dni' | 'factura'
  const [archivoDni, setArchivoDni] = useState(null);
  const [archivoFactura, setArchivoFactura] = useState(null);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);
  const [modalConfirmarReemplazo, setModalConfirmarReemplazo] = useState(false);

  // Consulta de detalle: solo cuando hace falta (si ya tenemos cliente_empresas = datos completos, reutilizar).
  useEffect(() => {
    if (!cliente?.id || !open) {
      setClienteDetalle(null);
      setCargandoDetalle(false);
      setProductoVerDetalle(null);
      setProductoParaCambiarEstado(null);
      return;
    }
    const tieneDetalleCompleto = Array.isArray(cliente.cliente_empresas);
    if (tieneDetalleCompleto) {
      setClienteDetalle(cliente);
      setCargandoDetalle(false);
      const emp = cliente.cliente_empresas || [];
      const init = {};
      emp.forEach((ce) => {
        init[ce.id] = (ce.estado_venta ?? '').trim() || 'venta_iniciada';
      });
      setEstadosPorProducto(init);
      return;
    }
    let cancelled = false;
    setCargandoDetalle(true);
    apiCliente.obtenerCliente(cliente.id).then((data) => {
      if (!cancelled) {
        setClienteDetalle(data);
        const emp = data?.cliente_empresas || [];
        const init = {};
        emp.forEach((ce) => {
          init[ce.id] = (ce.estado_venta ?? '').trim() || 'venta_iniciada';
        });
        setEstadosPorProducto(init);
      }
    }).catch(() => {
      if (!cancelled) setClienteDetalle(null);
    }).finally(() => {
      if (!cancelled) setCargandoDetalle(false);
    });
    return () => { cancelled = true; };
  }, [cliente?.id, open, cliente?.cliente_empresas]);

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
  }, [clienteDetalle?.id, estadosPorProducto, onExito, showSnackbar]);

  const handleGuardarEditarCliente = useCallback(async (payload) => {
    if (!clienteDetalle?.id) return;
    setGuardandoCliente(true);
    try {
      await apiCliente.actualizarCliente(clienteDetalle.id, payload);
      showSnackbar('Cliente actualizado correctamente.', 'success');
      setModalEditarCliente(false);
      const data = await apiCliente.obtenerCliente(clienteDetalle.id);
      setClienteDetalle(data);
      onExito?.();
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al actualizar cliente'), 'error');
    } finally {
      setGuardandoCliente(false);
    }
  }, [clienteDetalle?.id, showSnackbar, onExito]);

  const handleCerrarEditarCliente = useCallback(() => {
    setModalEditarCliente(false);
  }, []);

  const ejecutarSubirArchivos = useCallback(async () => {
    if (!clienteDetalle?.id || (!archivoDni && !archivoFactura)) return;
    setSubiendoArchivos(true);
    try {
      await apiCliente.subirDocumentos(clienteDetalle.id, archivoDni, archivoFactura);
      showSnackbar('Documentos subidos correctamente.', 'success');
      setModalSubirArchivos(false);
      setModalConfirmarReemplazo(false);
      setArchivoDni(null);
      setArchivoFactura(null);
      const data = await apiCliente.obtenerCliente(clienteDetalle.id);
      setClienteDetalle(data);
      onExito?.();
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al subir documentos'), 'error');
    } finally {
      setSubiendoArchivos(false);
    }
  }, [clienteDetalle?.id, archivoDni, archivoFactura, showSnackbar, onExito]);

  const handleSubirArchivos = useCallback(() => {
    if (!clienteDetalle?.id || (!archivoDni && !archivoFactura)) return;
    const reemplazaDni = archivoDni && clienteDetalle?.documento_dni;
    const reemplazaFactura = archivoFactura && clienteDetalle?.documento_factura;
    if (reemplazaDni || reemplazaFactura) {
      setModalConfirmarReemplazo(true);
      return;
    }
    ejecutarSubirArchivos();
  }, [clienteDetalle?.id, clienteDetalle?.documento_dni, clienteDetalle?.documento_factura, archivoDni, archivoFactura, ejecutarSubirArchivos]);

  const handleVerDocumento = useCallback(async (tipo) => {
    if (!clienteDetalle?.id) return;
    try {
      const blob = tipo === 'dni'
        ? await apiCliente.obtenerDocumentoDniBlob(clienteDetalle.id)
        : await apiCliente.obtenerDocumentoFacturaBlob(clienteDetalle.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al abrir documento'), 'error');
    }
  }, [clienteDetalle?.id, showSnackbar]);

  const handleDescargarDocumento = useCallback(async (tipo) => {
    if (!clienteDetalle?.id) return;
    try {
      const blob = tipo === 'dni'
        ? await apiCliente.descargarDocumentoDni(clienteDetalle.id)
        : await apiCliente.descargarDocumentoFactura(clienteDetalle.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tipo === 'dni' ? 'dni_cliente.pdf' : 'factura_cliente.pdf';
      a.click();
      URL.revokeObjectURL(url);
      showSnackbar('Descarga iniciada.', 'success');
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al descargar'), 'error');
    }
  }, [clienteDetalle?.id, showSnackbar]);

  const handleGuardarEditarProducto = useCallback(async (payload) => {
    if (!clienteDetalle?.id) return;
    setGuardandoProducto(true);
    try {
      await apiCliente.actualizarProductoCliente(clienteDetalle.id, payload);
      showSnackbar('Producto actualizado correctamente.', 'success');
      setModalEditarProducto(false);
      setProductoParaEditarModal(null);
      const data = await apiCliente.obtenerCliente(clienteDetalle.id);
      setClienteDetalle(data);
      onExito?.();
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al actualizar producto'), 'error');
    } finally {
      setGuardandoProducto(false);
    }
  }, [clienteDetalle?.id, showSnackbar, onExito]);

  if (!open) return null;

  const productos = clienteDetalle?.cliente_empresas || [];

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...modalPaperSx,
          width: '96vw',
          maxWidth: 1200,
          minWidth: 960,
          minHeight: 400,
          maxHeight: '92vh',
          m: 'auto',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Detalle del cliente — {clienteDetalle?.nombre ?? cliente?.nombre ?? '...'}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', px: 3, pt: 2, pb: 1.5 }}>
        {cargandoDetalle ? (
          <SectionLoader message="Cargando detalle del cliente..." minHeight={200} />
        ) : !clienteDetalle ? (
          <Typography color="text.secondary">Error al cargar el cliente.</Typography>
        ) : (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems="stretch"
          sx={{ flex: 1, minHeight: 0 }}
        >
          {/* Izquierda: Datos generales del cliente */}
          <Box
            sx={{
              flex: { xs: 'none', md: '0 0 300px' },
              minWidth: 0,
              pr: { md: 2 },
              borderRight: { md: '1px solid' },
              borderColor: { md: 'divider' },
              alignSelf: 'stretch',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="primary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Datos del cliente
              </Typography>
              <IconButton
                size="small"
                aria-label="Editar datos del cliente"
                title="Editar datos del cliente"
                onClick={() => setModalEditarCliente(true)}
                sx={{ color: 'primary.main', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <EditIcon />
              </IconButton>
            </Stack>
            <DataRow label="Nombre" value={clienteDetalle.nombre} />
            <DataRow label="Tipo identificación" value={clienteDetalle.tipo_identificacion} />
            <DataRow label="Nº identificación" value={clienteDetalle.numero_identificacion} />
            <DataRow label="Teléfono" value={clienteDetalle.telefono} />
            <DataRow label="Dirección" value={clienteDetalle.direccion} />
            <DataRow label="Cuenta bancaria" value={clienteDetalle.cuenta_bancaria} />
            <DataRow label="Compañía anterior" value={clienteDetalle.compania_anterior} />
            <DataRow label="Compañía actual" value={clienteDetalle.compania_actual} />
            <DataRow label="Correo o carta" value={clienteDetalle.correo_electronico_o_carta} />
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
              {clienteDetalle.documento_dni && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setModalDocumentoPdf('dni')}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  PDF DNI
                </Button>
              )}
              {clienteDetalle.documento_factura && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setModalDocumentoPdf('factura')}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  PDF Factura
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setModalSubirArchivos(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Subir archivos
              </Button>
            </Stack>
          </Box>

          {/* Derecha: Tabla de productos */}
          <Box sx={{ flex: 1, minWidth: 0, alignSelf: 'stretch' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="primary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Productos
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Typography component="span" sx={{ fontSize: '1.1rem', lineHeight: 1, fontWeight: 300 }}>+</Typography>}
                onClick={() => setModalAgregarProducto(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)' },
                }}
              >
                Añadir producto
              </Button>
            </Stack>
            {productos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Sin productos registrados.</Typography>
            ) : (
              <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', minWidth: 720, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25, width: '20%' }}>Producto</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25, width: '18%' }}>Servicio</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25, width: '18%' }}>Compañía actual</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25, width: '24%' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.25, width: '20%' }} align="center">Opciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productos.map((ce) => {
                      const ev = (ce.estado_venta ?? '').trim() || 'venta_iniciada';
                      const labelEv = opcionesEstado.find((o) => (o.value || '').toLowerCase() === ev.toLowerCase())?.label ?? ev;
                      const chipStyle = getChipStyle(ev);
                      return (
                        <TableRow key={ce.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ce.producto || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ce.empresa_nombre || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ce.servicio_nombre || '-'}</TableCell>
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
                              <IconButton
                                size="small"
                                aria-label="Editar producto"
                                title="Editar producto"
                                onClick={() => {
                                  setProductoParaEditarModal(ce);
                                  setModalEditarProducto(true);
                                }}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'action.hover' },
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              {canChangeProductState && (
                                <IconButton
                                  size="small"
                                  aria-label="Cambiar estado"
                                  title="Cambiar estado"
                                  onClick={() => setProductoParaCambiarEstado(ce)}
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'action.hover' },
                                  }}
                                >
                                  <SettingsIcon />
                                </IconButton>
                              )}
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
        )}

      </DialogContent>

      {/* Modal de detalle del producto (al hacer clic en ojito) */}
      <ProductoDetalleModal
        open={!!productoVerDetalle}
        onClose={() => setProductoVerDetalle(null)}
        cliente={clienteDetalle}
        producto={productoVerDetalle}
        opcionesEstadoVenta={opcionesEstado}
      />

      <ClienteEditModal
        open={modalEditarCliente}
        cliente={clienteDetalle}
        onClose={handleCerrarEditarCliente}
        onGuardar={handleGuardarEditarCliente}
        guardando={guardandoCliente}
        soloDatosBase
      />

      <EditarProductoModal
        open={modalEditarProducto}
        onClose={() => {
          setModalEditarProducto(false);
          setProductoParaEditarModal(null);
        }}
        cliente={clienteDetalle}
        producto={productoParaEditarModal}
        opcionesEstadoVenta={opcionesEstado}
        onGuardar={handleGuardarEditarProducto}
        guardando={guardandoProducto}
      />

      <AgregarProductoModal
        open={modalAgregarProducto}
        onClose={() => setModalAgregarProducto(false)}
        cliente={clienteDetalle}
        onExito={() => {
          apiCliente.obtenerCliente(clienteDetalle?.id).then((data) => {
            setClienteDetalle(data);
            onExito?.();
          });
        }}
      />

      {/* Modalsito para cambiar estado */}
      <CambiarEstadoProductoModal
        open={!!productoParaCambiarEstado}
        producto={productoParaCambiarEstado}
        opcionesEstadoVenta={opcionesEstado}
        nuevoEstado={
          productoParaCambiarEstado
            ? (estadosPorProducto[productoParaCambiarEstado.id] ??
               productoParaCambiarEstado.estado_venta ??
               'venta_iniciada')
            : 'venta_iniciada'
        }
        setNuevoEstado={(val) => {
          if (productoParaCambiarEstado) {
            setEstadosPorProducto((p) => ({ ...p, [productoParaCambiarEstado.id]: val }));
          }
        }}
        onClose={() => setProductoParaCambiarEstado(null)}
        onGuardar={(prod) => {
          handleCambiarEstado(prod);
          setProductoParaCambiarEstado(null);
        }}
        guardando={productoParaCambiarEstado ? guardandoPorProducto[productoParaCambiarEstado.id] : false}
      />

      {/* Modal Subir archivos (carga masiva) */}
      <Dialog open={modalSubirArchivos} onClose={() => setModalSubirArchivos(false)} maxWidth="sm" fullWidth PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle>Subir documentos</DialogTitle>
        <DialogContent>
          {(clienteDetalle?.documento_dni || clienteDetalle?.documento_factura) && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
              Este cliente ya tiene documentos cargados. Subir nuevos reemplazará los existentes.
            </Typography>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>PDF DNI</Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ borderRadius: 2 }}>
                {archivoDni?.name ?? 'Seleccionar archivo'}
                <input type="file" hidden accept=".pdf,application/pdf" onChange={(e) => setArchivoDni(e.target.files?.[0] || null)} />
              </Button>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>PDF Factura</Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ borderRadius: 2 }}>
                {archivoFactura?.name ?? 'Seleccionar archivo'}
                <input type="file" hidden accept=".pdf,application/pdf" onChange={(e) => setArchivoFactura(e.target.files?.[0] || null)} />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalSubirArchivos(false)}>Cancelar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubirArchivos}
            loading={subiendoArchivos}
            disabled={!archivoDni && !archivoFactura}
          >
            Subir
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Modal confirmar reemplazo de documentos */}
      <Dialog
        open={modalConfirmarReemplazo}
        onClose={() => setModalConfirmarReemplazo(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...modalPaperSx, borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 0, fontSize: '1rem' }}>Confirmar reemplazo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const reemplazaDni = archivoDni && clienteDetalle?.documento_dni;
              const reemplazaFactura = archivoFactura && clienteDetalle?.documento_factura;
              const partes = [];
              if (reemplazaDni) partes.push('PDF DNI');
              if (reemplazaFactura) partes.push('PDF Factura');
              return `Va a reemplazar el documento existente: ${partes.join(' y ')}. ¿Desea continuar?`;
            })()}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setModalConfirmarReemplazo(false)}>Cancelar</Button>
          <LoadingButton variant="contained" onClick={ejecutarSubirArchivos} loading={subiendoArchivos}>
            Continuar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Modal Ver/Descargar documento PDF */}
      <Dialog open={!!modalDocumentoPdf} onClose={() => setModalDocumentoPdf(null)} maxWidth="xs" fullWidth PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle>{modalDocumentoPdf === 'dni' ? 'PDF DNI' : 'PDF Factura'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Button variant="contained" onClick={() => handleVerDocumento(modalDocumentoPdf)} fullWidth sx={{ borderRadius: 2 }}>
              Ver en nueva pestaña
            </Button>
            <Button variant="outlined" onClick={() => handleDescargarDocumento(modalDocumentoPdf)} fullWidth sx={{ borderRadius: 2 }}>
              Descargar
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
