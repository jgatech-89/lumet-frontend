import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { LoadingButton } from '../../../components/loading';
import { useChoices } from '../../../context/ChoicesContext';
import { useAgregarProducto } from '../logic/useAgregarProducto';

const selectFieldSx = {
  width: '100%',
  maxWidth: 280,
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
};

/** Estilos para campos dinámicos: ancho fijo, selects no cambian de tamaño al seleccionar */
const campoDinamicoSx = {
  width: '100%',
  minWidth: 0,
  '& .MuiOutlinedInput-root': { width: '100%', borderRadius: 2 },
  '& .MuiSelect-select': { width: '100% !important', minWidth: '100% !important', boxSizing: 'border-box' },
  '& .MuiInputBase-root': { width: '100%' },
};

const STEPS = ['Tipo / Servicio / Compañía actual', 'Campos del formulario', 'Comercial'];

function labelBase(nombre) {
  return (nombre || '').replace(/\s*\*+\s*$/g, '').trim();
}

function labelConAsterisco(nombre, requerido) {
  const base = labelBase(nombre);
  return requerido ? `${base} *` : base;
}

const ES_TIPO_IDENTIFICACION = (n) => /tipo\s*(de)?\s*identificaci[oó]n/i.test(n || '');
const ES_VENDEDOR = (n) => /vendedor|comercial/i.test(n || '') && !/cerrador/i.test(n || '');

