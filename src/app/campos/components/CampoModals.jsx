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
  Checkbox,
  Divider,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';
import { LoadingButton } from '../../../components/loading';

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
  seccionOptions = [],
  empresasParaSelect,
  serviciosFiltrados,
  handleChangeEmpresa,
  cargandoServicios = false,
  modalNueva,
  modalEditar,
  modalEliminar,
  nombre,
  setNombre,
  empresaId,
  setEmpresaId,
  servicioId,
  setServicioId,
  tipoCampo,
  setTipoCampo,
  seccion,
  setSeccion,
  orden,
  setOrden,
  activo,
  setActivo,
  requerido,
  setRequerido,
  placeholder,
  setPlaceholder,
  visible_si,
  setVisible_si,
  productoId,
  setProductoId,
  opcionesProducto = [],
  opciones,
  opcionInput,
  setOpcionInput,
  aplicarTodosServicios = false,
  setAplicarTodosServicios,
  aplicarTodosEmpresas = false,
  setAplicarTodosEmpresas,
  aplicarTodosProductos = false,
  setAplicarTodosProductos,
  aEliminar,
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
}) {
  const inputSx = { width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2 } };
  const formControlSx = { width: '100%', ...inputSx };

  const selectMenuProps = {
    PaperProps: { sx: { minWidth: 220, maxHeight: 320 } },
    disableScrollLock: true,
  };

  const renderFormDatos = (prefix = '') => (
    <>
      {/* Sección: destino (dónde aplica el campo) */}
      <Typography sx={sectionTitleSx}>Destino del campo</Typography>
      <Box sx={gridTwoColSx}>
        {setAplicarTodosEmpresas && (
          <Box sx={{ gridColumn: '1 / -1', mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!aplicarTodosEmpresas}
                  onChange={(e) => {
                    setAplicarTodosEmpresas(e.target.checked);
                    if (e.target.checked) {
                      setEmpresaId?.('');
                      setServicioId?.('');
                    }
                  }}
                  size="small"
                  disabled={!!empresaId || !!servicioId}
                />
              }
              label="Aplicar a todos los servicios y compañías"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Si lo activas, este campo aparecerá en todos los formularios, sin importar el servicio ni la compañía.
            </Typography>
          </Box>
        )}
        {!aplicarTodosEmpresas && (
        <Box sx={{ minWidth: 0, position: 'relative' }}>
          <FormControl size="small" fullWidth required error={!!errors?.empresa} sx={formControlSx}>
            <InputLabel id={`${prefix}campo-empresa-label`} shrink>Servicio</InputLabel>
            <Select
              key={`empresa-select-${(empresasParaSelect ?? []).length}`}
              labelId={`${prefix}campo-empresa-label`}
              value={empresaId}
              label="Servicio *"
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
          {empresaId && (
            <Box
              aria-label="Limpiar servicio"
              onClick={() => {
                setEmpresaId?.('');
                setServicioId?.('');
              }}
              sx={{
                position: 'absolute',
                right: 34,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.disabled',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          )}
        </Box>
        )}
        {!aplicarTodosEmpresas && setAplicarTodosServicios && (
          <Box sx={{ gridColumn: '1 / -1', mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!aplicarTodosServicios}
                  onChange={(e) => {
                    setAplicarTodosServicios(e.target.checked);
                    if (e.target.checked) setServicioId?.('');
                  }}
                  size="small"
                  disabled={!!servicioId}
                />
              }
              label="Aplicar a todos los contratistas"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Actívalo para que el campo aplique a todas las compañías del servicio seleccionado.
            </Typography>
          </Box>
        )}
        {!aplicarTodosEmpresas && (
        <Box sx={{ minWidth: 0, position: 'relative' }}>
          <FormControl size="small" fullWidth required={!aplicarTodosServicios} error={!!errors?.servicio} sx={formControlSx}>
            <InputLabel id={`${prefix}campo-servicio-label`} shrink>Compañía actual</InputLabel>
            <Select
              labelId={`${prefix}campo-servicio-label`}
              value={aplicarTodosServicios ? '__todos__' : (servicioId ?? '')}
              label="Contratista"
              onChange={(e) => setServicioId(e.target.value === '__todos__' ? '' : e.target.value)}
              disabled={!empresaId || cargandoServicios || aplicarTodosServicios}
              displayEmpty
              renderValue={(v) => {
                if (v === '__todos__') return 'Todas las compañías';
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
          {!aplicarTodosServicios && servicioId && (
            <Box
              aria-label="Limpiar compañía"
              onClick={() => setServicioId?.('')}
              sx={{
                position: 'absolute',
                right: 34,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.disabled',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          )}
        </Box>
        )}
        {(aplicarTodosServicios || !!servicioId || opcionesProducto?.length > 0 || aplicarTodosProductos || aplicarTodosEmpresas) && (
        <Box sx={{ minWidth: 0, gridColumn: '1 / -1' }}>
          <FormControlLabel
            control={(
              <Switch
                size="small"
                checked={!!aplicarTodosProductos}
                onChange={(e) => {
                  setAplicarTodosProductos?.(e.target.checked);
                  if (e.target.checked) setProductoId?.('');
                }}
                disabled={!!productoId}
              />
            )}
            label="Aplicar a todos los productos"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mb: 1.5, display: 'block' }}>
            Úsalo cuando el campo deba mostrarse para todos los productos de este servicio.
          </Typography>
          <Box sx={{ position: 'relative', minWidth: 0 }}>
            <FormControl size="small" fullWidth sx={formControlSx}>
              <InputLabel id={`${prefix}campo-producto-label`} shrink>Producto al que pertenece</InputLabel>
              <Select
                labelId={`${prefix}campo-producto-label`}
                value={aplicarTodosProductos ? '__todos__' : (productoId ?? '')}
                label="Producto al que pertenece"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__todos__') {
                    setAplicarTodosProductos?.(true);
                    setProductoId?.('');
                  } else {
                    setAplicarTodosProductos?.(false);
                    setProductoId?.(v);
                  }
                }}
                displayEmpty
                renderValue={(v) => {
                  if (aplicarTodosProductos) return 'Todos los productos';
                  if (!v) return 'Seleccionar producto';
                  const opt = (opcionesProducto ?? []).find((o) => o.value === v);
                  return opt?.label ?? v;
                }}
                MenuProps={selectMenuProps}
                sx={{ width: '100%' }}
                >
                  <MenuItem value="">Seleccionar producto</MenuItem>
                  <MenuItem value="__todos__">Todos los productos</MenuItem>
                  {(opcionesProducto ?? []).map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {productoId && !aplicarTodosProductos && (
              <Box
                aria-label="Limpiar producto"
                onClick={() => setProductoId?.('')}
                sx={{
                  position: 'absolute',
                  right: 34,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.disabled',
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </Box>
            )}
          </Box>
        </Box>
        )}
      </Box>

      {/* Sección: definición del campo (nombre, tipo y opciones) */}
      <Box sx={{ mt: 4 }}>
        <Typography sx={sectionTitleSx}>Definición del campo</Typography>
        <Box sx={gridTwoColSx}>
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
      </Box>
    </>
  );

  const renderFormConfig = () => (
    <>
      <Typography sx={sectionTitleSx}>Configuración</Typography>
      {/* Sección del formulario (obligatorio) */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" fullWidth required error={!!errors?.seccion} sx={formControlSx}>
          <InputLabel id="campo-seccion-label" shrink>Sección</InputLabel>
          <Select
            labelId="campo-seccion-label"
            value={seccion ?? ''}
            label="Sección"
            onChange={(e) => setSeccion(e.target.value)}
            displayEmpty
            renderValue={(v) => {
              if (!v) return 'Seleccionar';
              const opt = (seccionOptions ?? []).find((s) => s.value === v);
              return opt?.label ?? v;
            }}
            MenuProps={selectMenuProps}
            sx={{ width: '100%' }}
          >
            <MenuItem value="">Seleccionar</MenuItem>
            {(seccionOptions ?? []).map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Indica en qué bloque del formulario aparecerá este campo (Cliente, Datos base, Campos del formulario o Vendedor).
          </Typography>
          {errors?.seccion && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.seccion}</Typography>}
        </FormControl>
      </Box>
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
          inputProps={{ min: 1, step: 1 }}
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
        <Box sx={{ minWidth: 0, gridColumn: '1 / -1' }}>
          <TextField
            fullWidth
            size="small"
            label="Visible si"
            placeholder="Ej: cambio titular (mostrar solo cuando Cambio de titular = Sí)"
            value={visible_si}
            onChange={(e) => setVisible_si(e.target.value)}
            sx={inputSx}
            helperText="Escribe 'cambio titular' para campos que solo deben mostrarse cuando el usuario marca Sí en Cambio de titular."
          />
        </Box>
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
          <LoadingButton variant="contained" onClick={handleGuardarNueva} disabled={!canSave} loading={guardandoNueva} loadingText="Guardando..." sx={btnPrimarySx}>
            Guardar campo
          </LoadingButton>
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
          <LoadingButton variant="contained" onClick={handleGuardarEditar} disabled={!canSave} loading={guardandoEditar} loadingText="Guardando..." sx={btnPrimarySx}>
            Guardar campo
          </LoadingButton>
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
    </>
  );
}
