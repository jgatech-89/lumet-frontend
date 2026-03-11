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
import { TIPOS_IDENTIFICACION } from '../logic/constants';

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

export function VendedorModals({
  modalNueva,
  modalEditar,
  modalEliminar,
  nombre,
  setNombre,
  numeroIdentificacion,
  setNumeroIdentificacion,
  tipoIdentificacion,
  setTipoIdentificacion,
  estado,
  setEstado,
  guardandoNuevo,
  guardandoEditar,
  eliminando,
  aEliminar,
  numeroIdentificacionValido,
  handleCerrarNueva,
  handleGuardarNueva,
  handleCerrarEditar,
  handleGuardarEditar,
  handleCerrarEliminar,
  handleConfirmarEliminar,
}) {
  return (
    <>
      <Dialog open={modalNueva} onClose={handleCerrarNueva} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Nuevo vendedor</Typography>
          <IconButton size="small" onClick={handleCerrarNueva} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar un vendedor (persona que cierra la venta).
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre"
              placeholder="Introduce el nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="colab-tipo-id-label">Tipo de identificación</InputLabel>
              <Select
                labelId="colab-tipo-id-label"
                value={tipoIdentificacion}
                label="Tipo de identificación"
                onChange={(e) => setTipoIdentificacion(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {TIPOS_IDENTIFICACION.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Número de identificación"
              placeholder="Dígita mínimo 5 caracteres"
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              required
              error={numeroIdentificacion.trim().length > 0 && numeroIdentificacion.trim().length < 5}
              helperText={numeroIdentificacion.trim().length > 0 && numeroIdentificacion.trim().length < 5 ? 'Mínimo 5 caracteres' : ''}
              inputProps={{ minLength: 5 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarNueva} sx={btnCancelSx}>Cancelar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleGuardarNueva}
            disabled={!nombre.trim() || !numeroIdentificacionValido || !tipoIdentificacion}
            loading={guardandoNuevo}
            loadingText="Guardando..."
            sx={btnPrimarySx}
          >
            Guardar vendedor
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEditar} onClose={handleCerrarEditar} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Editar vendedor</Typography>
          <IconButton size="small" onClick={handleCerrarEditar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica los datos del vendedor.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre"
              placeholder="Introduce el nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-colab-tipo-id-label">Tipo de identificación</InputLabel>
              <Select
                labelId="editar-colab-tipo-id-label"
                value={tipoIdentificacion}
                label="Tipo de identificación"
                onChange={(e) => setTipoIdentificacion(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {TIPOS_IDENTIFICACION.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Número de identificación"
              placeholder="Introduce el número..."
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-vendedor-estado-label">Estado del vendedor</InputLabel>
              <Select
                labelId="editar-vendedor-estado-label"
                value={estado}
                label="Estado del vendedor"
                onChange={(e) => setEstado(e.target.value)}
              >
                <MenuItem value="1">Activo</MenuItem>
                <MenuItem value="0">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEditar} sx={btnCancelSx}>Cerrar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleGuardarEditar}
            disabled={!nombre.trim() || !numeroIdentificacionValido || !tipoIdentificacion}
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
        title="Eliminar vendedor"
        message="¿Está seguro que desea eliminar este vendedor?"
        itemName={aEliminar?.nombre}
        loading={eliminando}
      />
    </>
  );
}
