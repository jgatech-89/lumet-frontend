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
  Paper,
  CircularProgress,
} from '@mui/material';
import { CloseIcon } from '../../../utils/icons';
import { modalPaperSx } from '../../../components/shared/ConfirmDeleteDialog';
import { LoadingButton } from '../../../components/loading';
import * as apiCliente from '../logic/apiCliente';
import { getErrorMessage } from '../../../utils/funciones';
import { useSnackbar } from '../../../context/SnackbarContext';
import { useThemeMode } from '../../../context/ThemeContext';

const importModalPaperSx = {
  ...modalPaperSx,
  maxWidth: 720,
  width: '100%',
};

const miniCardSx = (isDark, { interactive = true, active = false } = {}) => ({
  p: 2.5,
  borderRadius: 3,
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  bgcolor: active
    ? (isDark ? 'rgba(33, 150, 243, 0.12)' : '#e8f4fd')
    : 'background.paper',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 1.25,
  minHeight: 148,
  justifyContent: 'center',
  transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s, transform 0.15s',
  ...(interactive && {
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: isDark ? 'rgba(33, 150, 243, 0.08)' : '#f0f8ff',
      boxShadow: '0 4px 16px rgba(33, 150, 243, 0.12)',
      transform: 'translateY(-2px)',
    },
  }),
});

const iconWrapSx = (isDark) => ({
  width: 52,
  height: 52,
  borderRadius: 2.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: isDark ? 'rgba(33, 150, 243, 0.18)' : '#d3eafd',
  color: 'primary.main',
  flexShrink: 0,
});

const CupsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 9.54 12 8c1.16-1.16 2.5-2.32 2.5-4.5 0-.83-.67-1.5-1.5-1.5S11.5 2.67 11.5 3.5c0 .17.03.33.08.48C9.83 5.36 8 7.92 8 11H4.5c-.83 0-1.5.67-1.5 1.5S3.67 14 4.5 14H7l-1 7H4v2h16v-2h-3l-1-7h2.5c.83 0 1.5-.67 1.5-1.5S20.33 11 19.5 11H16c0-3.08-1.83-5.64-4.58-7.02.05-.15.08-.31.08-.48 0-.83-.67-1.5-1.5-1.5S8 2.67 8 3.5C8 5.68 9.34 6.84 10.5 8c-1.58 1.54-3.52 2.94-4.9 4.22-.02.04-.17.22-.07.12.19.34.2.66-.38.66H11l1 7z" />
  </svg>
);

const TelefoniaIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

const OngIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

const ArrowBackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

function textoErrorImportacion(item) {
  if (item?.texto) return item.texto;
  const fila = item?.fila != null ? item.fila : '—';
  const col = item?.columna ?? '—';
  const msg = item?.mensaje ?? '';
  return `Error en la fila ${fila}, columna "${col}": ${msg}`;
}

const TIPOS_IMPORTACION = [
  {
    id: 'cups',
    titulo: 'CUPS',
    subtitulo: 'Cargue masivo de CUPS',
    descripcion: 'Importe clientes con servicio de luz, gas o luz y gas.',
    Icon: CupsIcon,
  },
  {
    id: 'telefonia',
    titulo: 'Telefonía',
    subtitulo: 'Cargue masivo de telefonía',
    descripcion: 'Importe clientes con servicios de telefonía.',
    Icon: TelefoniaIcon,
  },
  {
    id: 'ong',
    titulo: 'ONG',
    subtitulo: 'Cargue masivo de ONG',
    descripcion: 'Importe clientes de organizaciones no gubernamentales.',
    Icon: OngIcon,
  },
];

