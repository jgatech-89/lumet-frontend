import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { COMPACT_MEDIA } from '../../../utils/theme';
import { LoadingButton } from '../../../components/loading';
import { useChoices } from '../../../context/ChoicesContext';
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
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const selectFieldSx = {
  width: '100%',
  maxWidth: { xs: '100%', sm: 320 },
  minWidth: 0,
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

/** STEPS se construye dinámicamente en useNuevoCliente según servicio (ONG, ENERGÍA) */

/** Quita asteriscos dobles del nombre; devuelve base limpia. MUI añade * automáticamente cuando required. */
function labelBase(nombre) {
  return (nombre || '').replace(/\s*\*+\s*$/g, '').trim();
}

/** Para FormControlLabel (checkbox) que no añade *: base + un * si requerido. */
function labelConAsterisco(nombre, requerido) {
  const base = labelBase(nombre);
  return requerido ? `${base} *` : base;
}

const NOMBRES_TIPO_ID_CAMPO = ['tipo de identificación', 'tipo identificación', 'tipo ident', 'tipo_id'];
const esCampoTipoIdentificacion = (n) => NOMBRES_TIPO_ID_CAMPO.some(
  (x) => (n || '').toLowerCase().replace(/\s+/g, '_').includes((x || '').toLowerCase().replace(/\s+/g, '_'))
);

/** Detecta si el campo es de vendedor/comercial (por nombre). Las opciones vienen de la tabla vendedores. */
const esCampoVendedor = (n) => /vendedor|comercial/i.test(n || '') && !/cerrador/i.test(n || '');
/** Detecta si el campo es cerrador. */
const esCampoCerrador = (n) => /cerrador/i.test(n || '');

function CampoDinamicoInput({ campo, value, onChange, opcionesTipoIdentificacion, opcionesVendedor }) {
  const { nombre, tipo, placeholder, requerido, opciones = [] } = campo;
  const id = `campo-${nombre}`;
  const label = labelBase(nombre);
  const usarChoicesTipoId = opcionesTipoIdentificacion?.length && esCampoTipoIdentificacion(nombre);
  const usarOpcionesVendedor = opcionesVendedor?.length && esCampoVendedor(nombre);
  const opcionesSelect = usarChoicesTipoId ? opcionesTipoIdentificacion : (usarOpcionesVendedor ? opcionesVendedor.map((v) => ({ value: String(v.id), label: v.nombre_completo ?? v.nombre ?? '' })) : opciones);

  if (tipo === 'select' || usarChoicesTipoId || usarOpcionesVendedor) {
    return (
      <FormControl size="small" fullWidth sx={campoDinamicoSx} required={requerido}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          value={value ?? ''}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          <MenuItem value="">Seleccionar</MenuItem>
          {(opcionesSelect || []).map((o) => (
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

export function NuevoClienteForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    camposRepetidosExpandidos,
    campEstadoVenta = null,
    empresas,
    servicios,
    guardando,
    cargandoEmpresas,
    cargandoServicios,
    cargandoCampos,
    cargandoCamposGlobales,
    validarTelefono,
    validarCorreoOCarta,
    validarCuentaBancaria,
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
    camposSeccionCliente,
    camposSeccionDatosBase,
    camposSeccionVendedor,
    campoTipoProducto,
    steps,
    totalSteps,
    stepType,
    esOngOTelefonia,
    cerradorId,
    setCerradorId,
    tieneCerrador,
    setTieneCerrador,
    documentoDni,
    setDocumentoDni,
    documentoFactura,
    setDocumentoFactura,
  } = useNuevoCliente();

  const { user } = useAuth();
  const esAdmin = user?.perfil === 'admin';

  const { getOptions } = useChoices();
  const tiposIdentificacion = getOptions('tipo_identificacion') || [
    { value: 'NIE', label: 'NIE - NÚMERO DE IDENTIFICACIÓN EXTRANJERO' },
    { value: 'PAS', label: 'PAS - PASAPORTE' },
    { value: 'DNI', label: 'DNI - DOCUMENTO NACIONAL DE IDENTIDAD' },
    { value: 'CIF', label: 'CIF - CÓDIGO DE IDENTIFICACIÓN FISCAL' },
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
      <Box
        sx={{
          p: { xs: 1.5, sm: 3, md: 4 },
          pb: { xs: 2, sm: 4, md: 5 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: isMobile ? 'auto' : 'hidden',
          width: '100%',
          minWidth: 0,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 3 }, flexShrink: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            color="text.primary"
            gutterBottom
            sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
          >
            Nuevo cliente
          </Typography>
          {isMobile ? (
            <Typography variant="body1" color="primary.main" fontWeight={600} sx={{ fontSize: '0.9375rem' }}>
              Paso {paso} de {totalSteps} — {steps[paso - 1]}
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '1rem' } }}>
              Completa la información en {totalSteps} pasos
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <Stepper
            activeStep={paso - 1}
            sx={{
              mb: { xs: 2, sm: 3 },
              '& .MuiStepLabel-label': { fontSize: '0.875rem' },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.06)',
            bgcolor: 'background.paper',
            flex: 1,
            minHeight: isMobile ? 'auto' : 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isMobile ? 'visible' : 'hidden',
            width: '100%',
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {stepType === 'cliente' && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Cliente
              </Typography>
              {cargandoCamposGlobales ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">Cargando...</Typography>
                </Box>
              ) : campoTipoCliente ? (
                <>
                  <Box sx={{ width: '100%', maxWidth: { sm: 320 } }}>
                    <CampoDinamicoInput
                      campo={campoTipoCliente}
                      value={respuestas[campoTipoCliente.nombre]}
                      onChange={(v) => actualizarRespuesta(campoTipoCliente.nombre, v)}
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
              {campoTipoProducto && campoTipoCliente && respuestas[campoTipoCliente?.nombre] && (campoTipoProducto.seccion || 'campos_formulario').toLowerCase() === 'cliente' && opcionesProducto?.length > 0 && servicio && (
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
              {campoTipoCliente && respuestas[campoTipoCliente?.nombre] && camposSeccionCliente?.length > 0 && (
                <Grid
                  container
                  spacing={3}
                  sx={{
                    width: '100%',
                  }}
                >
                  {camposSeccionCliente.map((c) => (
                    <Grid item xs={12} sm={6} md={4} key={c.id}>
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
            </Stack>
          )}

          {paso === 2 && (
            <Box sx={{ width: '100%', minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
                Datos base del cliente
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2,
                  width: '100%',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <TextField
                    size="small"
                    label="Nombre"
                    value={baseData.nombre}
                    onChange={(e) => setBaseData((p) => ({ ...p, nombre: e.target.value }))}
                    required
                    fullWidth
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <FormControl
                    size="small"
                    required
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    }}
                  >
                    <InputLabel id="tipo-identificacion-datos-label" shrink>
                      Tipo de identificación
                    </InputLabel>
                    <Select
                      labelId="tipo-identificacion-datos-label"
                      value={baseData.tipo_identificacion ?? ''}
                      label="Tipo de identificación"
                      onChange={(e) =>
                        setBaseData((p) => ({ ...p, tipo_identificacion: e.target.value }))
                      }
                      MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return 'Seleccionar';
                        const match = tiposIdentificacion.find((o) => o.value === selected);
                        return match?.label ?? selected;
                      }}
                    >
                      <MenuItem value="">Seleccionar</MenuItem>
                      {tiposIdentificacion.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    size="small"
                    label="Número de identificación"
                    value={baseData.numero_identificacion}
                    onChange={(e) =>
                      setBaseData((p) => ({ ...p, numero_identificacion: e.target.value }))
                    }
                    fullWidth
                    required
                    error={!!baseData.numero_identificacion && baseData.numero_identificacion.trim().length < 3}
                    helperText={
                      !baseData.numero_identificacion?.trim()
                        ? 'Obligatorio'
                        : baseData.numero_identificacion.trim().length < 3
                          ? 'Mínimo 3 dígitos'
                          : ''
                    }
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    size="small"
                    label="Teléfono"
                    value={baseData.telefono}
                    onChange={(e) => setBaseData((p) => ({ ...p, telefono: e.target.value }))}
                    fullWidth
                    required
                    error={!!baseData.telefono && !validarTelefono(baseData.telefono)}
                    helperText={
                      !baseData.telefono?.trim()
                        ? 'Obligatorio'
                        : !validarTelefono(baseData.telefono)
                          ? 'Mínimo 5 dígitos'
                          : ''
                    }
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    size="small"
                    label="Correo electrónico o carta"
                    value={baseData.correo_electronico_o_carta ?? ''}
                    onChange={(e) => setBaseData((p) => ({ ...p, correo_electronico_o_carta: e.target.value }))}
                    fullWidth
                    required
                    placeholder="ejemplo@correo.com o Carta"
                    error={!!baseData.correo_electronico_o_carta?.trim() && !validarCorreoOCarta(baseData.correo_electronico_o_carta)}
                    helperText={
                      !baseData.correo_electronico_o_carta?.trim()
                        ? 'Obligatorio'
                        : !validarCorreoOCarta(baseData.correo_electronico_o_carta)
                          ? 'Introduzca un email válido o "carta"/"papel"'
                          : ''
                    }
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    size="small"
                    label="Dirección"
                    value={baseData.direccion ?? ''}
                    onChange={(e) => setBaseData((p) => ({ ...p, direccion: e.target.value }))}
                    fullWidth
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    size="small"
                    label="Cuenta bancaria"
                    value={baseData.cuenta_bancaria ?? ''}
                    onChange={(e) => setBaseData((p) => ({ ...p, cuenta_bancaria: e.target.value }))}
                    fullWidth
                    error={!!baseData.cuenta_bancaria?.trim() && !validarCuentaBancaria(baseData.cuenta_bancaria)}
                    helperText={
                      baseData.cuenta_bancaria?.trim() && !validarCuentaBancaria(baseData.cuenta_bancaria)
                        ? '22 números y 2 letras'
                        : ''
                    }
                  />
                </Box>
                {!esOngOTelefonia && (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      size="small"
                      label="Compañía anterior"
                      value={baseData.compania_anterior ?? ''}
                      onChange={(e) => setBaseData((p) => ({ ...p, compania_anterior: e.target.value }))}
                      fullWidth
                    />
                  </Box>
                )}
                {camposSeccionDatosBase?.length > 0 &&
                  camposSeccionDatosBase.map((c) => (
                    <Box sx={{ width: '100%' }} key={c.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          width: '100%',
                          minWidth: 0,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" component="label">
                          {labelConAsterisco(c.nombre, c.requerido)}
                        </Typography>
                        <CampoDinamicoInput
                          campo={c}
                          value={respuestas[c.nombre]}
                          onChange={(v) => actualizarRespuesta(c.nombre, v)}
                          opcionesTipoIdentificacion={tiposIdentificacion}
                          opcionesVendedor={vendedores}
                        />
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Box>
          )}

          {stepType === 'campos_del_formulario' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, pr: 0.5 }}>
                <Stack spacing={3}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Campos del formulario
                  </Typography>
                  {campoTipoProducto && (campoTipoProducto.seccion || 'campos_formulario').toLowerCase() === 'campos_formulario' && opcionesProducto?.length > 0 && (
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
                  {campoTipoProducto && (campoTipoProducto.seccion || 'campos_formulario').toLowerCase() === 'campos_formulario' && opcionesProducto?.length > 0 && !producto ? (
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
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 2,
                          width: '100%',
                        }}
                      >
                        {camposFormularioSinTipoCliente.map((c) => (
                          <Box sx={{ width: '100%' }} key={c.id}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                width: '100%',
                                minWidth: 0,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" component="label">
                                {labelConAsterisco(c.nombre, c.requerido)}
                              </Typography>
                              <CampoDinamicoInput
                                campo={c}
                                value={respuestas[c.nombre]}
                                onChange={(v) => actualizarRespuesta(c.nombre, v)}
                                opcionesTipoIdentificacion={tiposIdentificacion}
                                opcionesVendedor={vendedores}
                              />
                            </Box>
                          </Box>
                        ))}
                        {camposRepetidosExpandidos.map((c) => (
                          <Box sx={{ width: '100%' }} key={`${c.id}-${c._indice}`}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                width: '100%',
                                minWidth: 0,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" component="label">
                                {labelConAsterisco(c.nombre, c.requerido)}
                              </Typography>
                              <CampoDinamicoInput
                                campo={c}
                                value={respuestas[c.nombre]}
                                onChange={(v) => actualizarRespuesta(c.nombre, v)}
                                opcionesTipoIdentificacion={tiposIdentificacion}
                                opcionesVendedor={vendedores}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                      {campoTitular && (
                        <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!cambioTitularMarcado}
                                onChange={(e) =>
                                  actualizarRespuesta(campoTitular.nombre, e.target.checked ? '1' : '0')
                                }
                                size="small"
                              />
                            }
                            label={labelConAsterisco(campoTitular.nombre, campoTitular.requerido)}
                          />
                          {cambioTitularMarcado && (
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 2,
                                width: '100%',
                              }}
                            >
                              {camposTitularDependientes.map((c) => (
                                <Box sx={{ width: '100%' }} key={c.id}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 0.5,
                                      width: '100%',
                                      minWidth: 0,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      component="label"
                                    >
                                      {labelConAsterisco(c.nombre, c.requerido)}
                                    </Typography>
                                    <CampoDinamicoInput
                                      campo={c}
                                      value={respuestas[c.nombre]}
                                      onChange={(v) => actualizarRespuesta(c.nombre, v)}
                                      opcionesTipoIdentificacion={tiposIdentificacion}
                                      opcionesVendedor={vendedores}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Stack>
                      )}
                    </>
                  )}
                </Stack>
              </Box>
            </Box>
          )}

          {stepType === 'comercial' && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Comercial
              </Typography>
              {campoTipoProducto && (campoTipoProducto.seccion || 'campos_formulario').toLowerCase() === 'vendedor' && opcionesProducto?.length > 0 && (
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
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2,
                    width: '100%',
                  }}
                >
                  {camposSeccionVendedor.map((c) => (
                    <Box sx={{ width: '100%' }} key={c.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          width: '100%',
                          minWidth: 0,
                        }}
                      >
                        {c.tipo !== 'checkbox' && (
                          <Typography variant="body2" color="text.secondary" component="label">
                            {labelConAsterisco(c.nombre, c.requerido)}
                          </Typography>
                        )}
                        <CampoDinamicoInput
                          campo={c}
                          value={esCampoVendedor(c.nombre) ? (respuestas[c.nombre] ?? vendedorId ?? '') : respuestas[c.nombre]}
                          onChange={(v) => {
                            actualizarRespuesta(c.nombre, v);
                            if (esCampoVendedor(c.nombre)) setVendedorId(v || '');
                          }}
                          opcionesTipoIdentificacion={tiposIdentificacion}
                          opcionesVendedor={vendedores}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tieneCerrador}
                      onChange={(e) => {
                        setTieneCerrador(e.target.checked);
                        if (!e.target.checked) setCerradorId('');
                      }}
                      size="small"
                    />
                  }
                  label="Cerrador"
                />
                {tieneCerrador && (
                  <FormControl size="small" sx={{ ...selectFieldSx, maxWidth: 320 }} disabled={!esAdmin}>
                    <InputLabel id="cerrador-select-label">Cerrador</InputLabel>
                    <Select
                      labelId="cerrador-select-label"
                      value={cerradorId ?? ''}
                      label="Cerrador"
                      onChange={(e) => setCerradorId(e.target.value || '')}
                    >
                      <MenuItem value="">Seleccionar</MenuItem>
                      {(vendedores || []).map((v) => (
                        <MenuItem key={v.id} value={String(v.id)}>
                          {v.nombre_completo ?? v.nombre ?? ''}
                        </MenuItem>
                      ))}
                    </Select>
                    {!esAdmin && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Solo el administrador puede asignar el cerrador.
                      </Typography>
                    )}
                  </FormControl>
                )}
              </Box>
            </Stack>
          )}

          {stepType === 'documentos' && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Documentos (PDF DNI y factura)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suba el PDF del DNI y/o el PDF de la factura del cliente.
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, maxWidth: 500 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    PDF DNI
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth sx={{ borderRadius: 2 }}>
                    {documentoDni?.name ?? 'Seleccionar archivo'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,application/pdf"
                      onChange={(e) => setDocumentoDni(e.target.files?.[0] || null)}
                    />
                  </Button>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    PDF Factura
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth sx={{ borderRadius: 2 }}>
                    {documentoFactura?.name ?? 'Seleccionar archivo'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,application/pdf"
                      onChange={(e) => setDocumentoFactura(e.target.files?.[0] || null)}
                    />
                  </Button>
                </Box>
              </Box>
            </Stack>
          )}
          </Box>

          <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ flexShrink: 0, mt: 'auto', pt: { xs: 2, sm: 3 }, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Stack direction="row" gap={2} flexWrap="wrap">
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
              {paso < totalSteps && (
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
              {paso === totalSteps && (
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
