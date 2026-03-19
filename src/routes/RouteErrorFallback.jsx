import { useRouteError, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

/**
 * Se muestra cuando falla la carga de una ruta (ej. lazy import) o hay error en el componente.
 */
const RouteErrorFallback = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const isChunkError =
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('dynamically imported module') ||
    error?.name === 'ChunkLoadError';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" component="h1" color="primary.dark" gutterBottom>
        Algo salió mal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 400 }}>
        {isChunkError
          ? 'No se pudo cargar la página. Comprueba tu conexión o recarga el sitio.'
          : error?.message || 'Ocurrió un error inesperado.'}
      </Typography>
      <Button
        variant="contained"
        onClick={() => (isChunkError ? window.location.reload() : navigate('/login'))}
      >
        {isChunkError ? 'Recargar página' : 'Ir a inicio de sesión'}
      </Button>
    </Box>
  );
};

export default RouteErrorFallback;