export function ImportarClientesModal({ open, onClose, onExito }) {
  const [tipoImportacion, setTipoImportacion] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false);
  const [importando, setImportando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState([]);
  const [modalErroresAbierto, setModalErroresAbierto] = useState(false);
  const [resumenImportacion, setResumenImportacion] = useState(null);
  const [modalResumenAbierto, setModalResumenAbierto] = useState(false);

  const tipoSeleccionado = TIPOS_IMPORTACION.find((t) => t.id === tipoImportacion);
  const SelectedTypeIcon = tipoSeleccionado?.Icon ?? null;

  const { showSnackbar } = useSnackbar();
  const { isDark } = useThemeMode();

  const handleDescargarPlantilla = async () => {
    if (!tipoImportacion) return;
    setDescargandoPlantilla(true);
    try {
      const blob = await apiCliente.descargarPlantillaClientes(tipoImportacion);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tipoImportacion === 'telefonia'
        ? 'plantilla_importar_telefonia.xlsx'
        : tipoImportacion === 'ong'
          ? 'plantilla_importar_ong.xlsx'
          : 'importarmasivo_cups.xlsx';
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

  const cerrarModalResumen = () => {
    setModalResumenAbierto(false);
    setResumenImportacion(null);
    onExito?.();
    setTipoImportacion(null);
    setArchivo(null);
    onClose();
  };

  const handleImportar = async () => {
    if (!archivo) {
      showSnackbar('Seleccione el archivo Excel.', 'error');
      return;
    }
    setImportando(true);
    try {
      const data = await apiCliente.importarExcelClientes(archivo, tipoImportacion);

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
        const resumen = data.resumen ?? {
          clientes_nuevos_creados: data.creados ?? 0,
          cups_nuevos_asociados: data.creados ?? 0,
          clientes_ya_existentes_encontrados: 0,
          relaciones_cliente_cups_ya_existentes: 0,
          total_filas_procesadas: data.creados ?? 0,
        };
        setResumenImportacion(resumen);
        setModalResumenAbierto(true);
      }
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al importar'), 'error');
    } finally {
      setImportando(false);
    }
  };

  const handleCerrar = () => {
    setTipoImportacion(null);
    setArchivo(null);
    cerrarModalErrores();
    setModalResumenAbierto(false);
    setResumenImportacion(null);
    onClose();
  };

  const handleVolverTipos = () => {
    setTipoImportacion(null);
    setArchivo(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCerrar}
        PaperProps={{ sx: importModalPaperSx }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, px: 3, pt: 2.5 }}>
          <Typography variant="h6" fontWeight={600}>Importar clientes</Typography>
          <IconButton size="small" onClick={handleCerrar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            Importe varios clientes desde un archivo Excel. Descargue la plantilla, complétela y luego suba el archivo.
            Si hay algún error en el archivo, no se importará ningún registro hasta corregirlo.
          </Typography>

          {!tipoImportacion ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {TIPOS_IMPORTACION.map((tipo) => (
                <Paper
                  key={tipo.id}
                  elevation={0}
                  onClick={() => setTipoImportacion(tipo.id)}
                  sx={miniCardSx(isDark)}
                >
                  <Box sx={iconWrapSx(isDark)}>
                    <tipo.Icon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.3 }}>
                      {tipo.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.25 }}>
                      {tipo.subtitulo}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45, px: 0.5 }}>
                    {tipo.descripcion}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Stack spacing={3}>
              <Box
                onClick={handleVolverTipos}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleVolverTipos(); }}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: 'primary.main',
                  cursor: importando || descargandoPlantilla ? 'default' : 'pointer',
                  opacity: importando || descargandoPlantilla ? 0.5 : 1,
                  pointerEvents: importando || descargandoPlantilla ? 'none' : 'auto',
                  width: 'fit-content',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <ArrowBackIcon />
                Cambiar tipo de cargue
              </Box>

              <Paper
                elevation={0}
                sx={{
                  ...miniCardSx(isDark, { interactive: false, active: true }),
                  flexDirection: 'row',
                  textAlign: 'left',
                  minHeight: 'auto',
                  py: 2,
                  px: 2.5,
                  gap: 2,
                  justifyContent: 'flex-start',
                }}
              >
                <Box sx={iconWrapSx(isDark)}>
                  {SelectedTypeIcon && <SelectedTypeIcon />}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {tipoSeleccionado?.subtitulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {tipoSeleccionado?.descripcion}
                  </Typography>
                </Box>
              </Paper>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <Paper
                  elevation={0}
                  onClick={descargandoPlantilla ? undefined : handleDescargarPlantilla}
                  sx={{
                    ...miniCardSx(isDark, { interactive: !descargandoPlantilla }),
                    minHeight: 132,
                    opacity: descargandoPlantilla ? 0.85 : 1,
                  }}
                >
                  <Box sx={iconWrapSx(isDark)}>
                    {descargandoPlantilla ? (
                      <CircularProgress size={24} color="primary" />
                    ) : (
                      <DownloadIcon />
                    )}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Descargar plantilla
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                    {descargandoPlantilla ? 'Descargando...' : 'Obtenga el formato Excel para completar los datos.'}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  component="label"
                  sx={{
                    ...miniCardSx(isDark, { active: !!archivo }),
                    minHeight: 132,
                    m: 0,
                  }}
                >
                  <Box sx={iconWrapSx(isDark)}>
                    <UploadIcon />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {archivo ? 'Archivo seleccionado' : 'Cargar plantilla'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={archivo ? 'primary.main' : 'text.secondary'}
                    sx={{ lineHeight: 1.45, wordBreak: 'break-word' }}
                  >
                    {archivo ? archivo.name : 'Seleccione el archivo Excel completado.'}
                  </Typography>
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={handleArchivoChange}
                  />
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        {tipoImportacion && (
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 2 }}>
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
        )}
      </Dialog>

      <Dialog
        open={modalResumenAbierto}
        onClose={cerrarModalResumen}
        PaperProps={{ sx: { ...modalPaperSx, maxWidth: 480, width: '100%' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, px: 3, pt: 2.5 }}>
          <Typography variant="h6" fontWeight={600}>Importación completada</Typography>
          <IconButton size="small" onClick={cerrarModalResumen} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            El cargue masivo se procesó correctamente. Resumen de resultados:
          </Typography>
          {resumenImportacion && (
            <Stack spacing={1.5}>
              {(tipoImportacion === 'telefonia'
                ? [
                    { label: 'Clientes nuevos creados', value: resumenImportacion.clientes_nuevos_creados },
                    { label: 'Productos de telefonía asociados', value: resumenImportacion.productos_nuevos_asociados ?? resumenImportacion.cups_nuevos_asociados },
                    { label: 'Clientes ya existentes encontrados', value: resumenImportacion.clientes_ya_existentes_encontrados },
                    { label: 'Productos ya existentes en base de datos', value: resumenImportacion.relaciones_cliente_producto_ya_existentes ?? resumenImportacion.relaciones_cliente_cups_ya_existentes },
                    { label: 'Total filas procesadas', value: resumenImportacion.total_filas_procesadas },
                  ]
                : tipoImportacion === 'ong'
                  ? [
                      { label: 'Clientes nuevos creados', value: resumenImportacion.clientes_nuevos_creados },
                      { label: 'Registros ONG asociados', value: resumenImportacion.productos_nuevos_asociados ?? resumenImportacion.cups_nuevos_asociados },
                      { label: 'Clientes ya existentes encontrados', value: resumenImportacion.clientes_ya_existentes_encontrados },
                      { label: 'Registros ONG ya existentes', value: resumenImportacion.relaciones_cliente_producto_ya_existentes ?? resumenImportacion.relaciones_cliente_cups_ya_existentes },
                      { label: 'Total filas procesadas', value: resumenImportacion.total_filas_procesadas },
                    ]
                  : [
                    { label: 'Clientes nuevos creados', value: resumenImportacion.clientes_nuevos_creados },
                    { label: 'CUPS nuevos asociados', value: resumenImportacion.cups_nuevos_asociados },
                    { label: 'Clientes ya existentes encontrados', value: resumenImportacion.clientes_ya_existentes_encontrados },
                    { label: 'CUPS ya existente en base de datos', value: resumenImportacion.relaciones_cliente_cups_ya_existentes },
                    { label: 'Total filas procesadas', value: resumenImportacion.total_filas_procesadas },
                  ]
              ).map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    py: 1.25,
                    px: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                    {item.value ?? 0}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            variant="contained"
            onClick={cerrarModalResumen}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Entendido
          </Button>
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
