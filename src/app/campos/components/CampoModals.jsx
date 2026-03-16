import { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { ConfirmDeleteDialog } from '../../../components/shared/ConfirmDeleteDialog';
import * as apiCampos from '../logic/apiCampos';
import { listarServiciosActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarContratistas } from '../../servicios/logic/apiServicios';
import { listarProductos } from '../../producto/logic/apiProducto';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';

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

const OPERADORES_VISIBLE_SI = [
  { value: 'igual', label: 'igual' },
  { value: 'diferente', label: 'diferente' },
  { value: 'contiene', label: 'contiene' },
  { value: 'mayor', label: 'mayor' },
  { value: 'menor', label: 'menor' },
];

function CondicionVisibilidadUI({ visible_si, setVisible_si, inputSx, formControlSx, selectMenuProps }) {
  const [listaCampos, setListaCampos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [opcionesEntidad, setOpcionesEntidad] = useState([]);
  const [loadingOpciones, setLoadingOpciones] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingLista(true);
    apiCampos.listarCamposParaCondicionVisibleSi()
      .then((list) => { if (!cancelled) setListaCampos(list || []); })
      .catch(() => { if (!cancelled) setListaCampos([]); })
      .finally(() => { if (!cancelled) setLoadingLista(false); });
    return () => { cancelled = true; };
  }, []);

  // Resolver legacy: si visible_si tiene "campo" (nombre) pero no campo_id, buscar en la lista
  useEffect(() => {
    if (!listaCampos.length || !visible_si || visible_si.campo_id != null) return;
    const nombre = visible_si.campo;
    if (!nombre || typeof nombre !== 'string') return;
    const found = listaCampos.find((c) => (c.nombre || '').trim().toLowerCase() === String(nombre).trim().toLowerCase());
    if (found) {
      setVisible_si({ campo_id: found.id, operador: visible_si.operador || 'igual', valor: visible_si.valor ?? '' });
    }
  }, [listaCampos, visible_si, setVisible_si]);

  const selectedCampo = useMemo(() => {
    if (!visible_si?.campo_id && !visible_si?.campo) return null;
    if (visible_si.campo_id) return listaCampos.find((c) => c.id === visible_si.campo_id) ?? null;
    return listaCampos.find((c) => (c.nombre || '').trim().toLowerCase() === String(visible_si.campo || '').trim().toLowerCase()) ?? null;
  }, [listaCampos, visible_si?.campo_id, visible_si?.campo]);

  useEffect(() => {
    if (!selectedCampo || selectedCampo.tipo !== 'entity_select' || !selectedCampo.entidad) {
      setOpcionesEntidad([]);
      return;
    }
    let cancelled = false;
    setLoadingOpciones(true);
    const ent = (selectedCampo.entidad || '').toLowerCase().trim();
    const prom =
      ent === 'servicio' ? listarServiciosActivasParaSelect()
        : ent === 'contratista' ? listarContratistas(1, 500, { estado: '1' }).then((r) => (r.results || []).map((c) => ({ id: c.id, nombre: c.nombre ?? '' })))
        : ent === 'producto' ? listarProductos(1, 500, { estado: '1' }).then((r) => (r.results || []).map((c) => ({ id: c.id, nombre: c.nombre ?? '' })))
        : ent === 'vendedor' ? listarVendedores(1, 500, { estado: '1' }).then((r) => (r.results || []).map((v) => ({ id: v.id, nombre: v.nombre ?? v.nombre_completo ?? '' })))
        : Promise.resolve([]);
    prom
      .then((arr) => {
        if (cancelled) return;
        setOpcionesEntidad(Array.isArray(arr) ? arr.map((o) => ({ value: String(o.id ?? o.value ?? ''), label: o.nombre ?? o.label ?? '' })) : []);
      })
      .catch(() => { if (!cancelled) setOpcionesEntidad([]); })
      .finally(() => { if (!cancelled) setLoadingOpciones(false); });
    return () => { cancelled = true; };
  }, [selectedCampo?.id, selectedCampo?.tipo, selectedCampo?.entidad]);

  const valorControl = useMemo(() => {
    if (!selectedCampo) return null;
    if (selectedCampo.tipo === 'select' && Array.isArray(selectedCampo.opciones) && selectedCampo.opciones.length > 0) {
      return (
        <FormControl size="small" sx={{ minWidth: 180, ...formControlSx }}>
          <InputLabel id="visible-si-valor-select-label">Valor</InputLabel>
          <Select
            labelId="visible-si-valor-select-label"
            label="Valor"
            value={visible_si?.valor ?? ''}
            onChange={(e) => setVisible_si((prev) => (prev ? { ...prev, valor: e.target.value } : null))}
            MenuProps={selectMenuProps}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">Seleccionar</MenuItem>
            {selectedCampo.opciones.map((opt) => (
              <MenuItem key={String(opt.value ?? opt.label)} value={opt.value ?? opt.label ?? ''}>
                {opt.label ?? opt.value ?? ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    if (selectedCampo.tipo === 'entity_select' && selectedCampo.entidad) {
      return (
        <FormControl size="small" sx={{ minWidth: 180, ...formControlSx }} disabled={loadingOpciones}>
          <InputLabel id="visible-si-valor-entity-label">Valor</InputLabel>
          <Select
            labelId="visible-si-valor-entity-label"
            label="Valor"
            value={visible_si?.valor ?? ''}
            onChange={(e) => setVisible_si((prev) => (prev ? { ...prev, valor: e.target.value } : null))}
            MenuProps={selectMenuProps}
            sx={{ borderRadius: 2 }}
            endAdornment={loadingOpciones ? <CircularProgress size={20} sx={{ position: 'absolute', right: 32 }} /> : null}
          >
            <MenuItem value="">Seleccionar</MenuItem>
            {opcionesEntidad.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return (
      <TextField
        size="small"
        label="Valor"
        placeholder="Valor esperado"
        value={visible_si?.valor ?? ''}
        onChange={(e) => setVisible_si((prev) => (prev ? { ...prev, valor: e.target.value } : null))}
        sx={{ ...inputSx, minWidth: 180 }}
      />
    );
  }, [selectedCampo, visible_si?.valor, opcionesEntidad, loadingOpciones, setVisible_si, formControlSx, inputSx, selectMenuProps]);

  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Condición de visibilidad
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Mostrar este campo cuando se cumpla la siguiente condición. Use &quot;Sin condición&quot; para mostrarlo siempre.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }} flexWrap="wrap" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 200, ...formControlSx }} disabled={loadingLista}>
          <InputLabel id="visible-si-campo-label">Campo dependiente</InputLabel>
          <Select
            labelId="visible-si-campo-label"
            label="Campo dependiente"
            value={visible_si?.campo_id ?? ''}
            onChange={(e) => {
              const id = e.target.value === '' ? null : Number(e.target.value);
              setVisible_si(id ? { campo_id: id, operador: visible_si?.operador || 'igual', valor: '' } : null);
            }}
            MenuProps={selectMenuProps}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">Ninguno (siempre visible)</MenuItem>
            {listaCampos.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.nombre || `Campo ${c.id}`}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120, ...formControlSx }} disabled={!visible_si?.campo_id}>
          <InputLabel id="visible-si-operador-label">Operador</InputLabel>
          <Select
            labelId="visible-si-operador-label"
            label="Operador"
            value={visible_si?.operador ?? 'igual'}
            onChange={(e) => setVisible_si((prev) => prev ? { ...prev, operador: e.target.value } : null)}
            MenuProps={selectMenuProps}
            sx={{ borderRadius: 2 }}
          >
            {OPERADORES_VISIBLE_SI.map((op) => (
              <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {valorControl}
        <Button size="small" variant="outlined" onClick={() => setVisible_si(null)} sx={{ textTransform: 'none' }}>
          Sin condición
        </Button>
      </Stack>
    </>
  );
}

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
  entidad = '',
  setEntidad = () => {},
  entidadOptions = [],
  seccion,
  setSeccion,
  depende_de_id = '',
  setDepende_de_id = () => {},
  camposMismaSeccion = [],
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
      {/* Sección: definición del campo (nombre, tipo y opciones) */}
      <Box>
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
          {tipoCampo === 'entity_select' && (
            <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
              <FormControl size="small" fullWidth required error={!!errors?.entidad} sx={formControlSx}>
                <InputLabel id="campo-entidad-label" shrink>Entidad</InputLabel>
                <Select
                  labelId="campo-entidad-label"
                  value={entidad ?? ''}
                  label="Entidad"
                  onChange={(e) => setEntidad(e.target.value)}
                  displayEmpty
                  renderValue={(v) => {
                    if (!v) return 'Seleccionar';
                    const opt = (entidadOptions ?? []).find((e) => e.value === v);
                    return opt?.label ?? v;
                  }}
                  MenuProps={selectMenuProps}
                  sx={{ width: '100%' }}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  {(entidadOptions ?? []).map((e) => (
                    <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                  ))}
                </Select>
                {errors?.entidad && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.entidad}</Typography>}
              </FormControl>
            </Box>
          )}
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
      {/* Depende de: campo padre (misma sección). Evitar ciclos y auto-referencia. */}
      {seccion && camposMismaSeccion?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <FormControl size="small" fullWidth error={!!errors?.depende_de_id} sx={formControlSx}>
            <InputLabel id="campo-depende-de-label" shrink>Depende de</InputLabel>
            <Select
              labelId="campo-depende-de-label"
              value={depende_de_id ?? ''}
              label="Depende de"
              onChange={(e) => setDepende_de_id(e.target.value)}
              displayEmpty
              renderValue={(v) => {
                if (!v) return 'Ninguno';
                const c = (camposMismaSeccion || []).find((f) => String(f.id) === String(v));
                return c ? (c.nombre ?? c.campo ?? String(v)) : v;
              }}
              MenuProps={selectMenuProps}
              sx={{ width: '100%' }}
            >
              <MenuItem value="">Ninguno</MenuItem>
              {(camposMismaSeccion || []).map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>{c.nombre ?? c.campo ?? c.id}</MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Si elige un campo, este quedará deshabilitado hasta que el usuario seleccione un valor en el campo padre (ej. Contratista depende de Servicio).
            </Typography>
            {errors?.depende_de_id && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.depende_de_id}</Typography>}
          </FormControl>
        </Box>
      )}
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
        <Box sx={{ gridColumn: '1 / -1' }}>
          <CondicionVisibilidadUI
            visible_si={visible_si}
            setVisible_si={setVisible_si}
            inputSx={inputSx}
            formControlSx={formControlSx}
            selectMenuProps={selectMenuProps}
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
    </>
  );
}