function CampoDinamicoInput({ campo, value, onChange, opcionesTipoIdentificacion, opcionesVendedor }) {
  const { nombre, tipo, placeholder, requerido, opciones = [] } = campo;
  const id = `agregar-campo-${nombre}`;
  const label = labelBase(nombre);
  const opcionesSelect = (opcionesTipoIdentificacion?.length && ES_TIPO_IDENTIFICACION(nombre))
    ? opcionesTipoIdentificacion
    : (opcionesVendedor?.length && ES_VENDEDOR(nombre))
      ? opcionesVendedor.map((v) => ({ value: String(v.id), label: v.nombre_completo ?? v.nombre ?? '' }))
      : opciones;

  if (tipo === 'select' || (opcionesSelect?.length && (ES_TIPO_IDENTIFICACION(nombre) || ES_VENDEDOR(nombre)))) {
    return (
      <FormControl size="small" sx={{ flex: 1, width: '100%', maxWidth: 280 }} required={requerido}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          value={value ?? ''}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          <MenuItem value="">Seleccionar</MenuItem>
          {opcionesSelect.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (tipo === 'checkbox') {
    const isChecked = value === '1' || value === 'si' || value === 'true' || value === true;
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={!!isChecked}
            onChange={(e) => onChange(e.target.checked ? '1' : '0')}
            size="small"
          />
        }
        label={labelConAsterisco(nombre, requerido)}
      />
    );
  }

  if (tipo === 'textarea') {
    const ph = placeholder != null && placeholder !== '' ? String(placeholder).replace(/\s*\*+\s*$/g, '').trim() : placeholder;
    return (
      <TextField
        id={id}
        size="small"
        multiline
        rows={3}
        label={label}
        placeholder={ph}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={requerido}
        fullWidth
        sx={campoDinamicoSx}
      />
    );
  }

  const inputType = tipo === 'number' ? 'number' : tipo === 'date' ? 'date' : 'text';
  const placeholderLimpio = placeholder != null && placeholder !== '' ? String(placeholder).replace(/\s*\*+\s*$/g, '').trim() : placeholder;
  return (
    <TextField
      id={id}
      size="small"
      type={inputType}
      label={label}
      placeholder={placeholderLimpio}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      required={requerido}
      fullWidth
      sx={campoDinamicoSx}
      inputProps={tipo === 'number' ? { min: 0, step: 1 } : undefined}
    />
  );
}

export function AgregarProductoModal({ open, onClose, cliente, onExito }) {
  const { getOptions } = useChoices();
  const tiposIdentificacion = getOptions('tipo_identificacion') || [];
  const {
    paso,
    tipoCliente,
    setTipoCliente,
    tipoClienteOptions,
    campoTipoCliente,
    actualizarRespuesta,
    respuestas,
    empresa,
    setEmpresa,
    servicio,
    setServicio,
    producto,
    setProducto,
    opcionesProducto,
    camposFormularioSinTipoCliente,
    empresas,
    servicios,
    guardando,
    cargandoEmpresas,
    cargandoServicios,
    cargandoCampos,
    cargandoCamposGlobales,
    handleSiguiente,
    handleAnterior,
    handleLimpiar,
    handleGuardar,
    puedeSiguientePaso,
    vendedorId,
    setVendedorId,
    vendedores,
    cargandoVendedores,
    campoTitular,
    cambioTitularMarcado,
    camposTitularDependientes,
    camposSeccionVendedor,
    campoTipoProducto,
  } = useAgregarProducto(cliente, () => {
    onExito?.();
    onClose?.();
  });

  const handleCerrar = () => {
    handleLimpiar();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '92vh',
          maxWidth: 720,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Agregar un producto nuevo a este cliente{cliente?.nombre ? ` (${cliente.nombre})` : ''}
        </Typography>
        <IconButton size="small" onClick={handleCerrar} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto' }}>
        <Stepper activeStep={paso - 1} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {paso === 1 && (
          <Stack spacing={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Tipo de cliente, empresa y servicio
            </Typography>
            {cargandoCamposGlobales ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">Cargando...</Typography>
              </Box>
            ) : campoTipoCliente ? (
              <>
                <Box sx={{ width: '100%', maxWidth: 280 }}>
                  <CampoDinamicoInput
                    campo={campoTipoCliente}
                    value={respuestas[campoTipoCliente.nombre]}
                    onChange={(v) => actualizarRespuesta(campoTipoCliente.nombre, v)}
                    opcionesTipoIdentificacion={tiposIdentificacion}
                  />
                </Box>
                {respuestas[campoTipoCliente?.nombre] && (cargandoEmpresas ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">Cargando servicios...</Typography>
                  </Box>
                ) : (
                  <FormControl size="small" sx={selectFieldSx} required>
                    <InputLabel id="empresa-label">Servicio</InputLabel>
                    <Select
                      labelId="empresa-label"
                      value={empresa?.id ?? ''}
                      label="Servicio *"
                      onChange={(e) => {
                        const emp = empresas.find((x) => x.id === Number(e.target.value));
                        setEmpresa(emp ?? null);
                        setServicio(null);
                      }}
                    >
                      <MenuItem value="">Seleccionar servicio</MenuItem>
                      {empresas.map((e) => (
                        <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
                {respuestas[campoTipoCliente?.nombre] && empresa && (cargandoServicios ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">Cargando compañías...</Typography>
                  </Box>
                ) : (
                  <FormControl size="small" sx={selectFieldSx} required>
                    <InputLabel id="servicio-label">Compañía actual</InputLabel>
                    <Select
                      labelId="servicio-label"
                      value={servicio?.id ?? ''}
                      label="Compañía"
                      onChange={(e) => {
                        const s = servicios.find((x) => x.id === Number(e.target.value));
                        setServicio(s ?? null);
                      }}
                    >
                      <MenuItem value="">Seleccionar compañía</MenuItem>
                      {servicios.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Configure el campo &quot;Tipo de cliente&quot; en Configuración de campos para continuar.
              </Typography>
            )}
            {campoTipoProducto && campoTipoCliente && respuestas[campoTipoCliente?.nombre] && ['cliente', 'datos_base'].includes((campoTipoProducto.seccion || '').toLowerCase()) && opcionesProducto?.length > 0 && servicio && (
              <FormControl size="small" sx={selectFieldSx} required>
                <InputLabel id="producto-form-label">Producto</InputLabel>
                <Select
                  labelId="producto-form-label"
                  value={producto}
                  label="Producto"
                  onChange={(e) => setProducto(e.target.value)}
                >
                  <MenuItem value="">Seleccionar producto</MenuItem>
                  {opcionesProducto.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        )}

        {paso === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Campos del formulario
            </Typography>
            {campoTipoProducto && (campoTipoProducto.seccion || '').toLowerCase() === 'campos_formulario' && opcionesProducto?.length > 0 && (
              <>
                <FormControl size="small" sx={selectFieldSx} required>
                  <InputLabel id="producto-form-label">Producto</InputLabel>
                  <Select
                    labelId="producto-form-label"
                    value={producto}
                    label="Producto"
                    onChange={(e) => setProducto(e.target.value)}
                  >
                    <MenuItem value="">Seleccionar producto</MenuItem>
                    {opcionesProducto.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {!producto && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Seleccione un producto para ver los campos del formulario.
                  </Typography>
                )}
              </>
            )}
            {campoTipoProducto && (campoTipoProducto.seccion || '').toLowerCase() === 'campos_formulario' && opcionesProducto?.length > 0 && !producto ? (
              null
            ) : cargandoCampos ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">Cargando campos...</Typography>
              </Box>
            ) : (camposFormularioSinTipoCliente.length === 0 && !campoTitular) ? (
              <Typography variant="body2" color="text.secondary">
                No hay campos configurados para esta sección. Puede continuar al siguiente paso.
              </Typography>
            ) : (
              <>
                <Grid container spacing={3} sx={{ width: '100%' }}>
                  {camposFormularioSinTipoCliente.map((c) => (
                    <Grid item xs={12} sm={6} key={c.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', minWidth: 0 }}>
                        {c.tipo !== 'checkbox' && (
                          <Typography variant="body2" color="text.secondary" component="label">
                            {labelConAsterisco(c.nombre, c.requerido)}
                          </Typography>
                        )}
                        <CampoDinamicoInput
                          campo={c}
                          value={respuestas[c.nombre]}
                          onChange={(v) => actualizarRespuesta(c.nombre, v)}
                          opcionesTipoIdentificacion={tiposIdentificacion}
                          opcionesVendedor={vendedores}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {campoTitular && (
                  <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!cambioTitularMarcado}
                          onChange={(e) => actualizarRespuesta(campoTitular.nombre, e.target.checked ? '1' : '0')}
                          size="small"
                        />
                      }
                      label={labelConAsterisco(campoTitular.nombre, campoTitular.requerido)}
                    />
                    {cambioTitularMarcado && (
                      <Grid container spacing={3} sx={{ width: '100%', mt: 2 }}>
                        {camposTitularDependientes.map((c) => (
                          <Grid item xs={12} sm={6} key={c.id}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', minWidth: 0 }}>
                              {c.tipo !== 'checkbox' && (
                                <Typography variant="body2" color="text.secondary" component="label">
                                  {labelConAsterisco(c.nombre, c.requerido)}
                                </Typography>
                              )}
                              <CampoDinamicoInput
                                campo={c}
                                value={respuestas[c.nombre]}
                                onChange={(v) => actualizarRespuesta(c.nombre, v)}
                                opcionesTipoIdentificacion={tiposIdentificacion}
                                opcionesVendedor={vendedores}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {paso === 3 && (
          <Stack spacing={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Comercial
            </Typography>
            {campoTipoProducto && (campoTipoProducto.seccion || '').toLowerCase() === 'vendedor' && opcionesProducto?.length > 0 && (
              <FormControl size="small" sx={selectFieldSx} required>
                <InputLabel id="producto-form-label">Producto</InputLabel>
                <Select
                  labelId="producto-form-label"
                  value={producto}
                  label="Producto"
                  onChange={(e) => setProducto(e.target.value)}
                >
                  <MenuItem value="">Seleccionar producto</MenuItem>
                  {opcionesProducto.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {camposSeccionVendedor?.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay campos configurados para esta sección. Agregue campos con sección &quot;Vendedor&quot; en Configuración.
              </Typography>
            ) : (
              <Grid container spacing={3} sx={{ width: '100%' }}>
                {camposSeccionVendedor.map((c) => (
                  <Grid item xs={12} sm={6} key={c.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', minWidth: 0 }}>
                      {c.tipo !== 'checkbox' && (
                        <Typography variant="body2" color="text.secondary" component="label">
                          {labelConAsterisco(c.nombre, c.requerido)}
                        </Typography>
                      )}
                      <CampoDinamicoInput
                        campo={c}
                        value={ES_VENDEDOR(c.nombre) ? (respuestas[c.nombre] ?? vendedorId ?? '') : respuestas[c.nombre]}
                        onChange={(v) => {
                          actualizarRespuesta(c.nombre, v);
                          if (ES_VENDEDOR(c.nombre)) setVendedorId(v || '');
                        }}
                        opcionesTipoIdentificacion={tiposIdentificacion}
                        opcionesVendedor={vendedores}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Stack direction="row" gap={2}>
            <Button
              variant="outlined"
              onClick={paso === 1 ? handleCerrar : handleAnterior}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'rgba(0,0,0,0.12)',
                color: 'text.primary',
                '&:hover': { borderColor: 'rgba(0,0,0,0.25)', bgcolor: 'action.hover' },
              }}
            >
              {paso === 1 ? 'Cancelar' : 'Anterior'}
            </Button>
            {paso < 3 && (
              <Button
                variant="contained"
                onClick={handleSiguiente}
                disabled={!puedeSiguientePaso()}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Siguiente
              </Button>
            )}
          </Stack>
          <Stack direction="row" gap={2}>
            <Button
              variant="outlined"
              onClick={handleLimpiar}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'primary.main',
                color: 'primary.main',
              }}
            >
              Limpiar
            </Button>
            {paso === 3 && (
              <LoadingButton
                variant="contained"
                onClick={handleGuardar}
                loading={guardando}
                loadingText="Guardando..."
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.25,
                }}
              >
                Agregar producto
              </LoadingButton>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
