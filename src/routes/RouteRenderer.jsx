import { Suspense, useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
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

/** Loader a pantalla completa; se muestra solo tras un delay para evitar parpadeo cuando la auth resuelve rápido. */
const AUTH_LOADER_DELAY_MS = 150;

const FullPageAuthLoader = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), AUTH_LOADER_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
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
};

/**
 * Envuelve cada ruta con Layout, protección (privada/pública) y roles según routeConfig.
 * Permite escalar añadiendo solo entradas en routeConfig.
 */
const RouteRenderer = ({ config }) => {
  const location = useLocation();
  const { initialized, isAuthenticated } = useAuth();
  const Page = config.element;
  const Layout = config.layout === 'auth' ? AuthLayout : DashboardLayout;

  // Rutas privadas: no mostrar DashboardLayout hasta saber si hay sesión (evita parpadeo)
  if (config.private) {
    if (!initialized) return <FullPageAuthLoader />;
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  const isDashboardLayout = config.layout === 'main';
  let content = (
    <Box
      key={location.pathname}
      sx={{
        width: '100%',
        ...(isDashboardLayout
          ? {
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }
          : { minHeight: '100vh' }),
        animation: 'pageIn 0.35s ease-out forwards',
        '@keyframes pageIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {isDashboardLayout ? (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Suspense fallback={<PageFallback />}>
            <Page />
          </Suspense>
        </Box>
      ) : (
        <Suspense fallback={<PageFallback />}>
          <Page />
        </Suspense>
      )}
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
