import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { LoadingButton } from '../../../components/loading';
import * as apiCliente from '../logic/apiCliente';
import { getErrorMessage } from '../../../utils/funciones';
import { useSnackbar } from '../../../context/SnackbarContext';

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

function textoErrorImportacion(item) {
  if (item?.texto) return item.texto;
  const fila = item?.fila != null ? item.fila : '—';
  const col = item?.columna ?? '—';
  const msg = item?.mensaje ?? '';
  return `Error en la fila ${fila}, columna "${col}": ${msg}`;
}

export function ImportarClientesModal({ open, onClose, onExito }) {
  const [archivo, setArchivo] = useState(null);
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false);
  const [importando, setImportando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState([]);
  const [modalErroresAbierto, setModalErroresAbierto] = useState(false);

  const { showSnackbar } = useSnackbar();

  const handleDescargarPlantilla = async () => {
    setDescargandoPlantilla(true);
    try {
      const blob = await apiCliente.descargarPlantillaClientes();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_importar_clientes.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      showSnackbar('Plantilla descargada correctamente.', 'success');
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al descargar plantilla'), 'error');
    } finally {
      setDescargandoPlantilla(false);
    }
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files?.[0];
    setArchivo(file || null);
  };

  const cerrarModalErrores = () => {
    setModalErroresAbierto(false);
    setErroresValidacion([]);
  };

  const handleImportar = async () => {
    if (!archivo) {
      showSnackbar('Seleccione el archivo Excel.', 'error');
      return;
    }
    setImportando(true);
    try {
      const data = await apiCliente.importarExcelClientes(archivo);

      if (data.success === false && Array.isArray(data.errors) && data.errors.length > 0) {
        setErroresValidacion(data.errors);
        setModalErroresAbierto(true);
        showSnackbar('El archivo contiene errores. Revise el listado.', 'error');
        return;
      }

      if (!data.ok) {
        const msg = data.errores?.[0] || data.error || 'Error al importar';
        showSnackbar(msg, 'error');
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          setErroresValidacion(data.errors);
          setModalErroresAbierto(true);
        }
        return;
      }

      if (data.success === true) {
        showSnackbar(data.mensaje || `Se importaron ${data.creados ?? 0} cliente(s).`, 'success');
        onExito?.();
        onClose();
        setArchivo(null);
      }
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al importar'), 'error');
    } finally {
      setImportando(false);
    }
  };

  const handleCerrar = () => {
    setArchivo(null);
    cerrarModalErrores();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleCerrar} PaperProps={{ sx: { ...modalPaperSx, maxWidth: 480 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Importar clientes</Typography>
          <IconButton size="small" onClick={handleCerrar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Importe varios clientes desde un archivo Excel. Descargue la plantilla, complétela y luego suba el archivo.
            Si hay algún error en el archivo, no se importará ningún registro hasta corregirlo.
          </Typography>

          <Stack spacing={2.5}>
            <Box>
              <LoadingButton
                variant="outlined"
                size="small"
                startIcon={!descargandoPlantilla ? <DownloadIcon /> : null}
                onClick={handleDescargarPlantilla}
                loading={descargandoPlantilla}
                loadingText="Descargando..."
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Descargar plantilla
              </LoadingButton>
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<UploadIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {archivo ? archivo.name : 'Seleccionar archivo Excel'}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleArchivoChange}
                />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 2, gap: 2 }}>
          <Button variant="outlined" onClick={handleCerrar} disabled={importando}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleImportar}
            disabled={!archivo}
            loading={importando}
            loadingText="Importando..."
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Importar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modalErroresAbierto}
        onClose={cerrarModalErrores}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            ...modalPaperSx,
            width: 'min(96vw, 1100px)',
            maxWidth: 'min(96vw, 1100px)',
            maxHeight: 'min(92vh, 900px)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, flexShrink: 0, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={600}>Errores en el archivo</Typography>
            {erroresValidacion.length > 0 && (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                ({erroresValidacion.length} {erroresValidacion.length === 1 ? 'error' : 'errores'})
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={cerrarModalErrores} aria-label="Cerrar" sx={{ flexShrink: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            maxHeight: 'min(78vh, 720px)',
            overflow: 'auto',
            px: { xs: 2, sm: 3 },
            py: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Corrija los siguientes problemas en el Excel y vuelva a importar. No se ha guardado ningún cliente.
            Puede desplazarse por la lista si hay muchos errores.
          </Typography>
          <List dense disablePadding>
            {erroresValidacion.map((item, idx) => (
              <ListItem key={idx} alignItems="flex-start" sx={{ py: 0.75, px: 0 }}>
                <ListItemText
                  primary={textoErrorImportacion(item)}
                  primaryTypographyProps={{ variant: 'body2', component: 'p', sx: { lineHeight: 1.5 } }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button variant="contained" onClick={cerrarModalErrores} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
