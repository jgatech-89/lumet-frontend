import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { Box, Skeleton } from '@mui/material';
import routeConfig from './routeConfig';
import RouteRenderer from './RouteRenderer';
import RouteErrorFallback from './RouteErrorFallback';
import MainLayout from '../layouts/MainLayout';
import { NotFound } from './routeConfig';
import { useAuth } from '../context/AuthContext';
import { setLogoutCallback } from '../utils/api';

const PageFallback = () => (
  <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
    <Skeleton variant="text" width="90%" />
    <Skeleton variant="text" width="70%" />
    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mt: 2 }} />
  </Box>
);

/**
 * Rutas construidas desde routeConfig.
 * Añadir una nueva ruta = añadir un objeto en routeConfig (no tocar este archivo).
 */
const routes = [
  ...routeConfig.map((config) => ({
    path: config.path,
    element: <RouteRenderer key={config.path} config={config} />,
    errorElement: <RouteErrorFallback />,
  })),
  {
    path: '*',
    element: (
      <MainLayout>
        <Suspense fallback={<PageFallback />}>
          <NotFound />
        </Suspense>
      </MainLayout>
    ),
    errorElement: <RouteErrorFallback />,
  },
];

const router = createBrowserRouter(routes);

/**
 * Envuelve RouterProvider y registra el callback de logout para que el interceptor
 * de Axios (401) pueda cerrar sesión sin acoplar api.js al Context.
 */
const AppRouter = () => {
  const { logout } = useAuth();
  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
