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
  CircularProgress,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import * as apiCliente from '../logic/apiCliente';
import * as apiCampos from '../../campos/logic/apiCampos';

const NOMBRES_PRODUCTO_CAMPO = ['producto', 'Producto'];
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
const esCampoProducto = (c) => NOMBRES_PRODUCTO_CAMPO.some((n) => norm(c.nombre) === norm(n));

function labelBase(nombre) {
  return (nombre || '').replace(/\s*\*+\s*$/g, '').trim();
}

function labelConAsterisco(nombre, requerido) {
  const base = labelBase(nombre);
  return requerido ? `${base} *` : base;
}

function CampoDinamicoInput({ campo, value, onChange }) {
  const { nombre, tipo, placeholder, help_text, requerido, opciones = [] } = campo;
  const id = `edit-campo-${nombre}`;
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
        helperText={help_text}
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
      helperText={help_text}
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
}) {
  const [nombre, setNombre] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [camposGlobales, setCamposGlobales] = useState([]);
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const [producto, setProducto] = useState('');
  const [opcionesProducto, setOpcionesProducto] = useState([]);

  useEffect(() => {
    if (!cliente || !open) return;
    setNombre(cliente.nombre || '');
    setTipoIdentificacion(cliente.tipo_identificacion || '');
    setNumeroIdentificacion(cliente.numero_identificacion || '');
    setTelefono(cliente.telefono || '');
    setCorreo(cliente.correo || '');
    setProducto(cliente.producto || '');
    const r = {};
    (cliente.respuestas || []).forEach((item) => {
      r[item.nombre_campo] = item.respuesta_campo ?? '';
    });
    if (cliente.estado_venta) r.estado_venta = cliente.estado_venta;
    setRespuestas(r);
  }, [cliente, open]);

  useEffect(() => {
    if (!cliente?.servicio_id || !open) return;
    let cancelled = false;
    apiCampos.obtenerOpcionesCampoPorNombre('producto')
      .then((list) => { if (!cancelled) setOpcionesProducto(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setOpcionesProducto([]); });
    return () => { cancelled = true; };
  }, [cliente?.servicio_id, open]);

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

  const camposFormularioSinProducto = camposFormulario.filter((c) => !esCampoProducto(c));

  const actualizarRespuesta = useCallback((nombreCampo, valor) => {
    setRespuestas((p) => ({ ...p, [nombreCampo]: valor }));
  }, []);

  const handleSubmit = () => {
    if (!nombre?.trim()) return;
    const respuestasList = [];
    camposFormularioSinProducto.forEach((c) => {
      const v = respuestas[c.nombre];
      if (v != null && String(v).trim() !== '') {
        respuestasList.push({ nombre_campo: c.nombre, respuesta_campo: String(v).trim() });
      }
    });
    camposGlobales.filter((c) => !esCampoProducto(c) && !camposFormulario.some((f) => f.nombre === c.nombre)).forEach((c) => {
      const v = respuestas[c.nombre];
      if (v != null && String(v).trim() !== '') {
        respuestasList.push({ nombre_campo: c.nombre, respuesta_campo: String(v).trim() });
      }
    });

    onGuardar({
      nombre: nombre.trim(),
      tipo_identificacion: tipoIdentificacion.trim() || '',
      numero_identificacion: numeroIdentificacion.trim() || '',
      telefono: telefono.trim() || '',
      correo: correo.trim() || '',
      respuestas: respuestasList,
    });
  };

  if (!cliente) return null;

  const inputSx = { width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { ...modalPaperSx, maxWidth: 560 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Editar cliente</Typography>
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
                <MenuItem value="CC">Cédula</MenuItem>
                <MenuItem value="CE">Cédula extranjería</MenuItem>
                <MenuItem value="NIT">NIT</MenuItem>
                <MenuItem value="PAS">Pasaporte</MenuItem>
                <MenuItem value="OTRO">Otro</MenuItem>
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
              label="Correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              sx={{ flex: 1, ...inputSx }}
            />
          </Stack>

          {(camposFormulario.length > 0 || camposGlobales.length > 0 || opcionesProducto?.length > 0) && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Campos del formulario</Typography>
              {opcionesProducto?.length > 0 && (
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
                    Seleccione el producto para ver solo los campos que aplican.
                  </Typography>
                </FormControl>
              )}
              {cargandoCampos ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Stack spacing={2}>
                  {camposFormularioSinProducto.map((c) => (
                    <CampoDinamicoInput
                      key={c.nombre}
                      campo={c}
                      value={respuestas[c.nombre]}
                      onChange={(v) => actualizarRespuesta(c.nombre, v)}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}

        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 2, gap: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!nombre?.trim() || guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
