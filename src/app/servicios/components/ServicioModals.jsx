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
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';
import { LoadingButton } from '../../../components/loading';
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

export function ContratistaModals({
  empresasParaSelect,
  modalNueva,
  modalEditar,
  modalEliminar,
  nombre,
  setNombre,
  empresaId,
  setEmpresaId,
  estadoServicio = '1',
  setEstadoServicio,
  aEliminar,
  guardandoNuevo = false,
  guardandoEditar = false,
  eliminando = false,
  handleCerrarNueva,
  handleGuardarNueva,
  handleCerrarEditar,
  handleGuardarEditar,
  handleCerrarEliminar,
  handleConfirmarEliminar,
}) {
  const { getOptions } = useChoices();
  const estadosServicio = getOptions('estado_servicio');

  return (
    <>
      <Dialog open={modalNueva} onClose={handleCerrarNueva} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Nueva compañía actual</Typography>
          <IconButton size="small" onClick={handleCerrarNueva} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar una compañía.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre de la compañía actual"
              placeholder="Introduce el nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="servicio-empresa-label">Servicio</InputLabel>
              <Select
                labelId="servicio-empresa-label"
                value={empresaId}
                label="Servicio"
                onChange={(e) => setEmpresaId(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {empresasParaSelect.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>{e.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarNueva} disabled={guardandoNuevo} sx={btnCancelSx}>Cancelar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleGuardarNueva}
            disabled={!nombre.trim() || !empresaId}
            loading={guardandoNuevo}
            loadingText="Guardando..."
            sx={btnPrimarySx}
          >
            Guardar compañía
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEditar} onClose={handleCerrarEditar} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Editar compañía actual</Typography>
          <IconButton size="small" onClick={handleCerrarEditar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica los datos de la compañía.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre de la compañía actual"
              placeholder="Introduce el nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-servicio-empresa-label">Servicio</InputLabel>
              <Select
                labelId="editar-servicio-empresa-label"
                value={empresaId}
                label="Servicio"
                onChange={(e) => setEmpresaId(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {empresasParaSelect.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>{e.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-servicio-estado-label">Estado de la compañía</InputLabel>
              <Select
                labelId="editar-servicio-estado-label"
                value={estadoServicio}
                label="Estado de la compañía"
                onChange={(e) => setEstadoServicio(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {estadosServicio.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEditar} disabled={guardandoEditar} sx={btnCancelSx}>Cerrar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleGuardarEditar}
            disabled={!nombre.trim() || !empresaId}
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
        onConfirm={() => { handleConfirmarEliminar(); return Promise.resolve(); }}
        title="Eliminar compañía actual"
        message="¿Está seguro que desea eliminar esta compañía actual?"
        itemName={aEliminar?.servicio ?? aEliminar?.nombre}
        loading={eliminando}
        confirmLabel="Eliminar"
      />
    </>
  );
}
