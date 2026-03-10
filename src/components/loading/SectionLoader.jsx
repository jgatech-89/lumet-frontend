import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Carga para una sección o componente (card, panel, etc.).
 * Ocupa el espacio con minHeight y muestra spinner + mensaje opcional.
 */
const SectionLoader = ({ message = 'Cargando...', minHeight = 200 }) => (
  <Box
    sx={{
      minHeight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      py: 4,
    }}
    aria-busy="true"
    aria-live="polite"
    role="status"
    aria-label={message}
  >
    <CircularProgress size={32} sx={{ color: 'primary.main' }} aria-hidden="true" />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

export default SectionLoader;
