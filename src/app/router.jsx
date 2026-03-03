import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import routeConfig from '../routes/routeConfig';
import RouteRenderer from '../routes/RouteRenderer';
import MainLayout from '../layouts/MainLayout';
import { NotFound } from '../routes/routeConfig';
import { useAuth } from '../context/AuthContext';
import { setLogoutCallback } from '../services/api';

const PageFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
    <CircularProgress />
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
