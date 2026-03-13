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

const STEPS = ['Tipo / Empresa / Servicio', 'Campos del formulario', 'Vendedor'];

function labelBase(nombre) {
  return (nombre || '').replace(/\s*\*+\s*$/g, '').trim();
}

function labelConAsterisco(nombre, requerido) {
  const base = labelBase(nombre);
  return requerido ? `${base} *` : base;
}

const ES_TIPO_IDENTIFICACION = (n) => /tipo\s*(de)?\s*identificaci[oó]n/i.test(n || '');

function CampoDinamicoInput({ campo, value, onChange, opcionesTipoIdentificacion }) {
  const { nombre, tipo, placeholder, help_text, requerido, opciones = [] } = campo;
  const id = `agregar-campo-${nombre}`;
  const label = labelBase(nombre);
  const opcionesSelect = (opcionesTipoIdentificacion?.length && ES_TIPO_IDENTIFICACION(nombre))
    ? opcionesTipoIdentificacion
    : opciones;

  if (tipo === 'select' || (opcionesSelect?.length && ES_TIPO_IDENTIFICACION(nombre))) {
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
        helperText={help_text}
        fullWidth
        sx={{ maxWidth: 400 }}
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
      helperText={help_text}
      fullWidth
      sx={{ maxWidth: 280 }}
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
              <Box sx={{ width: '100%', maxWidth: 280 }}>
                <CampoDinamicoInput
                  campo={campoTipoCliente}
                  value={respuestas[campoTipoCliente.nombre]}
                  onChange={(v) => actualizarRespuesta(campoTipoCliente.nombre, v)}
                  opcionesTipoIdentificacion={tiposIdentificacion}
                />
              </Box>
            ) : (
              <FormControl size="small" sx={selectFieldSx} required>
                <InputLabel id="tipo-cliente-label">Tipo de cliente</InputLabel>
                <Select
                  labelId="tipo-cliente-label"
                  value={tipoCliente}
                  label="Tipo de cliente"
                  onChange={(e) => setTipoCliente(e.target.value)}
                >
                  <MenuItem value="">Seleccionar tipo de cliente</MenuItem>
                  {tipoClienteOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {((campoTipoCliente && respuestas[campoTipoCliente?.nombre]) || tipoCliente) && (
              cargandoEmpresas ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">Cargando empresas...</Typography>
                </Box>
              ) : (
                <FormControl size="small" sx={selectFieldSx} required>
                  <InputLabel id="empresa-label">Empresa</InputLabel>
                  <Select
                    labelId="empresa-label"
                    value={empresa?.id ?? ''}
                    label="Empresa *"
                    onChange={(e) => {
                      const emp = empresas.find((x) => x.id === Number(e.target.value));
                      setEmpresa(emp ?? null);
                      setServicio(null);
                    }}
                  >
                    <MenuItem value="">Seleccionar empresa</MenuItem>
                    {empresas.map((e) => (
                      <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            )}
            {((campoTipoCliente && respuestas[campoTipoCliente?.nombre]) || tipoCliente) && empresa && (
              cargandoServicios ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">Cargando servicios...</Typography>
                </Box>
              ) : (
                <FormControl size="small" sx={selectFieldSx} required>
                  <InputLabel id="servicio-label">Servicio</InputLabel>
                  <Select
                    labelId="servicio-label"
                    value={servicio?.id ?? ''}
                    label="Servicio"
                    onChange={(e) => {
                      const s = servicios.find((x) => x.id === Number(e.target.value));
                      setServicio(s ?? null);
                    }}
                  >
                    <MenuItem value="">Seleccionar servicio</MenuItem>
                    {servicios.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            )}
          </Stack>
        )}

        {paso === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Campos del formulario
            </Typography>
            {opcionesProducto?.length > 0 ? (
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
                    <MenuItem value="__todos__">Todos los productos</MenuItem>
                    {opcionesProducto.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {producto ? (
                  cargandoCampos ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">Cargando campos...</Typography>
                    </Box>
                  ) : camposFormularioSinTipoCliente.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No hay campos configurados para este producto.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {camposFormularioSinTipoCliente.map((c) => (
                        <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                            {labelConAsterisco(c.nombre, c.requerido)}
                          </Typography>
                          <Box sx={{ flex: 1, width: '100%' }}>
                            <CampoDinamicoInput
                              campo={c}
                              value={respuestas[c.nombre]}
                              onChange={(v) => actualizarRespuesta(c.nombre, v)}
                              opcionesTipoIdentificacion={tiposIdentificacion}
                            />
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Seleccione un producto para ver los campos.
                  </Typography>
                )}
              </>
            ) : (
              cargandoCampos ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">Cargando campos...</Typography>
                </Box>
              ) : camposFormularioSinTipoCliente.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay campos configurados.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {camposFormularioSinTipoCliente.map((c) => (
                    <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                        {labelConAsterisco(c.nombre, c.requerido)}
                      </Typography>
                      <Box sx={{ flex: 1, width: '100%' }}>
                        <CampoDinamicoInput
                          campo={c}
                          value={respuestas[c.nombre]}
                          onChange={(v) => actualizarRespuesta(c.nombre, v)}
                          opcionesTipoIdentificacion={tiposIdentificacion}
                        />
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )
            )}
            {campoTitular && (
              <Stack spacing={2}>
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
                {cambioTitularMarcado && camposTitularDependientes.map((c) => (
                  <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                      {labelConAsterisco(c.nombre, c.requerido)}
                    </Typography>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <CampoDinamicoInput
                        campo={c}
                        value={respuestas[c.nombre]}
                        onChange={(v) => actualizarRespuesta(c.nombre, v)}
                        opcionesTipoIdentificacion={tiposIdentificacion}
                      />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {paso === 3 && (
          <Stack spacing={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Vendedor
            </Typography>
            {cargandoVendedores ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">Cargando vendedores...</Typography>
              </Box>
            ) : vendedores?.length > 0 ? (
              <FormControl size="small" sx={selectFieldSx}>
                <InputLabel id="vendedor-label">Vendedor</InputLabel>
                <Select
                  labelId="vendedor-label"
                  value={vendedorId || ''}
                  label="Vendedor"
                  onChange={(e) => setVendedorId(e.target.value)}
                >
                  <MenuItem value="">Seleccionar vendedor</MenuItem>
                  {vendedores.map((v) => (
                    <MenuItem key={v.id} value={String(v.id)}>{v.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay vendedores configurados.
              </Typography>
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
