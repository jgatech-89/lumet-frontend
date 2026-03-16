import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
} from '@mui/material';
import { CloseIcon, CheckIcon, AddIcon } from '../../utils/icons';
import { modalPaperSx } from '../shared/ConfirmDeleteDialog';
import { crearRelacion, listarRelaciones, eliminarRelacion } from '../../app/configuracion/logic/apiRelaciones';
import { listarServicios } from '../../app/empresa/logic/apiEmpresa';
import { listarContratistas } from '../../app/servicios/logic/apiServicios';
import { listarProductos } from '../../app/producto/logic/apiProducto';
import { listarCampos } from '../../app/campos/logic/apiCampos';
import { listarVendedores } from '../../app/vendedores/logic/apiVendedores';
import { getErrorMessage } from '../../utils/funciones';
import { LoadingButton } from '../loading';

const TIPO_DESTINO_OPTIONS = [
  { value: 'servicio', label: 'Servicio' },
  { value: 'contratista', label: 'Contratista' },
  { value: 'producto', label: 'Producto' },
  { value: 'campo', label: 'Campo' },
  { value: 'vendedor', label: 'Vendedor' },
];

/**
 * Obtiene la lista de entidades por tipo (GET /api/{tipo}/).
 * @param {string} tipo - servicio | contratista | producto | campo | vendedor
 * @returns {Promise<Array<{ id: number, label: string }>>}
 */
async function listarEntidadesPorTipo(tipo) {
  const pageSize = 500;
  if (tipo === 'servicio') {
    const { results } = await listarServicios(1, pageSize, {});
    return (results ?? []).map((r) => ({ id: r.id, label: r.nombre ?? '' }));
  }
  if (tipo === 'contratista') {
    const { results } = await listarContratistas(1, pageSize, {});
    return (results ?? []).map((r) => ({ id: r.id, label: r.nombre ?? '' }));
  }
  if (tipo === 'producto') {
    const { results } = await listarProductos(1, pageSize, {});
    return (results ?? []).map((r) => ({ id: r.id, label: r.nombre ?? '' }));
  }
  if (tipo === 'campo') {
    const { results } = await listarCampos(1, pageSize, {});
    return (results ?? []).map((r) => ({ id: r.id, label: r.campo ?? r.nombre ?? '' }));
  }
  if (tipo === 'vendedor') {
    const { results } = await listarVendedores(1, pageSize, {});
    return (results ?? []).map((r) => ({ id: r.id, label: r.nombre ?? '' }));
  }
  return [];
}

const btnCancelSx = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  borderColor: 'rgba(0,0,0,0.12)',
  color: 'text.primary',
};

// ——— ItemRelacion: una fila (registro + estado + acción) ———
function ItemRelacion({
  registro,
  relacion,
  onRelacionar,
  onQuitar,
  addingDestinoId,
  removingRelacionId,
}) {
  const isRelated = Boolean(relacion);
  const isLoadingAdd = addingDestinoId === registro.id;
  const isLoadingRemove = relacion && removingRelacionId === relacion.id;
  const disabled = isLoadingAdd || isLoadingRemove;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: isRelated ? 'action.selected' : 'transparent',
        '&:not(:last-child)': { mb: 1 },
      }}
    >
      <Typography variant="body1" fontWeight={500} sx={{ flex: 1, minWidth: 0 }}>
        {registro.label || `ID ${registro.id}`}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {isRelated ? (
          <>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'success.main' }}>
              <CheckIcon size={20} />
              <Typography variant="body2" color="success.main" fontWeight={500}>
                Relacionado
              </Typography>
            </Stack>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onQuitar(relacion)}
              disabled={disabled}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {isLoadingRemove ? 'Quitando...' : 'Quitar relación'}
            </Button>
          </>
        ) : (
          <LoadingButton
            size="small"
            variant="contained"
            onClick={() => onRelacionar(registro)}
            disabled={disabled}
            loading={isLoadingAdd}
            loadingText=""
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Relacionar
          </LoadingButton>
        )}
      </Stack>
    </Box>
  );
}

// ——— ListaRelaciones: lista de registros con estado de relación ———
function ListaRelaciones({
  registros,
  relaciones,
  onRelacionar,
  onQuitar,
  addingDestinoId,
  removingRelacionId,
  loading,
}) {
  const getRelacionByDestinoId = (destinoId) =>
    relaciones.find((r) => Number(r.destino_id) === Number(destinoId));

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Cargando registros...</Typography>
      </Box>
    );
  }

  if (!registros.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay registros de este tipo.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {registros.map((registro) => (
        <ItemRelacion
          key={registro.id}
          registro={registro}
          relacion={getRelacionByDestinoId(registro.id)}
          onRelacionar={onRelacionar}
          onQuitar={onQuitar}
          addingDestinoId={addingDestinoId}
          removingRelacionId={removingRelacionId}
        />
      ))}
    </Box>
  );
}

