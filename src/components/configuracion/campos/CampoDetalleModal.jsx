import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
  CircularProgress,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../shared/ConfirmDeleteDialog';
import { listarRelaciones, obtenerNombreEntidad } from '../../../app/configuracion/logic/apiRelaciones';

const LABELS_TIPO = {
  servicio: 'Servicio',
  contratista: 'Contratista',
  producto: 'Producto',
  campo: 'Campo',
  vendedor: 'Vendedor',
};

const sectionTitleSx = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: 'text.secondary',
  mb: 1.5,
};

const detailPaperSx = {
  ...modalPaperSx,
  maxWidth: 800,
};

const btnCerrarSx = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
};

/**
 * Resuelve las relaciones (origen_tipo, origen_id) a { tipoLabel, nombre }.
 * GET /api/relaciones/?destino_tipo=campo&destino_id={campo_id}
 * y para cada relación GET /api/{origen_tipo}/{origen_id}/ para el nombre.
 */
async function cargarRelacionesConNombres(campoId) {
  const relaciones = await listarRelaciones({
    destino_tipo: 'campo',
    destino_id: campoId,
  });
  const conNombres = await Promise.all(
    relaciones.map(async (rel) => {
      const nombre = await obtenerNombreEntidad(rel.origen_tipo, rel.origen_id);
      return {
        tipo: rel.origen_tipo,
        tipoLabel: LABELS_TIPO[rel.origen_tipo] ?? rel.origen_tipo,
        nombre: nombre ?? `ID ${rel.origen_id}`,
      };
    })
  );
  return conNombres;
}

/**
 * Modal de solo lectura: información del campo y sus relaciones (entidades que lo tienen como destino).
 */
export function CampoDetalleModal({ open, onClose, campo, getTipoLabel, getSeccionLabel }) {
  const [loading, setLoading] = useState(false);
  const [relaciones, setRelaciones] = useState([]);
  const [errorRelaciones, setErrorRelaciones] = useState(null);

  const campoId = campo?.id;

  const cargar = useCallback(async () => {
    if (!campoId) {
      setRelaciones([]);
      return;
    }
    setLoading(true);
    setErrorRelaciones(null);
    try {
      const data = await cargarRelacionesConNombres(campoId);
      setRelaciones(data);
    } catch (e) {
      setErrorRelaciones('No se pudieron cargar las relaciones.');
      setRelaciones([]);
    } finally {
      setLoading(false);
    }
  }, [campoId]);

  useEffect(() => {
    if (open && campoId) cargar();
    if (!open) {
      setRelaciones([]);
      setErrorRelaciones(null);
    }
  }, [open, campoId, cargar]);

  if (!campo) return null;

  const tipoDisplay = getTipoLabel ? (getTipoLabel(campo.tipo) || campo.tipoCampo) : (campo.tipoCampo ?? campo.tipo);
  const seccionDisplay = getSeccionLabel ? (getSeccionLabel(campo.seccion) || campo.seccionLabel) : (campo.seccionLabel ?? campo.seccion);

  const detalles = [
    { label: 'Nombre del campo', value: campo.campo ?? campo.nombre ?? '—' },
    { label: 'Tipo de campo', value: tipoDisplay || '—' },
    { label: 'Sección', value: seccionDisplay || '—' },
    { label: 'Placeholder', value: campo.placeholder ?? '—' },
    { label: 'Orden', value: campo.orden ?? '—' },
    { label: 'Obligatorio', value: campo.requerido ? 'Sí' : 'No' },
    { label: 'Estado', value: campo.estado ?? '—' },
  ];

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: detailPaperSx }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Detalles del campo
        </Typography>
        <IconButton size="small" aria-label="Cerrar" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Sección 1: Información del campo */}
        <Typography sx={sectionTitleSx}>Información del campo</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '8px 24px',
            alignItems: 'baseline',
            mb: 3,
          }}
        >
          {detalles.map(({ label, value }) => (
            <Box key={label} sx={{ display: 'contents' }}>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Sección 2: Relaciones del campo */}
        <Typography sx={sectionTitleSx}>Relaciones del campo</Typography>
        {loading ? (
          <Stack direction="row" alignItems="center" spacing={1.5} py={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Cargando relaciones…
            </Typography>
          </Stack>
        ) : errorRelaciones ? (
          <Typography variant="body2" color="error" sx={{ py: 1 }}>
            {errorRelaciones}
          </Typography>
        ) : relaciones.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Este campo no tiene relaciones configuradas.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '6px 20px',
              alignItems: 'center',
            }}
          >
            {relaciones.map((rel, idx) => (
              <Box key={`${rel.tipo}-${rel.nombre}-${idx}`} sx={{ display: 'contents' }}>
                <Typography variant="body2" color="text.secondary">
                  {rel.tipoLabel}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {rel.nombre}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" onClick={onClose} sx={btnCerrarSx}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
