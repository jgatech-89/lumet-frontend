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

export function ImportarClientesModal({ open, onClose, onExito }) {
  const [archivo, setArchivo] = useState(null);
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false);
  const [importando, setImportando] = useState(false);

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

  const handleImportar = async () => {
    if (!archivo) {
      showSnackbar('Seleccione el archivo Excel.', 'error');
      return;
    }
    setImportando(true);
    try {
      const data = await apiCliente.importarExcelClientes(archivo);
      showSnackbar(data.mensaje || `Se importaron ${data.creados} cliente(s).`, 'success');
      if (data.errores?.length > 0) {
        data.errores.slice(0, 5).forEach((err) => showSnackbar(err, 'warning'));
      }
      onExito?.();
      onClose();
      setArchivo(null);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al importar'), 'error');
    } finally {
      setImportando(false);
    }
  };

  const handleCerrar = () => {
    setArchivo(null);
    onClose();
  };

  return (
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
  );
}
