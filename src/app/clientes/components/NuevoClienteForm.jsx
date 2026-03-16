import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPACT_MEDIA } from '../../../utils/theme';
import { LoadingButton } from '../../../components/loading';
import { useChoices } from '../../../context/ChoicesContext';
import { useNuevoCliente } from '../logic/useNuevoCliente';
import { esVisible, buildIdToNombreMap } from '../logic/formularioVisible';
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

const NOMBRES_TIPO_ID_CAMPO = ['tipo de identificación', 'tipo identificación', 'tipo ident', 'tipo_id'];
const esCampoTipoIdentificacion = (n) => NOMBRES_TIPO_ID_CAMPO.some(
  (x) => (n || '').toLowerCase().replace(/\s+/g, '_').includes((x || '').toLowerCase().replace(/\s+/g, '_'))
);

/** Detecta si el campo es de vendedor (por nombre). Las opciones vienen de la tabla vendedores. */
const esCampoVendedor = (n) => /vendedor/i.test(n || '');

function CampoDinamicoInput({
  campo,
  value,
  onChange,
  opcionesTipoIdentificacion,
  opcionesVendedor,
  opcionesPorEntidad = {},
  loadingEntidad = {},
  disabled: disabledProp = false,
  /** Clave para opciones (entidad o entidad_valorPadre cuando hay depende_de). */
  opcionesKey,
  /** Placeholder cuando el campo está deshabilitado por dependencia (ej. "Seleccione primero Servicio"). */
  placeholderCuandoDeshabilitado,
}) {
  const { nombre, tipo, placeholder, requerido, opciones = [], entidad } = campo;
  const id = `campo-${nombre}`;
  const label = labelBase(nombre);
  const usarChoicesTipoId = opcionesTipoIdentificacion?.length && esCampoTipoIdentificacion(nombre);
  const usarOpcionesVendedor = opcionesVendedor?.length && esCampoVendedor(nombre);
  const esEntitySelect = tipo === 'entity_select' && entidad;
  const key = opcionesKey != null ? opcionesKey : entidad;
  const opcionesEntity = esEntitySelect ? (opcionesPorEntidad[key] || []) : [];
  const cargandoEntity = esEntitySelect && !!loadingEntidad[key];
  const opcionesSelect = usarChoicesTipoId
    ? opcionesTipoIdentificacion
    : (usarOpcionesVendedor ? opcionesVendedor.map((v) => ({ value: String(v.id), label: v.nombre })) : (esEntitySelect ? opcionesEntity : opciones));
  const disabled = disabledProp || cargandoEntity;
  const placeholderEfectivo = disabled && placeholderCuandoDeshabilitado
    ? placeholderCuandoDeshabilitado
    : (placeholder != null && placeholder !== '' ? String(placeholder).replace(/\s*\*+\s*$/g, '').trim() : placeholder);

  if (tipo === 'select' || tipo === 'entity_select' || usarChoicesTipoId || usarOpcionesVendedor) {
    const valueStr = value != null && value !== '' ? String(value) : '';
    return (
      <FormControl size="small" fullWidth sx={campoDinamicoSx} required={requerido} disabled={disabled}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          value={valueStr}
          label={label}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          displayEmpty={cargandoEntity || (disabled && !!placeholderCuandoDeshabilitado)}
          renderValue={(v) => {
            if (cargandoEntity) return 'Cargando...';
            if (disabled && placeholderCuandoDeshabilitado && (v == null || v === '')) return placeholderCuandoDeshabilitado;
            if (v != null && v !== '') {
              const opt = (opcionesSelect || []).find((o) => String(o.value) === String(v));
              return opt ? opt.label : v;
            }
            return undefined;
          }}
        >
          <MenuItem value="">{disabled && placeholderCuandoDeshabilitado ? placeholderCuandoDeshabilitado : 'Seleccionar'}</MenuItem>
          {(opcionesSelect || []).map((o) => (
            <MenuItem key={o.value} value={String(o.value)}>{o.label}</MenuItem>
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
            disabled={disabled}
          />
        }
        label={labelConAsterisco(nombre, requerido)}
      />
    );
  }

  if (tipo === 'textarea') {
    const ph = placeholderEfectivo ?? (placeholder != null && placeholder !== '' ? String(placeholder).replace(/\s*\*+\s*$/g, '').trim() : placeholder);
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
        disabled={disabled}
        sx={campoDinamicoSx}
      />
    );
  }

  const inputType = tipo === 'number' ? 'number' : tipo === 'date' ? 'date' : 'text';
  const placeholderLimpio = placeholderEfectivo ?? (placeholder != null && placeholder !== '' ? String(placeholder).replace(/\s*\*+\s*$/g, '').trim() : placeholder);
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
      disabled={disabled}
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
    camposOrdenadosCliente,
    listaCamposConPadres = [],
    actualizarRespuestaClienteConReset,
    actualizarRespuestaConResetDependientes,
    empresa,
    setEmpresa,
    servicio,
    setServicio,
    baseData,
    setBaseData,
    getValorPadre,
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
    camposSeccionCliente,
    camposSeccionDatosBase,
    camposSeccionVendedor,
    opcionesPorEntidad = {},
    loadingEntidad = {},
    todosLosCamposUnicos = [],
  } = useNuevoCliente();

  const idToNombreMap = useMemo(() => buildIdToNombreMap(todosLosCamposUnicos), [todosLosCamposUnicos]);

  const { getOptions } = useChoices();
  const tiposIdentificacion = getOptions('tipo_identificacion') || [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'DNI', label: 'DNI' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'PPT', label: 'Permiso provisional de trabajo' },
    { value: 'OTRO', label: 'Otro' },
  ];

  // DEBUG: validación paso 1 — quitar cuando confirmes que el botón Siguiente se habilita bien
  useEffect(() => {
    if (paso === 1) {
      console.log('formState', respuestas);
      console.log('isFormValid', puedeSiguientePaso());
    }
  }, [paso, respuestas, puedeSiguientePaso]);

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
              Paso {paso} de 4 — {STEPS[paso - 1]}
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '1rem' } }}>
              Completa la información en 4 pasos
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
            {STEPS.map((label) => (
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
          {paso === 1 && (
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Cliente
              </Typography>
              {(paso === 1 && cargandoCampos) ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">Cargando campos...</Typography>
                </Box>
              ) : !camposOrdenadosCliente?.length ? (
                <Typography variant="body2" color="text.secondary">
                  Configure los campos de la sección Cliente en Configuración de campos para continuar.
                </Typography>
              ) : (
                <>
                  <Grid container spacing={3} sx={{ width: '100%' }}>
                    {camposOrdenadosCliente.filter((c) => esVisible(c, respuestas, idToNombreMap)).map((c, idx) => {
                      const lista = listaCamposConPadres.length ? listaCamposConPadres : (camposOrdenadosCliente || []);
                      const habilitado = getValorPadre ? getValorPadre(c, lista) : true;
                      const padre = c.depende_de ? lista.find((f) => f.id === c.depende_de) : null;
                      const opcionesKey = c.depende_de && padre ? `${(c.entidad || '').toLowerCase().trim()}_${respuestas[padre.nombre] ?? ''}` : (c.entidad || '').toLowerCase().trim();
                      const placeholderCuandoDeshabilitado = c.depende_de && c.depende_de_nombre ? `Seleccione primero ${c.depende_de_nombre}` : null;
                      return (
                        <Grid item xs={12} sm={6} key={c.id ?? c.nombre}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', minWidth: 0 }}>
                            {c.tipo !== 'checkbox' && (
                              <Typography variant="body2" color="text.secondary" component="label">
                                {labelConAsterisco(c.nombre, c.requerido)}
                              </Typography>
                            )}
                            <CampoDinamicoInput
                              campo={c}
                              value={respuestas[c.nombre]}
                              onChange={(v) => actualizarRespuestaClienteConReset(c.nombre, v, idx)}
                              disabled={!habilitado}
                              opcionesTipoIdentificacion={tiposIdentificacion}
                              opcionesVendedor={vendedores}
                              opcionesPorEntidad={opcionesPorEntidad}
                              loadingEntidad={loadingEntidad}
                              opcionesKey={c.tipo === 'entity_select' ? opcionesKey : undefined}
                              placeholderCuandoDeshabilitado={placeholderCuandoDeshabilitado}
                            />
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}
            </Stack>
          )}

          {paso === 2 && (
            <Box sx={{ width: '100%', minWidth: 0, maxWidth: 800 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
                Datos base del cliente
              </Typography>
              <Grid container spacing={3} sx={{ width: '100%' }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Nombre"
                    value={baseData.nombre}
                    onChange={(e) => setBaseData((p) => ({ ...p, nombre: e.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl size="small" required fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel id="tipo-identificacion-datos-label">Tipo de identificación</InputLabel>
                    <Select
                      labelId="tipo-identificacion-datos-label"
                      value={baseData.tipo_identificacion}
                      label="Tipo de identificación"
                      onChange={(e) => setBaseData((p) => ({ ...p, tipo_identificacion: e.target.value }))}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                    >
                      <MenuItem value="">Seleccionar</MenuItem>
                      {tiposIdentificacion.map((o) => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Número de identificación"
                    value={baseData.numero_identificacion}
                    onChange={(e) => setBaseData((p) => ({ ...p, numero_identificacion: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Teléfono"
                    value={baseData.telefono}
                    onChange={(e) => setBaseData((p) => ({ ...p, telefono: e.target.value }))}
                    fullWidth
                    required
                    error={!!baseData.telefono && !validarTelefono(baseData.telefono)}
                    helperText={!baseData.telefono?.trim() ? 'Obligatorio' : !validarTelefono(baseData.telefono) ? 'Mínimo 5 dígitos' : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    type="email"
                    label="Correo"
                    value={baseData.correo}
                    onChange={(e) => setBaseData((p) => ({ ...p, correo: e.target.value }))}
                    fullWidth
                    required
                    error={!!baseData.correo && !validarCorreo(baseData.correo)}
                    helperText={!baseData.correo?.trim() ? 'Obligatorio' : !validarCorreo(baseData.correo) ? 'Correo no válido' : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Dirección"
                    value={baseData.direccion ?? ''}
                    onChange={(e) => setBaseData((p) => ({ ...p, direccion: e.target.value }))}
                    fullWidth
                  />
                </Grid>
              </Grid>
              {cargandoCampos && !camposSeccionDatosBase?.length ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">Cargando campos adicionales...</Typography>
                </Box>
              ) : camposSeccionDatosBase?.length > 0 ? (
                <Grid container spacing={3} sx={{ width: '100%', mt: 3 }}>
                  {camposSeccionDatosBase.filter((c) => esVisible(c, respuestas, idToNombreMap)).map((c) => {
                    const lista = listaCamposConPadres.length ? listaCamposConPadres : (camposSeccionDatosBase || []);
                    const habilitado = getValorPadre ? getValorPadre(c, lista) : true;
                    const padre = c.depende_de ? lista.find((f) => f.id === c.depende_de) : null;
                    const opcionesKey = c.depende_de && padre ? `${(c.entidad || '').toLowerCase().trim()}_${respuestas[padre.nombre] ?? ''}` : (c.entidad || '').toLowerCase().trim();
                    const placeholderCuandoDeshabilitado = c.depende_de && c.depende_de_nombre ? `Seleccione primero ${c.depende_de_nombre}` : null;
                    return (
                      <Grid item xs={12} sm={6} key={c.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" component="label">
                            {labelConAsterisco(c.nombre, c.requerido)}
                          </Typography>
                          <CampoDinamicoInput
                            campo={c}
                            value={respuestas[c.nombre]}
                            onChange={(v) => (actualizarRespuestaConResetDependientes ? actualizarRespuestaConResetDependientes(c.nombre, v, todosLosCamposUnicos) : actualizarRespuesta(c.nombre, v))}
                            disabled={!habilitado}
                            opcionesTipoIdentificacion={tiposIdentificacion}
                            opcionesVendedor={vendedores}
                            opcionesPorEntidad={opcionesPorEntidad}
                            loadingEntidad={loadingEntidad}
                            opcionesKey={c.tipo === 'entity_select' ? opcionesKey : undefined}
                            placeholderCuandoDeshabilitado={placeholderCuandoDeshabilitado}
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : null}
            </Box>
          )}

          {paso === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, pr: 0.5 }}>
                <Stack spacing={3}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Campos del formulario
                  </Typography>
                  {cargandoCampos ? (
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
                      <Stack spacing={2} sx={{ width: '100%', maxWidth: { sm: 520 } }}>
                        {camposFormularioSinTipoCliente.filter((c) => esVisible(c, respuestas, idToNombreMap)).map((c) => {
                          const lista = listaCamposConPadres.length ? listaCamposConPadres : (camposFormularioSinTipoCliente || []);
                          const habilitado = getValorPadre ? getValorPadre(c, lista) : true;
                          const padre = c.depende_de ? lista.find((f) => f.id === c.depende_de) : null;
                          const opcionesKey = c.depende_de && padre ? `${(c.entidad || '').toLowerCase().trim()}_${respuestas[padre.nombre] ?? ''}` : (c.entidad || '').toLowerCase().trim();
                          const placeholderCuandoDeshabilitado = c.depende_de && c.depende_de_nombre ? `Seleccione primero ${c.depende_de_nombre}` : null;
                          return (
                            <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2} sx={{ width: '100%', minWidth: 0 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 160 }, flexShrink: 0 }}>
                                {labelConAsterisco(c.nombre, c.requerido)}
                              </Typography>
                              <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
                                <CampoDinamicoInput
                                  campo={c}
                                  value={respuestas[c.nombre]}
                                  onChange={(v) => (actualizarRespuestaConResetDependientes ? actualizarRespuestaConResetDependientes(c.nombre, v, todosLosCamposUnicos) : actualizarRespuesta(c.nombre, v))}
                                  disabled={!habilitado}
                                  opcionesTipoIdentificacion={tiposIdentificacion}
                                  opcionesVendedor={vendedores}
                                  opcionesPorEntidad={opcionesPorEntidad}
                                  loadingEntidad={loadingEntidad}
                                  opcionesKey={c.tipo === 'entity_select' ? opcionesKey : undefined}
                                  placeholderCuandoDeshabilitado={placeholderCuandoDeshabilitado}
                                />
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                      {campoTitular && (
                <Stack spacing={2} sx={{ width: '100%', maxWidth: { sm: 520 } }}>
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
                  {cambioTitularMarcado && camposTitularDependientes.filter((c) => esVisible(c, respuestas, idToNombreMap)).map((c) => {
                    const lista = listaCamposConPadres.length ? listaCamposConPadres : [...(camposFormularioSinTipoCliente || []), campoTitular, ...(camposTitularDependientes || [])];
                    const habilitado = getValorPadre ? getValorPadre(c, lista) : true;
                    const padre = c.depende_de ? lista.find((f) => f.id === c.depende_de) : null;
                    const opcionesKey = c.depende_de && padre ? `${(c.entidad || '').toLowerCase().trim()}_${respuestas[padre.nombre] ?? ''}` : (c.entidad || '').toLowerCase().trim();
                    const placeholderCuandoDeshabilitado = c.depende_de && c.depende_de_nombre ? `Seleccione primero ${c.depende_de_nombre}` : null;
                    return (
                      <Stack key={c.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2} sx={{ width: '100%', minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 180 } }}>
                          {labelConAsterisco(c.nombre, c.requerido)}
                        </Typography>
                        <Box sx={{ flex: 1, width: '100%' }}>
                          <CampoDinamicoInput
                            campo={c}
                            value={respuestas[c.nombre]}
                            onChange={(v) => (actualizarRespuestaConResetDependientes ? actualizarRespuestaConResetDependientes(c.nombre, v, todosLosCamposUnicos) : actualizarRespuesta(c.nombre, v))}
                            disabled={!habilitado}
                            opcionesTipoIdentificacion={tiposIdentificacion}
                            opcionesVendedor={vendedores}
                            opcionesPorEntidad={opcionesPorEntidad}
                            loadingEntidad={loadingEntidad}
                            opcionesKey={c.tipo === 'entity_select' ? opcionesKey : undefined}
                            placeholderCuandoDeshabilitado={placeholderCuandoDeshabilitado}
                          />
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
                    </>
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
              {camposSeccionVendedor?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay campos configurados para esta sección. Agregue campos con sección &quot;Vendedor&quot; en Configuración.
                </Typography>
              ) : (
                <Grid container spacing={3} sx={{ width: '100%' }}>
                  {camposSeccionVendedor.filter((c) => esVisible(c, respuestas, idToNombreMap)).map((c) => {
                    const lista = listaCamposConPadres.length ? listaCamposConPadres : (camposSeccionVendedor || []);
                    const habilitado = getValorPadre ? getValorPadre(c, lista) : true;
                    const padre = c.depende_de ? lista.find((f) => f.id === c.depende_de) : null;
                    const opcionesKey = c.depende_de && padre ? `${(c.entidad || '').toLowerCase().trim()}_${respuestas[padre.nombre] ?? ''}` : (c.entidad || '').toLowerCase().trim();
                    const placeholderCuandoDeshabilitado = c.depende_de && c.depende_de_nombre ? `Seleccione primero ${c.depende_de_nombre}` : null;
                    return (
                      <Grid item xs={12} sm={6} key={c.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', minWidth: 0 }}>
                          {c.tipo !== 'checkbox' && (
                            <Typography variant="body2" color="text.secondary" component="label">
                              {labelConAsterisco(c.nombre, c.requerido)}
                            </Typography>
                          )}
                          <CampoDinamicoInput
                            campo={c}
                            value={esCampoVendedor(c.nombre) ? (respuestas[c.nombre] ?? vendedorId ?? '') : respuestas[c.nombre]}
                            onChange={(v) => {
                              if (actualizarRespuestaConResetDependientes) actualizarRespuestaConResetDependientes(c.nombre, v, todosLosCamposUnicos);
                              else actualizarRespuesta(c.nombre, v);
                              if (esCampoVendedor(c.nombre)) setVendedorId(v || '');
                            }}
                            disabled={!habilitado}
                            opcionesTipoIdentificacion={tiposIdentificacion}
                            opcionesVendedor={vendedores}
                            opcionesPorEntidad={opcionesPorEntidad}
                            loadingEntidad={loadingEntidad}
                            opcionesKey={c.tipo === 'entity_select' ? opcionesKey : undefined}
                            placeholderCuandoDeshabilitado={placeholderCuandoDeshabilitado}
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
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
