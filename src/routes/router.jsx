import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { Box, Skeleton } from '@mui/material';
import routeConfig from './routeConfig';
import RouteRenderer from './RouteRenderer';
import RouteErrorFallback from './RouteErrorFallback';
import RootLayout from './RootLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
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
 * Convierte path de routeConfig a path de hijo: '/' -> index, '/login' -> 'login'
 */
const toChildRoute = (config) => {
  const base = {
    element: <RouteRenderer key={config.path} config={config} />,
    errorElement: <RouteErrorFallback />,
  };
  if (config.path === '/') {
    return { index: true, ...base };
  }
  return { path: config.path.replace(/^\//, ''), ...base };
};

/**
 * Rutas: RootLayout (AuthProvider) como raíz para que todas las rutas tengan contexto de auth.
 * Así se evita pantalla en blanco con createBrowserRouter.
 */
const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      ...routeConfig.map(toChildRoute),
      {
        path: '*',
        element: (
          <DashboardLayout>
            <Suspense fallback={<PageFallback />}>
              <NotFound />
            </Suspense>
          </DashboardLayout>
        ),
        errorElement: <RouteErrorFallback />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

/**
 * Provee el router y registra el callback de logout (AuthProvider está en App).
 */
const AppRouter = () => {
  const { logout } = useAuth();
  useEffect(() => {
    setLogoutCallback(logout);
    return () => setLogoutCallback(() => {});
  }, [logout]);
  return <RouterProvider router={router} />;
};

export default AppRouter;
