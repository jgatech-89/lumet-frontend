import { Suspense } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PublicRoute from './PublicRoute';
import { useAuth } from '../context/AuthContext';

const PageFallback = () => (
  <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
    <Skeleton variant="text" width="90%" />
    <Skeleton variant="text" width="70%" />
    <Skeleton variant="text" width="85%" sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
  </Box>
);

/** Loader a pantalla completa mientras se resuelve la auth. Evita el parpadeo del layout. */
const FullPageAuthLoader = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * Envuelve cada ruta con Layout, protección (privada/pública) y roles según routeConfig.
 * Permite escalar añadiendo solo entradas en routeConfig.
 */
const RouteRenderer = ({ config }) => {
  const location = useLocation();
  const { initialized, isAuthenticated } = useAuth();
  const Page = config.element;
  const Layout = config.layout === 'auth' ? AuthLayout : MainLayout;

  // Rutas privadas: no mostrar MainLayout hasta saber si hay sesión (evita parpadeo)
  if (config.private) {
    if (!initialized) return <FullPageAuthLoader />;
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  let content = (
    <Box
      key={location.pathname}
      sx={{
        width: '100%',
        minHeight: '100vh',
        animation: 'pageIn 0.35s ease-out forwards',
        '@keyframes pageIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Suspense fallback={<PageFallback />}>
        <Page />
      </Suspense>
    </Box>
  );

  if (config.private) {
    content = <ProtectedRoute>{content}</ProtectedRoute>;
  } else if (config.layout === 'auth') {
    content = <PublicRoute>{content}</PublicRoute>;
  }

  if (config.roles?.length) {
    content = <RoleRoute allowedRoles={config.roles}>{content}</RoleRoute>;
  }

  return <Layout>{content}</Layout>;
};

export default RouteRenderer;
