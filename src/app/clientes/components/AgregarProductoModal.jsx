import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { NuevoClienteForm } from './NuevoClienteForm';

export function AgregarProductoModal({ open, onClose, cliente, onExito }) {
  const handleCerrar = () => {
    onClose?.();
  };

  const handleExito = () => {
    onExito?.();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: '98vmin',
          height: '78vmin',
          maxWidth: 1280,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={600}>
          Agregar un producto nuevo a este cliente{cliente?.nombre ? ` (${cliente.nombre})` : ''}
        </Typography>
        <IconButton size="small" onClick={handleCerrar} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          px: 2,
          pt: 2,
          pb: 2,
        }}
      >
        {open && cliente?.id && (
          <NuevoClienteForm
            embedded
            clienteExistente={cliente}
            onExito={handleExito}
            onClose={handleCerrar}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
