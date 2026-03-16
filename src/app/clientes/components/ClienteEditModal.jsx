import { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { LoadingButton } from '../../../components/loading';
import { SectionLoader } from '../../../components/loading';
import { useChoices } from '../../../context/ChoicesContext';
import * as apiCliente from '../logic/apiCliente';
import * as apiCampos from '../../campos/logic/apiCampos';

const CAMBIO_TITULAR_NAMES = ['cambio de titular', 'Cambio de titular', 'cambio titular', 'Cambio titular'];
const esCambioTitular = (c) => CAMBIO_TITULAR_NAMES.some((n) => norm(c?.nombre) === norm(n));
const esVisibleSiCambioTitular = (c) => {
  const vs = (c?.visible_si || '').toLowerCase().replace(/_/g, ' ').trim();
  return vs.includes('cambio') && vs.includes('titular');
};

const NOMBRES_PRODUCTO_CAMPO = ['producto', 'Producto', 'Productos', 'Tipo producto', 'tipo de producto'];
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
const esCampoProducto = (c) => NOMBRES_PRODUCTO_CAMPO.some((n) => norm(c.nombre) === norm(n));

function labelBase(nombre) {
  return (nombre || '').replace(/\s*\*+\s*$/g, '').trim();
}

function labelConAsterisco(nombre, requerido) {
  const base = labelBase(nombre);
  return requerido ? `${base} *` : base;
}

const ES_TIPO_IDENTIFICACION = (n) => /tipo\s*(de)?\s*identificaci[oó]n/i.test(n || '');

function CampoDinamicoInput({ campo, value, onChange, opcionesTipoIdentificacion }) {
  const { nombre, tipo, placeholder, requerido, opciones = [] } = campo;
  const id = `edit-campo-${nombre}`;
  const label = labelBase(nombre);
  const opcionesSelect = (opcionesTipoIdentificacion?.length && ES_TIPO_IDENTIFICACION(nombre))
    ? opcionesTipoIdentificacion
    : opciones;

  if (tipo === 'select' || (opcionesSelect?.length && ES_TIPO_IDENTIFICACION(nombre))) {
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
          {opcionesSelect.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (tipo === 'checkbox') {
    const checked = value === '1' || value === 'si' || value === 'true' || value === true;
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={!!checked}
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
        sx={{ maxWidth: { xs: '100%', sm: 400 } }}
      />
    );
  }

  const inputType = tipo === 'number' ? 'number' : tipo === 'date' ? 'date' : 'text';
  const ph = placeholder != null && placeholder !== '' ? String(placeholder).replace(/\s*\*+\s*$/g, '').trim() : placeholder;
  return (
    <TextField
      id={id}
      size="small"
      type={inputType}
      label={label}
      placeholder={ph}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      required={requerido}
      fullWidth
      sx={{ maxWidth: { xs: '100%', sm: 280 } }}
      inputProps={tipo === 'number' ? { min: 0, step: 1 } : undefined}
    />
  );
}

export function ClienteEditModal({
  open,
  cliente,
  onClose,
  onGuardar,
  guardando,
  productoPreSeleccionado,
  soloDatosBase = false,
}) {
  const [nombre, setNombre] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [cups, setCups] = useState('');
  const [cuentaBancaria, setCuentaBancaria] = useState('');
  const [companiaAnterior, setCompaniaAnterior] = useState('');
  const [companiaActual, setCompaniaActual] = useState('');
  const [correoElectronicoOCarta, setCorreoElectronicoOCarta] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [camposGlobales, setCamposGlobales] = useState([]);
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const [producto, setProducto] = useState('');
  const [opcionesProducto, setOpcionesProducto] = useState([]);
  const { getOptions } = useChoices();
  const tiposIdentificacion = getOptions('tipo_identificacion') || [];

  useEffect(() => {
    if (!cliente || !open) return;
    setNombre(cliente.nombre || '');
    setTipoIdentificacion(cliente.tipo_identificacion || '');
    setNumeroIdentificacion(cliente.numero_identificacion || '');
    setTelefono(cliente.telefono || '');
    setDireccion(cliente.direccion || '');
    setCups(cliente.cups || '');
    setCuentaBancaria(cliente.cuenta_bancaria || '');
    setCompaniaAnterior(cliente.compania_anterior || '');
    setCompaniaActual(cliente.compania_actual || '');
    setCorreoElectronicoOCarta(cliente.correo_electronico_o_carta || '');
    setProducto(productoPreSeleccionado ?? cliente.producto ?? '');
    const r = {};
    (cliente.respuestas || []).forEach((item) => {
      r[item.nombre_campo] = item.respuesta_campo ?? '';
    });
    setRespuestas(r);
  }, [cliente, open, productoPreSeleccionado]);

  useEffect(() => {
    if (!cliente?.servicio_id || !cliente?.servicio_empresa_id || !open) return;
    let cancelled = false;
    const params = { empresaId: cliente.servicio_empresa_id, servicioId: cliente.servicio_id };
    apiCampos.obtenerOpcionesCampoPorNombre('producto', params)
      .then((list) => { if (!cancelled) setOpcionesProducto(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setOpcionesProducto([]); });
    return () => { cancelled = true; };
  }, [cliente?.servicio_id, cliente?.servicio_empresa_id, open]);

  useEffect(() => {
    if (!cliente?.servicio_id || !open) return;
    let cancelled = false;
    setCargandoCampos(true);
    const empresaId = cliente.servicio_empresa_id;
    const servicioId = cliente.servicio_id;
    const productoParam = (producto || cliente?.producto || '').trim() || undefined;
    Promise.all([
      apiCliente.obtenerCamposFormulario(undefined, undefined, productoParam),
      empresaId && servicioId ? apiCliente.obtenerCamposFormulario(empresaId, servicioId, productoParam) : Promise.resolve([]),
    ])
      .then(([globales, porServicio]) => {
        if (!cancelled) {
          setCamposGlobales(Array.isArray(globales) ? globales : []);
          setCamposFormulario(Array.isArray(porServicio) ? porServicio : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCamposGlobales([]);
          setCamposFormulario([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCargandoCampos(false);
      });
    return () => { cancelled = true; };
  }, [cliente?.servicio_id, cliente?.servicio_empresa_id, open, producto]);

  const respuestasNombres = new Set((cliente?.respuestas || []).map((r) => r.nombre_campo).filter(Boolean));
  const campoTitular = [...camposFormulario, ...camposGlobales].find(esCambioTitular);
  const camposTitularDependientes = [...camposFormulario, ...camposGlobales]
    .filter((c) => !esCampoProducto(c) && !esCambioTitular(c) && esVisibleSiCambioTitular(c));
  const cambioTitularMarcado = campoTitular ? (respuestas[campoTitular.nombre] === '1' || respuestas[campoTitular.nombre] === 'si' || respuestas[campoTitular.nombre] === true) : false;
  const camposEnviados = [...camposFormulario, ...camposGlobales]
    .filter((c) => !esCampoProducto(c) && respuestasNombres.has(c.nombre));
  const camposParaEditar = camposEnviados.filter((c) => !esCambioTitular(c) && !esVisibleSiCambioTitular(c));

  const actualizarRespuesta = useCallback((nombreCampo, valor) => {
    setRespuestas((p) => ({ ...p, [nombreCampo]: valor }));
  }, []);

  const handleSubmit = () => {
    if (!nombre?.trim()) return;
    const respuestasList = soloDatosBase ? [] : (() => {
      const list = [];
      const todosCamposEditar = [...camposParaEditar];
      if (campoTitular) todosCamposEditar.push(campoTitular);
      if (cambioTitularMarcado) todosCamposEditar.push(...camposTitularDependientes);
      todosCamposEditar.forEach((c) => {
        const v = respuestas[c.nombre];
        if (v != null && String(v).trim() !== '') {
          list.push({ nombre_campo: c.nombre, respuesta_campo: String(v).trim() });
        }
      });
      return list;
    })();

    onGuardar({
      nombre: nombre.trim(),
      tipo_identificacion: tipoIdentificacion.trim() || '',
      numero_identificacion: numeroIdentificacion.trim() || '',
      telefono: telefono.trim() || '',
      correo_electronico_o_carta: correoElectronicoOCarta.trim() || '',
      direccion: direccion.trim() || '',
      cups: cups.trim() || '',
      cuenta_bancaria: cuentaBancaria.trim() || '',
      compania_anterior: companiaAnterior.trim() || '',
      compania_actual: companiaActual.trim() || '',
      respuestas: respuestasList,
    });
  };

  if (!cliente) return null;

  const inputSx = { width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { ...modalPaperSx, maxWidth: 560 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>{soloDatosBase ? 'Editar datos del cliente' : 'Editar cliente'}</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Modifica la información del cliente. Los campos marcados con * son obligatorios.
        </Typography>

        <Stack spacing={2.5}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Datos base</Typography>
          <TextField
            fullWidth
            size="small"
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            sx={inputSx}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Tipo identificación</InputLabel>
              <Select
                value={tipoIdentificacion}
                label="Tipo identificación"
                onChange={(e) => setTipoIdentificacion(e.target.value)}
              >
                <MenuItem value="">-</MenuItem>
                {tiposIdentificacion.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Número identificación"
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
            <TextField
              size="small"
              label="Correo electrónico o carta"
              value={correoElectronicoOCarta}
              onChange={(e) => setCorreoElectronicoOCarta(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
          </Stack>
          <TextField
            fullWidth
            size="small"
            label="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            sx={inputSx}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="CUPS"
              value={cups}
              onChange={(e) => setCups(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
            <TextField
              size="small"
              label="Cuenta bancaria"
              value={cuentaBancaria}
              onChange={(e) => setCuentaBancaria(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Compañía anterior"
              value={companiaAnterior}
              onChange={(e) => setCompaniaAnterior(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
            <TextField
              size="small"
              label="Compañía actual"
              value={companiaActual}
              onChange={(e) => setCompaniaActual(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
          </Stack>
          {!soloDatosBase && (camposParaEditar.length > 0 || campoTitular || opcionesProducto?.length > 0) && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Campos del formulario (enviados)</Typography>
              {opcionesProducto?.length > 0 && respuestasNombres.size > 0 && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={producto}
                    label="Producto"
                    onChange={(e) => setProducto(e.target.value)}
                  >
                    <MenuItem value="">Todos los productos</MenuItem>
                    {opcionesProducto.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Solo se muestran los campos que fueron enviados al crear el registro.
                  </Typography>
                </FormControl>
              )}
              {cargandoCampos ? (
                <SectionLoader message="Cargando campos del formulario..." minHeight={120} />
              ) : (
                <Stack spacing={2}>
                  {camposParaEditar.map((c) => (
                    <CampoDinamicoInput
                      key={c.nombre}
                      campo={c}
                      value={respuestas[c.nombre]}
                      onChange={(v) => actualizarRespuesta(c.nombre, v)}
                      opcionesTipoIdentificacion={tiposIdentificacion}
                    />
                  ))}
                  {campoTitular && (
                    <>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!cambioTitularMarcado}
                            onChange={(e) => actualizarRespuesta(campoTitular.nombre, e.target.checked ? '1' : '0')}
                            size="small"
                          />
                        }
                        label={campoTitular.nombre}
                      />
                      {cambioTitularMarcado && camposTitularDependientes.map((c) => (
                        <CampoDinamicoInput
                          key={c.nombre}
                          campo={c}
                          value={respuestas[c.nombre]}
                          onChange={(v) => actualizarRespuesta(c.nombre, v)}
                          opcionesTipoIdentificacion={tiposIdentificacion}
                        />
                      ))}
                    </>
                  )}
                </Stack>
              )}
            </>
          )}

        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 2, gap: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={guardando}>Cancelar</Button>
        <LoadingButton variant="contained" onClick={handleSubmit} disabled={!nombre?.trim()} loading={guardando} loadingText="Guardando...">
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
