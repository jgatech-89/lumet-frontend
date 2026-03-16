import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Box,
  Button,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import * as apiCliente from '../logic/apiCliente';
import * as apiCampos from '../../campos/logic/apiCampos';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';
import { listarServiciosActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarContratistasPorServicio } from '../../servicios/logic/apiServicios';
import { useChoices } from '../../../context/ChoicesContext';
import { esVisible, buildIdToNombreMap } from '../logic/formularioVisible';

const NOMBRES_TIPO_CLIENTE = ['tipo_cliente', 'Tipo de cliente', 'Tipo Cliente', 'tipo cliente'];
const NOMBRES_VENDEDOR = ['vendedor', 'Vendedor'];
const NOMBRES_TIPO_ID_CAMPO = ['tipo de identificación', 'tipo identificación', 'tipo ident', 'tipo_id'];
const esCampoTipoIdentificacion = (n) => NOMBRES_TIPO_ID_CAMPO.some(
  (x) => (n || '').toLowerCase().replace(/\s+/g, '_').includes((x || '').toLowerCase().replace(/\s+/g, '_'))
);
const CAMBIO_TITULAR_NAMES = ['cambio de titular', 'Cambio de titular', 'cambio titular', 'Cambio titular'];
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
const esTipoCliente = (c) => NOMBRES_TIPO_CLIENTE.some((n) => norm(c?.nombre) === norm(n));
const esVendedor = (c) => NOMBRES_VENDEDOR.some((n) => norm(c?.nombre) === norm(n));
const esCambioTitular = (c) => CAMBIO_TITULAR_NAMES.some((n) => norm(c?.nombre) === norm(n));
const esVisibleSiCambioTitular = (c) => {
  const vs = c?.visible_si;
  if (!vs) return false;
  if (typeof vs === 'object' && vs.campo) {
    const name = String(vs.campo).toLowerCase().replace(/_/g, ' ');
    return name.includes('cambio') && name.includes('titular');
  }
  const str = (vs || '').toLowerCase().replace(/_/g, ' ').trim();
  return str.includes('cambio') && str.includes('titular');
};

function labelBase(nombre) {
  return (nombre || '').replace(/\s*\*+\s*$/g, '').trim();
}

