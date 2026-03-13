import { useNavigate } from 'react-router-dom';
import { COMPACT_MEDIA } from '../../../utils/theme';
import { LoadingButton } from '../../../components/loading';
import { useNuevoCliente } from '../logic/useNuevoCliente';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';

const selectFieldSx = {
  width: { xs: '100%', sm: 280 },
  minWidth: { xs: 0, sm: 280 },
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
};

const STEPS = ['Cliente', 'Datos base', 'Campos del formulario', 'Vendedor'];

/** Quita asteriscos dobles del nombre; devuelve base limpia. MUI añade * automáticamente cuando required. */
function labelBase(nombre) {
  return (nombre || '').replace(/\s*\*+\s*$/g, '').trim();
}

/** Para FormControlLabel (checkbox) que no añade *: base + un * si requerido. */
function labelConAsterisco(nombre, requerido) {
  const base = labelBase(nombre);
  return requerido ? `${base} *` : base;
}

function CampoDinamicoInput({ campo, value, onChange }) {
  const { nombre, tipo, placeholder, help_text, requerido, opciones = [] } = campo;
  const id = `campo-${nombre}`;
  const label = labelBase(nombre);

  if (tipo === 'select') {
    return (
      <FormControl size="small" sx={{ flex: 1, width: '100%', maxWidth: { xs: '100%', sm: 280 } }} required={requerido}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          value={value ?? ''}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          <MenuItem value="">Seleccionar</MenuItem>
          {opciones.map((o) => (
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
        sx={{ maxWidth: { xs: '100%', sm: 400 } }}
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
      sx={{ maxWidth: { xs: '100%', sm: 280 } }}
      inputProps={tipo === 'number' ? { min: 0, step: 1 } : undefined}
    />
  );
}

export function NuevoClienteForm() {
  const navigate = useNavigate();
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
    baseData,
    setBaseData,
    camposFormularioSinTipoCliente,
    campEstadoVenta = null,
    empresas,
    servicios,
    guardando,
    cargandoEmpresas,
    cargandoServicios,
    cargandoCampos,
    cargandoCamposGlobales,
    validarTelefono,
    validarCorreo,
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
  } = useNuevoCliente();

  const tiposIdentificacion = [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'PPT', label: 'Permiso provisional de trabajo' },
    { value: 'OTRO', label: 'Otro' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        [COMPACT_MEDIA]: { borderRadius: 2 },
      }}
    >
      <Box sx={{ p: { xs: 3, sm: 4 }, pb: { xs: 4, sm: 5 }, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', [COMPACT_MEDIA]: { p: 2, pb: 3 } }}>
        <Box sx={{ mb: 3, flexShrink: 0, [COMPACT_MEDIA]: { mb: 1.5 } }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            color="text.primary"
            gutterBottom
            sx={{ letterSpacing: '-0.02em', [COMPACT_MEDIA]: { fontSize: '1.25rem' } }}
          >
            Nuevo cliente
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ [COMPACT_MEDIA]: { fontSize: '0.8125rem' } }}>
            Completa la información en 4 pasos
          </Typography>
        </Box>

        <Stepper activeStep={paso - 1} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.06)',
            bgcolor: 'background.paper',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {paso === 1 && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Cliente
              </Typography>
              {cargandoCamposGlobales ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">Cargando tipo de cliente...</Typography>
                </Box>
              ) : campoTipoCliente ? (
                <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 280 } }}>
                  <CampoDinamicoInput
                    campo={campoTipoCliente}
                    value={respuestas[campoTipoCliente.nombre]}
                    onChange={(v) => actualizarRespuesta(campoTipoCliente.nombre, v)}
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
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Datos base del cliente
              </Typography>
              <TextField
                size="small"
                label="Nombre"
                value={baseData.nombre}
                onChange={(e) => setBaseData((p) => ({ ...p, nombre: e.target.value }))}
                required
                fullWidth
                sx={{ maxWidth: 400 }}
              />
              <FormControl size="small" sx={{ width: { xs: '100%', sm: 280 }, minWidth: { xs: 0, sm: 280 } }}>
                <InputLabel id="tipo-identificacion-label">Tipo de identificación</InputLabel>
                <Select
                  labelId="tipo-identificacion-label"
                  value={baseData.tipo_identificacion}
                  label="Tipo de identificación"
                  onChange={(e) => setBaseData((p) => ({ ...p, tipo_identificacion: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  {tiposIdentificacion.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Número de identificación"
                value={baseData.numero_identificacion}
                onChange={(e) => setBaseData((p) => ({ ...p, numero_identificacion: e.target.value }))}
                fullWidth
                required
                sx={{ maxWidth: 400 }}
              />
              <TextField
                size="small"
                label="Teléfono"
                value={baseData.telefono}
                onChange={(e) => setBaseData((p) => ({ ...p, telefono: e.target.value }))}
                fullWidth
                required
                sx={{ maxWidth: 400 }}
                error={!!baseData.telefono && !validarTelefono(baseData.telefono)}
                helperText={!baseData.telefono?.trim() ? 'Obligatorio' : !validarTelefono(baseData.telefono) ? 'Mínimo 5 dígitos' : ''}
              />
              <TextField
                size="small"
                type="email"
                label="Correo"
                value={baseData.correo}
                onChange={(e) => setBaseData((p) => ({ ...p, correo: e.target.value }))}
                fullWidth
                required
                sx={{ maxWidth: 400 }}
                error={!!baseData.correo && !validarCorreo(baseData.correo)}
                helperText={!baseData.correo?.trim() ? 'Obligatorio' : !validarCorreo(baseData.correo) ? 'Correo no válido' : ''}
              />
            </Stack>
          )}

          {paso === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, pr: 0.5 }}>
                <Stack spacing={3}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
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
                        No hay campos configurados para este producto. Puede continuar al siguiente paso.
                      </Typography>
                    ) : (
                      <Stack spacing={2} sx={{ maxWidth: 480 }}>
                        {camposFormularioSinTipoCliente.map((c) => (
                          <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 180 } }}>
                              {labelConAsterisco(c.nombre, c.requerido)}
                            </Typography>
                            <Box sx={{ flex: 1, width: '100%' }}>
                              <CampoDinamicoInput
                                campo={c}
                                value={respuestas[c.nombre]}
                                onChange={(v) => actualizarRespuesta(c.nombre, v)}
                              />
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Seleccione un producto para ver los campos del formulario.
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
                    No hay campos configurados. Puede continuar al siguiente paso.
                  </Typography>
                ) : (
                  <Stack spacing={2} sx={{ maxWidth: 480 }}>
                    {camposFormularioSinTipoCliente.map((c) => (
                      <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 180 } }}>
                          {labelConAsterisco(c.nombre, c.requerido)}
                        </Typography>
                        <Box sx={{ flex: 1, width: '100%' }}>
                          <CampoDinamicoInput
                            campo={c}
                            value={respuestas[c.nombre]}
                            onChange={(v) => actualizarRespuesta(c.nombre, v)}
                          />
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                )
              )}

              {campoTitular && (
                <Stack spacing={2} sx={{ maxWidth: 480 }}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 180 } }}>
                        {labelConAsterisco(c.nombre, c.requerido)}
                      </Typography>
                      <Box sx={{ flex: 1, width: '100%' }}>
                        <CampoDinamicoInput
                          campo={c}
                          value={respuestas[c.nombre]}
                          onChange={(v) => actualizarRespuesta(c.nombre, v)}
                        />
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
                </Stack>
              </Box>
            </Box>
          )}

          {paso === 4 && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
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
                  No hay vendedores configurados. Puede guardar el cliente sin asignar vendedor.
                </Typography>
              )}
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Stack direction="row" gap={2}>
              <Button
                variant="outlined"
                onClick={paso === 1 ? () => navigate(-1) : handleAnterior}
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
              {paso < 4 && (
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
              {paso === 4 && (
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
                  Guardar cliente
                </LoadingButton>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Paper>
  );
}
