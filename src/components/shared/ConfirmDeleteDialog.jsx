import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '../loading';
import { CloseIcon } from '../../utils/icons';

export const modalPaperSx = {
  width: '100%',
  maxWidth: 420,
  borderRadius: 2,
  mx: { xs: 1, sm: 2 },
  my: { xs: 2, sm: 0 },
};

/**
 * Modal reutilizable de confirmación de eliminación.
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {() => void | Promise<void>} onConfirm
 * @param {string} title - Ej: "Eliminar empresa"
 * @param {string} message - Ej: "¿Está seguro que desea eliminar esta empresa?"
 * @param {string} [itemName] - Nombre del ítem a eliminar (opcional, se muestra como "Se eliminará: **itemName**")
 * @param {boolean} [loading=false]
 * @param {string} [confirmLabel='Aceptar']
 */
export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading = false,
  confirmLabel = 'Aceptar',
}) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: modalPaperSx }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.primary">
          {message}
        </Typography>
        {itemName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Se eliminará: <strong>{itemName}</strong>
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'rgba(0,0,0,0.12)',
            color: 'text.primary',
          }}
        >
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          onClick={handleConfirm}
          loading={loading}
          loadingText="Eliminando..."
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
