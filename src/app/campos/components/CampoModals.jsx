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
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';

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

const sectionTitleSx = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: 'text.secondary',
  mt: 0,
  mb: 1.5,
};

/** CSS Grid: 2 columnas, gap consistente (20px) */
const gridTwoColSx = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  width: '100%',
};
/** Margen entre sección DATOS DEL CAMPO y CONFIGURACIÓN (32px) */
const sectionGap = 4;

/** Modal de campo: más ancho y cómodo */
const campoModalPaperSx = {
  ...modalPaperSx,
  maxWidth: 620,
};

/** Contenedor del formulario: grid de 2 columnas, ancho completo del espacio disponible */
const formContentSx = {
  maxWidth: 520,
  mx: 'auto',
  width: '100%',
  boxSizing: 'border-box',
};

/** Acciones del modal: botones alineados a la derecha con espacio entre ellos */
const dialogActionsSx = {
  px: 3,
  pb: 2.5,
  pt: 2,
  gap: 2,
  justifyContent: 'flex-end',
};

export function CampoModals({
  tipoCampoOptions = [],
  empresasParaSelect,
  serviciosFiltrados,
  handleChangeEmpresa,
  cargandoServicios = false,
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
  orden,
  setOrden,
  activo,
  setActivo,
  requerido,
  setRequerido,
  placeholder,
  setPlaceholder,
  help_text,
  setHelp_text,
  default_value,
  setDefault_value,
  visible_si,
  setVisible_si,
  opciones,
  opcionInput,
  setOpcionInput,
  aEliminar,
  campoAVer,
  errors,
  canSave,
  guardandoNueva = false,
  guardandoEditar = false,
  eliminando = false,
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
  const inputSx = { width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2 } };
  const formControlSx = { width: '100%', ...inputSx };

  const selectMenuProps = {
    PaperProps: { sx: { minWidth: 220, maxHeight: 320 } },
    disableScrollLock: true,
  };

  const renderFormDatos = (prefix = '') => (
    <>
      <Typography sx={sectionTitleSx}>Datos del campo</Typography>
      <Box sx={gridTwoColSx}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl size="small" fullWidth required error={!!errors?.empresa} sx={formControlSx}>
            <InputLabel id={`${prefix}campo-empresa-label`} shrink>Empresa</InputLabel>
            <Select
              key={`empresa-select-${(empresasParaSelect ?? []).length}`}
              labelId={`${prefix}campo-empresa-label`}
              value={empresaId}
              label="Empresa"
              onChange={(e) => {
                const v = e.target.value;
                if (handleChangeEmpresa) handleChangeEmpresa(v);
                else { setEmpresaId(v); setServicioId?.(''); }
              }}
              displayEmpty
              renderValue={(v) => {
                if (!v) return 'Seleccionar';
                const opt = (empresasParaSelect ?? []).find((e) => String(e.id) === String(v));
                return opt?.nombre ?? v;
              }}
              MenuProps={selectMenuProps}
              sx={{ width: '100%' }}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {(empresasParaSelect ?? []).map((e) => (
                <MenuItem key={e.id} value={String(e.id)}>{e.nombre}</MenuItem>
              ))}
            </Select>
            {errors?.empresa && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.empresa}</Typography>}
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <FormControl size="small" fullWidth required error={!!errors?.servicio} sx={formControlSx}>
            <InputLabel id={`${prefix}campo-servicio-label`} shrink>Servicio</InputLabel>
            <Select
              labelId={`${prefix}campo-servicio-label`}
              value={servicioId}
              label="Servicio"
              onChange={(e) => setServicioId(e.target.value)}
              disabled={!empresaId || cargandoServicios}
              displayEmpty
              renderValue={(v) => {
                if (!v) return cargandoServicios ? 'Cargando...' : 'Seleccionar';
                const opt = (serviciosFiltrados ?? []).find((s) => String(s.id) === String(v));
                return opt?.nombre ?? opt?.servicio ?? v;
              }}
              MenuProps={selectMenuProps}
              sx={{ width: '100%' }}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {(serviciosFiltrados ?? []).map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.nombre ?? s.servicio}</MenuItem>
              ))}
            </Select>
            {errors?.servicio && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.servicio}</Typography>}
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            label="Nombre del campo"
            placeholder="Introduce el nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            error={!!errors?.nombre}
            helperText={errors?.nombre}
            sx={inputSx}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <FormControl size="small" fullWidth required error={!!errors?.tipo} sx={formControlSx}>
            <InputLabel id={`${prefix}campo-tipo-label`} shrink>Tipo de campo</InputLabel>
            <Select
              labelId={`${prefix}campo-tipo-label`}
              value={tipoCampo}
              label="Tipo de campo"
              onChange={(e) => setTipoCampo(e.target.value)}
              displayEmpty
              renderValue={(v) => {
                if (!v) return 'Seleccionar';
                const opt = (tipoCampoOptions ?? []).find((t) => t.value === v);
                return opt?.label ?? v;
              }}
              MenuProps={selectMenuProps}
              sx={{ width: '100%' }}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {(tipoCampoOptions ?? []).map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
            {errors?.tipo && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.tipo}</Typography>}
          </FormControl>
        </Box>
        {tipoCampo === 'select' && (
          <Box sx={{ gridColumn: '1 / -1', mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Opciones</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                size="small"
                placeholder="Escribe una opción"
                value={opcionInput}
                onChange={(e) => setOpcionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAñadirOpcion())}
                sx={{ flex: 1, ...inputSx }}
              />
              <Button variant="outlined" size="small" onClick={handleAñadirOpcion} disabled={!opcionInput.trim()}>
                Añadir
              </Button>
            </Stack>
            {opciones.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                {opciones.map((opt, idx) => (
                  <Chip
                    key={idx}
                    label={typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? '')}
                    size="small"
                    onDelete={() => handleQuitarOpcion(idx)}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </>
  );

  const renderFormConfig = () => (
    <>
      <Typography sx={sectionTitleSx}>Configuración</Typography>
      {/* Fila: Orden (input pequeño) | Obligatorio | Activo — flex, no grid */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          mb: '20px',
        }}
      >
        <TextField
          size="small"
          type="number"
          label="Orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          required
          error={!!errors?.orden}
          helperText={errors?.orden}
          inputProps={{ min: 0, step: 1 }}
          sx={{ ...inputSx, width: 90, minWidth: 90 }}
        />
        <FormControlLabel
          control={<Switch checked={requerido} onChange={(e) => setRequerido(e.target.checked)} color="primary" />}
          label="Obligatorio"
          sx={{ ml: 0 }}
        />
        <FormControlLabel
          control={<Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} color="primary" />}
          label="Activo"
          sx={{ ml: 0 }}
        />
      </Box>
      {/* Inputs opcionales: CSS grid 2 columnas */}
      <Box sx={gridTwoColSx}>
        <Box sx={{ minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            label="Placeholder"
            placeholder="Texto placeholder"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            sx={inputSx}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            label="Texto de ayuda"
            placeholder="Ayuda para el usuario"
            value={help_text}
            onChange={(e) => setHelp_text(e.target.value)}
            sx={inputSx}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            label="Valor por defecto"
            placeholder="Valor por defecto"
            value={default_value}
            onChange={(e) => setDefault_value(e.target.value)}
            sx={inputSx}
          />
        </Box>
        {/* <Box sx={{ minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            label="Visible si"
            placeholder="Condición para mostrar el campo"
            value={visible_si}
            onChange={(e) => setVisible_si(e.target.value)}
            sx={inputSx}
          />
        </Box> */}
      </Box>
    </>
  );

  return (
    <>
      {/* Modal Nueva campo. Si se añade loading: usar SectionLoader de ~/components/loading (ideal para contenido de modal). */}
      <Dialog open={modalNueva} onClose={handleCerrarNueva} PaperProps={{ sx: campoModalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Nuevo campo</Typography>
          <IconButton size="small" onClick={handleCerrarNueva} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, textAlign: 'center' }}>
            Completa la información para registrar un campo. Los campos marcados con * son obligatorios.
          </Typography>
          <Stack>
            <Box sx={formContentSx}>
              {renderFormDatos('nueva-')}
            </Box>
            <Box sx={{ ...formContentSx, mt: sectionGap }}>
              {renderFormConfig()}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button variant="outlined" onClick={handleCerrarNueva} disabled={guardandoNueva} sx={btnCancelSx}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarNueva} disabled={!canSave || guardandoNueva} sx={btnPrimarySx}>
            {guardandoNueva ? 'Guardando...' : 'Guardar campo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar campo */}
      <Dialog open={modalEditar} onClose={handleCerrarEditar} PaperProps={{ sx: campoModalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Editar campo</Typography>
          <IconButton size="small" onClick={handleCerrarEditar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, textAlign: 'center' }}>
            Modifica la información del campo. Si el tipo es Select, puedes añadir o quitar opciones.
          </Typography>
          <Stack>
            <Box sx={formContentSx}>
              {renderFormDatos('editar-')}
            </Box>
            <Box sx={{ ...formContentSx, mt: sectionGap }}>
              {renderFormConfig()}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button variant="outlined" onClick={handleCerrarEditar} disabled={guardandoEditar} sx={btnCancelSx}>Cerrar</Button>
          <Button variant="contained" onClick={handleGuardarEditar} disabled={!canSave || guardandoEditar} sx={btnPrimarySx}>
            {guardandoEditar ? 'Guardando...' : 'Guardar campo'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={modalEliminar}
        onClose={handleCerrarEliminar}
        onConfirm={() => handleConfirmarEliminar()}
        title="Eliminar campo"
        message="¿Está seguro que desea eliminar este campo?"
        itemName={aEliminar?.campo}
        loading={eliminando}
      />

      {/* Modal Ver detalles */}
      <Dialog open={modalVer} onClose={handleCerrarVer} PaperProps={{ sx: campoModalPaperSx }}>
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
              {(campoAVer.orden !== undefined && campoAVer.orden !== '') && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Orden</Typography>
                  <Typography variant="body1" fontWeight={500}>{campoAVer.orden}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Requerido en formulario</Typography>
                <Typography variant="body1" fontWeight={500}>{campoAVer.requerido ? 'Sí' : 'No'}</Typography>
              </Box>
              {campoAVer.placeholder && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Placeholder</Typography>
                  <Typography variant="body1" fontWeight={500}>{campoAVer.placeholder}</Typography>
                </Box>
              )}
              {campoAVer.help_text && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Texto de ayuda</Typography>
                  <Typography variant="body1" fontWeight={500}>{campoAVer.help_text}</Typography>
                </Box>
              )}
              {campoAVer.default_value && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Valor por defecto</Typography>
                  <Typography variant="body1" fontWeight={500}>{campoAVer.default_value}</Typography>
                </Box>
              )}
              {/* {campoAVer.visible_si && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Visible si</Typography>
                  <Typography variant="body1" fontWeight={500}>{campoAVer.visible_si}</Typography>
                </Box>
              )} */}
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