/**
 * Modal gestor de relaciones: ver, agregar y quitar relaciones con un tipo de destino.
 * Props: open, onClose, origen_tipo, origen_id, nombre_entidad
 */
export function RelacionModal({
  open,
  onClose,
  origen_tipo,
  origen_id,
  nombre_entidad,
}) {
  const [destinoTipo, setDestinoTipo] = useState('');
  const [registros, setRegistros] = useState([]);
  const [relaciones, setRelaciones] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [loadingRelaciones, setLoadingRelaciones] = useState(false);
  const [error, setError] = useState('');
  const [addingDestinoId, setAddingDestinoId] = useState(null);
  const [removingRelacionId, setRemovingRelacionId] = useState(null);

  const loading = loadingRegistros || loadingRelaciones;

  const cargarDatos = useCallback(async () => {
    if (!destinoTipo || origen_tipo == null || origen_id == null) {
      setRegistros([]);
      setRelaciones([]);
      return;
    }
    setLoadingRegistros(true);
    setLoadingRelaciones(true);
    setError('');
    try {
      const [listaRegistros, listaRelaciones] = await Promise.all([
        listarEntidadesPorTipo(destinoTipo),
        listarRelaciones({
          origen_tipo,
          origen_id: Number(origen_id),
          destino_tipo: destinoTipo,
        }),
      ]);
      setRegistros(listaRegistros);
      setRelaciones(Array.isArray(listaRelaciones) ? listaRelaciones : []);
    } catch (err) {
      setError(getErrorMessage(err, null, null, 'Error al cargar los datos'));
      setRegistros([]);
      setRelaciones([]);
    } finally {
      setLoadingRegistros(false);
      setLoadingRelaciones(false);
    }
  }, [destinoTipo, origen_tipo, origen_id]);

  useEffect(() => {
    if (!open) return;
    setDestinoTipo('');
    setRegistros([]);
    setRelaciones([]);
    setError('');
    setAddingDestinoId(null);
    setRemovingRelacionId(null);
  }, [open]);

  useEffect(() => {
    if (open && destinoTipo && origen_tipo != null && origen_id != null) {
      cargarDatos();
    } else if (!destinoTipo) {
      setRegistros([]);
      setRelaciones([]);
    }
  }, [open, destinoTipo, origen_tipo, origen_id, cargarDatos]);

  const handleRelacionar = async (registro) => {
    if (!origen_tipo || origen_id == null || !destinoTipo) return;
    setAddingDestinoId(registro.id);
    setError('');
    try {
      const creada = await crearRelacion({
        origen_tipo,
        origen_id: Number(origen_id),
        destino_tipo: destinoTipo,
        destino_id: Number(registro.id),
      });
      setRelaciones((prev) => [...prev, creada].filter(Boolean));
    } catch (err) {
      setError(getErrorMessage(err, null, null, 'Error al crear la relación'));
    } finally {
      setAddingDestinoId(null);
    }
  };

  const handleQuitar = async (relacion) => {
    if (!relacion?.id) return;
    setRemovingRelacionId(relacion.id);
    setError('');
    try {
      await eliminarRelacion(relacion.id);
      setRelaciones((prev) => prev.filter((r) => r.id !== relacion.id));
    } catch (err) {
      setError(getErrorMessage(err, null, null, 'Error al quitar la relación'));
    } finally {
      setRemovingRelacionId(null);
    }
  };

  const handleClose = () => {
    setDestinoTipo('');
    setRegistros([]);
    setRelaciones([]);
    setError('');
    setAddingDestinoId(null);
    setRemovingRelacionId(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          ...modalPaperSx,
          maxWidth: 800,
          width: '100%',
          minHeight: 400,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={600}>
          Relacionar {nombre_entidad}
        </Typography>
        <IconButton size="small" onClick={handleClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Elige el tipo de entidad destino. Verás qué registros ya están relacionados y podrás agregar o quitar relaciones.
        </Typography>

        <FormControl fullWidth size="small" sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
          <InputLabel id="relacion-tipo-destino-label">Tipo de destino</InputLabel>
          <Select
            labelId="relacion-tipo-destino-label"
            value={destinoTipo}
            label="Tipo de destino"
            onChange={(e) => setDestinoTipo(e.target.value)}
          >
            {TIPO_DESTINO_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {destinoTipo && (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 0.5 }}>
              Registros
            </Typography>
            <ListaRelaciones
              registros={registros}
              relaciones={relaciones}
              onRelacionar={handleRelacionar}
              onQuitar={handleQuitar}
              addingDestinoId={addingDestinoId}
              removingRelacionId={removingRelacionId}
              loading={loading}
            />
          </>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={handleClose} sx={btnCancelSx}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
