import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';

export function CambiarEstadoProductoModal({
  open,
  producto,
  opcionesEstadoVenta = [],
  nuevoEstado,
  setNuevoEstado,
  onClose,
  onGuardar,
  guardando,
}) {
  if (!producto || !open) return null;

  const opciones = opcionesEstadoVenta?.length > 0 ? opcionesEstadoVenta : [
    { value: 'venta_iniciada', label: 'Venta iniciada' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completada', label: 'Venta completada' },
    { value: 'cancelada', label: 'Venta cancelada' },
    { value: 'pospuesta', label: 'Venta pospuesta' },
  ];

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { ...modalPaperSx, maxWidth: 380 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Cambiar estado de venta</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Producto: <strong>{producto.producto || producto.empresa_nombre || 'Sin nombre'}</strong>
        </Typography>
        <FormControl size="small" fullWidth sx={{ minWidth: 200 }}>
          <InputLabel>Nuevo estado</InputLabel>
          <Select
            value={nuevoEstado}
            label="Nuevo estado"
            onChange={(e) => setNuevoEstado(e.target.value)}
          >
            {opciones.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 2, gap: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={() => onGuardar(producto)} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Actualizar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
