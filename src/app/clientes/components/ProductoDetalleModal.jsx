import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';

function formatValorSiNo(val) {
  if (val == null || val === '') return '-';
  const s = String(val).trim().toLowerCase();
  if (s === 'o' || s === '0') return 'No';
  if (s === '1') return 'Sí';
  return val;
}

function DataRow({ label, value, formatSiNo = false }) {
  const displayValue = formatSiNo ? formatValorSiNo(value) : (value || '-');
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.5, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0 }}>
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
        {displayValue}
      </Typography>
    </Stack>
  );
}

export function ProductoDetalleModal({
  open,
  onClose,
  cliente,
  producto,
  opcionesEstadoVenta = [],
}) {
  if (!producto || !open) return null;

  // Usar siempre las respuestas de ESTE producto (producto.respuestas por id ClienteEmpresa). Si no vienen, no usar las del cliente para no mezclar productos.
  const respuestas = Array.isArray(producto?.respuestas) ? producto.respuestas : [];
  const NOMBRES_TIPO_CLIENTE = ['tipo_cliente', 'Tipo de cliente', 'Tipo Cliente', 'tipo cliente'];
  const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
  const esTipoCliente = (r) => NOMBRES_TIPO_CLIENTE.some((n) => norm(r?.nombre_campo) === norm(n));
  const respuestasOrdenadas = [...respuestas].sort((a, b) =>
    (a.nombre_campo || '').localeCompare(b.nombre_campo || '')
  );
  const respuestasSinComercialCerradorNiTipoCliente = respuestasOrdenadas.filter(
    (r) => {
      const n = norm(r?.nombre_campo);
      return n !== 'vendedor' && n !== 'comercial' && n !== 'cerrador' && !esTipoCliente(r);
    }
  );
  const tipoClienteRespuesta = respuestas.find((r) => esTipoCliente(r));
  const tipoClienteValor = tipoClienteRespuesta ? formatValorSiNo(tipoClienteRespuesta.respuesta_campo) : (producto?.tipo_cliente ?? '-');

  const labelEstado = opcionesEstadoVenta?.length > 0
    ? opcionesEstadoVenta.find(
        (o) => (o.value || '').toLowerCase() === (producto.estado_venta || '').toLowerCase()
      )?.label ?? producto.estado_venta
    : producto.estado_venta;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { ...modalPaperSx, maxWidth: 520, maxHeight: '85vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Información detallada — {producto.producto || 'Producto'}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto' }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="primary"
          sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          Comercial
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <DataRow label="Tipo de cliente" value={tipoClienteValor} />
          <DataRow label="Servicio" value={producto.empresa_nombre} />
          <DataRow label="Compañía actual" value={producto.servicio_nombre} />
          <DataRow label="Producto" value={producto.producto} />
          <DataRow label="Estado de venta" value={labelEstado} />
          <DataRow label="Comercial" value={producto?.vendedor_nombre ?? cliente?.vendedor_nombre ?? '-'} />
        </Stack>

        {producto?.cerrador_nombre && (
          <>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Cerrador
            </Typography>
            <DataRow label="Cerrador" value={producto.cerrador_nombre} />
          </>
        )}

        {respuestasSinComercialCerradorNiTipoCliente.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="primary"
              sx={{ mt: 2, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Información adicional
            </Typography>
            {respuestasSinComercialCerradorNiTipoCliente.map((r) => (
              <DataRow key={r.nombre_campo} label={r.nombre_campo} value={r.respuesta_campo} formatSiNo />
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
