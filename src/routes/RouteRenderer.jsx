import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PublicRoute from './PublicRoute';

const PageFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
    <CircularProgress />
  </Box>
);

/**
 * Envuelve cada ruta con Layout, protección (privada/pública) y roles según routeConfig.
 * Permite escalar añadiendo solo entradas en routeConfig.
 */
const RouteRenderer = ({ config }) => {
  const Page = config.element;
  const Layout = config.layout === 'auth' ? AuthLayout : MainLayout;

  let content = (
    <Suspense fallback={<PageFallback />}>
      <Page />
    </Suspense>
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