function CampoDinamicoInput({ campo, value, onChange, opcionesTipoIdentificacion }) {
  const { nombre, tipo, placeholder, opciones = [] } = campo;
  const id = `editar-prod-${nombre}`;
  const label = labelBase(nombre);
  const usarChoicesTipoId = opcionesTipoIdentificacion?.length && esCampoTipoIdentificacion(nombre);
  const opcionesSelect = usarChoicesTipoId ? opcionesTipoIdentificacion : opciones;

  if (tipo === 'select' || opcionesSelect?.length > 0) {
    return (
      <FormControl size="small" sx={{ flex: 1, width: '100%', maxWidth: 280 }}>
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
            <MenuItem key={String(o.value ?? o.label)} value={o.value ?? o.label ?? ''}>{o.label ?? o.value ?? ''}</MenuItem>
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
        label={label}
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
        fullWidth
        sx={{ maxWidth: 400 }}
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
      fullWidth
      sx={{ maxWidth: 280 }}
      inputProps={tipo === 'number' ? { min: 0, step: 1 } : undefined}
    />
  );
}

export function EditarProductoModal({
  open,
  onClose,
  cliente,
  producto,
  opcionesEstadoVenta = [],
  onGuardar,
  guardando,
}) {
  const { getOptions } = useChoices();
  const [respuestas, setRespuestas] = useState({});
  const [tipoCliente, setTipoCliente] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [productoValor, setProductoValor] = useState('');
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [opcionesProducto, setOpcionesProducto] = useState([]);
  const [tipoClienteOptions, setTipoClienteOptions] = useState([]);

  useEffect(() => {
    if (!open || !cliente || !producto) return;
    const r = {};
    (cliente.respuestas || []).forEach((item) => {
      r[item.nombre_campo] = item.respuesta_campo ?? '';
    });
    if (producto?.vendedor != null && String(producto.vendedor).trim() !== '') {
      r.vendedor = String(producto.vendedor);
      r.Vendedor = String(producto.vendedor);
    }
    setRespuestas(r);
    setTipoCliente(producto?.tipo_cliente ?? r['Tipo de cliente'] ?? r['tipo_cliente'] ?? '');
    setEmpresaId(producto?.servicio ?? producto?.servicio_id ?? '');
    setServicioId(producto?.contratista ?? producto?.contratista_id ?? '');
    setProductoValor(producto?.producto ?? '');
  }, [cliente, producto, open]);

  useEffect(() => {
    if (!open) return;
    listarVendedores(1, 100, { estado: '1' })
      .then(({ results }) => setVendedores(Array.isArray(results) ? results : []))
      .catch(() => setVendedores([]));
    listarServiciosActivasParaSelect()
      .then((list) => setEmpresas(Array.isArray(list) ? list : []))
      .catch(() => setEmpresas([]));
  }, [open]);

  useEffect(() => {
    if (!empresaId) {
      setServicios([]);
      return;
    }
    listarContratistasPorServicio(Number(empresaId))
      .then((list) => setServicios(Array.isArray(list) ? list : []))
      .catch(() => setServicios([]));
  }, [empresaId]);

  useEffect(() => {
    if (!open || !empresaId || !servicioId) {
      setOpcionesProducto([]);
      return;
    }
    const params = { servicioId: Number(empresaId), contratistaId: Number(servicioId) };
    apiCampos.obtenerOpcionesCampoPorNombre('producto', params)
      .then((list) => setOpcionesProducto(Array.isArray(list) ? list : []))
      .catch(() => setOpcionesProducto([]));
  }, [open, empresaId, servicioId]);

  /** Tipo de cliente: opciones desde config campos; fallback a choices */
  useEffect(() => {
    const fallback = getOptions('tipo_cliente') || [];
    if (!open || !empresaId || !servicioId) {
      setTipoClienteOptions(fallback);
      return;
    }
    const params = { servicioId: Number(empresaId), contratistaId: Number(servicioId) };
    apiCampos.obtenerOpcionesCampoPorNombre('tipo_cliente', params)
      .then((list) => {
        const opts = Array.isArray(list) ? list.map((o) => ({ value: o.value ?? o.label ?? '', label: o.label ?? o.value ?? '' })).filter((o) => o.value || o.label) : [];
        setTipoClienteOptions(opts.length > 0 ? opts : fallback);
      })
      .catch(() => setTipoClienteOptions(fallback));
  }, [open, empresaId, servicioId, getOptions]);

  useEffect(() => {
    if (!open || !empresaId || !servicioId) {
      setCamposFormulario([]);
      return;
    }
    let cancelled = false;
    setCargandoCampos(true);
    const productoParam = (productoValor || '').trim() || undefined;
    apiCliente.obtenerCamposFormulario(Number(empresaId), Number(servicioId), productoParam)
      .then((campos) => {
        if (!cancelled) setCamposFormulario(Array.isArray(campos) ? campos : []);
      })
      .catch(() => { if (!cancelled) setCamposFormulario([]); })
      .finally(() => { if (!cancelled) setCargandoCampos(false); });
    return () => { cancelled = true; };
  }, [open, empresaId, servicioId, productoValor]);

  const actualizarRespuesta = useCallback((nombreCampo, valor) => {
    setRespuestas((p) => ({ ...p, [nombreCampo]: valor }));
  }, []);

  const respuestasNombres = new Set((cliente?.respuestas || []).map((r) => r.nombre_campo).filter(Boolean));
  const campoTitular = camposFormulario.find(esCambioTitular);
  const camposTitularDependientes = camposFormulario.filter(
    (c) => !esCambioTitular(c) && esVisibleSiCambioTitular(c)
  );
  const cambioTitularMarcado = campoTitular
    ? (respuestas[campoTitular.nombre] === '1' || respuestas[campoTitular.nombre] === 'si' || respuestas[campoTitular.nombre] === true)
    : false;
  const camposParaEditar = camposFormulario.filter(
    (c) => !esTipoCliente(c) && !esVendedor(c) && !esCambioTitular(c) && !esVisibleSiCambioTitular(c)
  );
  const idToNombreMap = useMemo(() => buildIdToNombreMap(camposFormulario), [camposFormulario]);

  const labelEstado = opcionesEstadoVenta?.length > 0
    ? opcionesEstadoVenta.find(
        (o) => (o.value || '').toLowerCase() === (producto?.estado_venta || '').toLowerCase()
      )?.label ?? producto?.estado_venta
    : producto?.estado_venta;

  const handleSubmit = () => {
    const respuestasList = [];
    [...camposParaEditar].forEach((c) => {
      const v = respuestas[c.nombre];
      if (v != null && String(v).trim() !== '') {
        respuestasList.push({ nombre_campo: c.nombre, respuesta_campo: String(v).trim() });
      }
    });
    if (campoTitular) {
      const v = respuestas[campoTitular.nombre];
      if (v != null && String(v).trim() !== '') {
        respuestasList.push({ nombre_campo: campoTitular.nombre, respuesta_campo: String(v).trim() });
      }
      if (cambioTitularMarcado) {
        camposTitularDependientes.forEach((c) => {
          const v = respuestas[c.nombre];
          if (v != null && String(v).trim() !== '') {
            respuestasList.push({ nombre_campo: c.nombre, respuesta_campo: String(v).trim() });
          }
        });
      }
    }
    const vendedorVal = respuestas['vendedor'] ?? respuestas['Vendedor'];
    if (vendedorVal != null && String(vendedorVal).trim() !== '') {
      respuestasList.push({ nombre_campo: 'vendedor', respuesta_campo: String(vendedorVal).trim() });
    }
    onGuardar?.({
      cliente_empresa_id: producto?.id,
      tipo_cliente: (tipoCliente || '').trim(),
      contratista_id: servicioId ? Number(servicioId) : null,
      producto: (productoValor || '').trim(),
      respuestas: respuestasList,
    });
  };

  if (!producto || !open) return null;

  const vendedorActual = respuestas['vendedor'] ?? respuestas['Vendedor'] ?? '';
  const hayInformacionAdicional = camposParaEditar.length > 0 || campoTitular;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { ...modalPaperSx, maxWidth: 600, maxHeight: '92vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Editar producto</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar" disabled={guardando}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto' }}>
        {/* 1. Servicio y producto (editable excepto estado) */}
        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Servicio y producto
        </Typography>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Tipo de cliente</InputLabel>
            <Select
              value={tipoCliente}
              label="Tipo de cliente"
              onChange={(e) => setTipoCliente(e.target.value)}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {tipoClienteOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Servicio</InputLabel>
            <Select
              value={empresaId}
              label="Servicio"
              onChange={(e) => {
                setEmpresaId(e.target.value);
                setServicioId('');
              }}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {empresas.map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.nombre ?? e.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Contratistas</InputLabel>
            <Select
              value={servicioId}
              label="Contratistas"
              onChange={(e) => setServicioId(e.target.value)}
              disabled={!empresaId}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {servicios.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.nombre ?? s.servicio ?? s.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Producto</InputLabel>
            <Select
              value={productoValor}
              label="Producto"
              onChange={(e) => setProductoValor(e.target.value)}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {opcionesProducto.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Estado de venta</Typography>
            <Typography variant="body2">{labelEstado}</Typography>
          </Stack>
        </Stack>

        {/* 2. Vendedor */}
        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Vendedor
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>Vendedor</InputLabel>
          <Select
            value={vendedorActual}
            label="Vendedor"
            onChange={(e) => {
              actualizarRespuesta('vendedor', e.target.value);
              actualizarRespuesta('Vendedor', e.target.value);
            }}
          >
            <MenuItem value="">Seleccionar</MenuItem>
            {vendedores.map((v) => (
              <MenuItem key={v.id} value={String(v.id)}>{v.nombre_completo ?? v.nombre ?? v.id}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 3. Información adicional - solo cuando hay campos cargados */}
        {hayInformacionAdicional && (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Información adicional
            </Typography>
            {cargandoCampos ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Stack spacing={2} sx={{ mb: 2 }}>
                {camposParaEditar.filter((c) => esVisible(c, respuestas, idToNombreMap)).map((c) => (
                  <CampoDinamicoInput
                    key={c.nombre}
                    campo={c}
                    value={respuestas[c.nombre]}
                    onChange={(v) => actualizarRespuesta(c.nombre, v)}
                    opcionesTipoIdentificacion={getOptions('tipo_identificacion') || []}
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
                    {cambioTitularMarcado && camposTitularDependientes.filter((c) => esVisible(c, respuestas, idToNombreMap)).map((c) => (
                      <CampoDinamicoInput
                        key={c.nombre}
                        campo={c}
                        value={respuestas[c.nombre]}
                        onChange={(v) => actualizarRespuesta(c.nombre, v)}
                        opcionesTipoIdentificacion={getOptions('tipo_identificacion') || []}
                      />
                    ))}
                  </>
                )}
              </Stack>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 2, gap: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
