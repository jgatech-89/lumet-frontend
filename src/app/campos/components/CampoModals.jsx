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
  Box,
  Chip,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';
import { TIPOS_CAMPO } from '../logic/constants';

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

export function CampoModals({
  empresasParaSelect,
  serviciosFiltrados,
  modalNueva,
  modalEditar,
  modalEliminar,
  modalVer,
  nombre,
  setNombre,
  empresaId,
  setEmpresaId,
  servicioId,
  setServicioId,
  tipoCampo,
  setTipoCampo,
  opciones,
  opcionInput,
  setOpcionInput,
  aEliminar,
  campoAVer,
  handleCerrarNueva,
  handleGuardarNueva,
  handleAñadirOpcion,
  handleQuitarOpcion,
  handleCerrarEditar,
  handleGuardarEditar,
  handleCerrarEliminar,
  handleConfirmarEliminar,
  handleCerrarVer,
  handleAbrirEditar,
}) {
  const canSave =
    nombre.trim() &&
    empresaId &&
    servicioId &&
    tipoCampo &&
    (tipoCampo !== 'Select' || opciones.length > 0);

  return (
    <>
      {/* Modal Nueva campo */}
      <Dialog open={modalNueva} onClose={handleCerrarNueva} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Nuevo campo</Typography>
          <IconButton size="small" onClick={handleCerrarNueva} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar un campo.
          </Typography>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="campo-empresa-label">Empresa</InputLabel>
              <Select
                labelId="campo-empresa-label"
                value={empresaId}
                label="Empresa"
                onChange={(e) => { setEmpresaId(e.target.value); setServicioId(''); }}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {empresasParaSelect.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>{e.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="campo-servicio-label">Servicio</InputLabel>
              <Select
                labelId="campo-servicio-label"
                value={servicioId}
                label="Servicio"
                onChange={(e) => setServicioId(e.target.value)}
                disabled={!empresaId}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {serviciosFiltrados.map((s) => (
                  <MenuItem key={s.id} value={s.id.toString()}>{s.servicio}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Nombre del campo"
              placeholder="Introduce el nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="campo-tipo-label">Tipo de campo</InputLabel>
              <Select
                labelId="campo-tipo-label"
                value={tipoCampo}
                label="Tipo de campo"
                onChange={(e) => setTipoCampo(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {TIPOS_CAMPO.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {tipoCampo === 'Select' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Opciones</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Escribe una opción..."
                    value={opcionInput}
                    onChange={(e) => setOpcionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAñadirOpcion())}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button variant="outlined" size="small" onClick={handleAñadirOpcion} disabled={!opcionInput.trim()}>
                    Añadir
                  </Button>
                </Stack>
                {opciones.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                    {opciones.map((opt, idx) => (
                      <Chip key={idx} label={opt} size="small" onDelete={() => handleQuitarOpcion(idx)} sx={{ borderRadius: 1 }} />
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarNueva} sx={btnCancelSx}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarNueva} disabled={!canSave} sx={btnPrimarySx}>
            Guardar campo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar campo */}
      <Dialog open={modalEditar} onClose={handleCerrarEditar} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Editar campo</Typography>
          <IconButton size="small" onClick={handleCerrarEditar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica la información del campo. Si el tipo es Select, puedes añadir o quitar opciones.
          </Typography>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-campo-empresa-label">Empresa</InputLabel>
              <Select
                labelId="editar-campo-empresa-label"
                value={empresaId}
                label="Empresa"
                onChange={(e) => { setEmpresaId(e.target.value); setServicioId(''); }}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {empresasParaSelect.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>{e.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-campo-servicio-label">Servicio</InputLabel>
              <Select
                labelId="editar-campo-servicio-label"
                value={servicioId}
                label="Servicio"
                onChange={(e) => setServicioId(e.target.value)}
                disabled={!empresaId}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {serviciosFiltrados.map((s) => (
                  <MenuItem key={s.id} value={s.id.toString()}>{s.servicio}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Nombre del campo"
              placeholder="Introduce el nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-campo-tipo-label">Tipo de campo</InputLabel>
              <Select
                labelId="editar-campo-tipo-label"
                value={tipoCampo}
                label="Tipo de campo"
                onChange={(e) => setTipoCampo(e.target.value)}
              >
                <MenuItem value="">Seleccionar una opción</MenuItem>
                {TIPOS_CAMPO.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {tipoCampo === 'Select' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Opciones</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Escribe una opción..."
                    value={opcionInput}
                    onChange={(e) => setOpcionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAñadirOpcion())}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button variant="outlined" size="small" onClick={handleAñadirOpcion} disabled={!opcionInput.trim()}>
                    Añadir
                  </Button>
                </Stack>
                {opciones.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                    {opciones.map((opt, idx) => (
                      <Chip key={idx} label={opt} size="small" onDelete={() => handleQuitarOpcion(idx)} sx={{ borderRadius: 1 }} />
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEditar} sx={btnCancelSx}>Cerrar</Button>
          <Button variant="contained" onClick={handleGuardarEditar} disabled={!canSave} sx={btnPrimarySx}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={modalEliminar}
        onClose={handleCerrarEliminar}
        onConfirm={() => { handleConfirmarEliminar(); return Promise.resolve(); }}
        title="Eliminar campo"
        message="¿Está seguro que desea eliminar este campo?"
        itemName={aEliminar?.campo}
      />

      {/* Modal Ver detalles */}
      <Dialog open={modalVer} onClose={handleCerrarVer} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Detalles del campo</Typography>
          <IconButton size="small" onClick={handleCerrarVer} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {campoAVer && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Nombre</Typography>
                <Typography variant="body1" fontWeight={500}>{campoAVer.campo}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Empresa</Typography>
                <Typography variant="body1" fontWeight={500}>{campoAVer.empresa}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Servicio</Typography>
                <Typography variant="body1" fontWeight={500}>{campoAVer.servicio}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Tipo de campo</Typography>
                <Typography variant="body1" fontWeight={500}>{campoAVer.tipoCampo}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</Typography>
                <Typography variant="body1" fontWeight={500}>{campoAVer.estado}</Typography>
              </Box>
              {campoAVer.tipoCampo === 'Select' && (campoAVer.opciones ?? []).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>Opciones</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                    {campoAVer.opciones.map((opt, idx) => (
                      <Chip key={idx} label={opt} size="small" sx={{ borderRadius: 1 }} />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button variant="outlined" onClick={handleCerrarVer} sx={btnCancelSx}>Cerrar</Button>
          {campoAVer && (
            <Button
              variant="contained"
              onClick={() => { handleCerrarVer(); handleAbrirEditar(campoAVer); }}
              sx={btnPrimarySx}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
