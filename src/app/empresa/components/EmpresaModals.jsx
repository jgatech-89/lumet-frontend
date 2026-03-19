import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { LoadingButton } from '../../../components/loading';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';
import { useChoices } from '../../../context/ChoicesContext';

const btnCancelSx = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  borderColor: 'rgba(0,0,0,0.12)',
  color: 'text.primary',
};
const btnPrimarySx = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
};

export function EmpresaModals({
  modalNueva,
  modalEditar,
  modalEliminar,
  nombre,
  setNombre,
  estado,
  setEstado,
  guardandoNuevo,
  guardandoEditar,
  eliminando,
  aEliminar,
  handleCerrarNueva,
  handleGuardarNueva,
  handleCerrarEditar,
  handleGuardarEditar,
  handleCerrarEliminar,
  handleConfirmarEliminar,
}) {
  const { getOptions } = useChoices();
  const estadosEmpresa = getOptions('estado_empresa');

  return (
    <>
      <Dialog open={modalNueva} onClose={handleCerrarNueva} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Nuevo servicio</Typography>
          <IconButton size="small" onClick={handleCerrarNueva} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar un servicio.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Nombre del servicio"
            placeholder="Introduce el nombre..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarNueva} sx={btnCancelSx}>Cancelar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleGuardarNueva}
            disabled={!nombre.trim()}
            loading={guardandoNuevo}
            loadingText="Guardando..."
            sx={btnPrimarySx}
          >
            Guardar servicio
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEditar} onClose={handleCerrarEditar} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Editar servicio</Typography>
          <IconButton size="small" onClick={handleCerrarEditar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica los datos del servicio.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del servicio"
              placeholder="Introduce el nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-empresa-estado-label">Estado del servicio</InputLabel>
              <Select
                labelId="editar-empresa-estado-label"
                value={estado}
                label="Estado del servicio"
                onChange={(e) => setEstado(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {estadosEmpresa.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEditar} sx={btnCancelSx}>Cerrar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleGuardarEditar}
            disabled={!nombre.trim()}
            loading={guardandoEditar}
            loadingText="Guardando..."
            sx={btnPrimarySx}
          >
            Guardar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={modalEliminar}
        onClose={handleCerrarEliminar}
        onConfirm={handleConfirmarEliminar}
        title="Eliminar servicio"
        message="¿Está seguro que desea eliminar este servicio?"
        itemName={aEliminar?.nombre}
        loading={eliminando}
      />
    </>
  );
}
