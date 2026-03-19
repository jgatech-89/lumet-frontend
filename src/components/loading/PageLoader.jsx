import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Overlay de carga para toda la página.
 * Usar cuando una vista completa está cargando datos (ej. al restaurar sesión o al cargar una página que hace fetch inicial).
 */
const PageLoader = ({ message = 'Cargando...' }) => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      bgcolor: 'rgba(255, 255, 255, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      gap: 2,
    }}
    aria-busy="true"
    aria-live="polite"
    role="status"
    aria-label={message}
  >
    <CircularProgress size={40} sx={{ color: 'primary.main' }} aria-hidden="true" />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

export default PageLoader;
