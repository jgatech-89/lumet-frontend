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
import { useMemo } from 'react';
import { LoadingButton } from '../../../components/loading';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';
import { useChoices } from '../../../context/ChoicesContext';
import { mergeTiposIdentificacionVendedor } from '../logic/tiposIdentificacion';

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

function etiquetaTipoIdentificacion({ value, label }) {
  const v = String(value ?? '').trim();
  const lbl = String(label ?? '').trim();
  if (!lbl) return v;
  const L = lbl.toUpperCase();
  const V = v.toUpperCase();
  if (V && (L === V || L.startsWith(`${V} - `))) {
    return lbl;
  }
  return `${v} - ${lbl}`;
}

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
  const { getOptions } = useChoices();
  const tiposIdentificacion = useMemo(
    () => mergeTiposIdentificacionVendedor(getOptions('tipo_identificacion')),
    [getOptions]
  );
  const estadosVendedor = getOptions('estado_vendedor');

  return (
    <>
      <Dialog open={modalNueva} onClose={handleCerrarNueva} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Nuevo comercial</Typography>
          <IconButton size="small" onClick={handleCerrarNueva} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar un comercial.
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
                {tiposIdentificacion.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{etiquetaTipoIdentificacion(t)}</MenuItem>
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
            Guardar comercial
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEditar} onClose={handleCerrarEditar} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Editar comercial</Typography>
          <IconButton size="small" onClick={handleCerrarEditar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica los datos del comercial.
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
                {tiposIdentificacion.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{etiquetaTipoIdentificacion(t)}</MenuItem>
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
                label="Estado del comercial"
                onChange={(e) => setEstado(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {estadosVendedor.map((o) => (
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
        title="Eliminar comercial"
        message="¿Está seguro que desea eliminar este comercial?"
        itemName={aEliminar?.nombre}
        loading={eliminando}
      />
    </>
  );
}
