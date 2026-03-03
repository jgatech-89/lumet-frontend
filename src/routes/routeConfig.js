import { lazy } from 'react';

/**
 * Configuración centralizada de rutas.
 * Añadir una nueva ruta = añadir un objeto a este array.
 *
 * path: ruta URL
 * element: componente (lazy o no)
 * private: si true, requiere autenticación (ProtectedRoute)
 * roles: array de roles permitidos (ej. ['admin', 'user']). Si no se define, no se valida rol.
 * layout: 'main' | 'auth' (MainLayout o AuthLayout)
 *
 * IMPORTANTE: Las rutas protegidas y por rol son solo una capa de UX.
 * La seguridad real debe implementarse en el backend (validar token y permisos en cada request).
 */
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Admin = lazy(() => import('../pages/Admin'));
const Login = lazy(() => import('../pages/Login'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routeConfig = [
  {
    path: '/login',
    element: Login,
    private: false,
    layout: 'auth',
  },
  {
    path: '/dashboard',
    element: Dashboard,
    private: true,
    roles: ['admin', 'user'],
    layout: 'main',
  },
  {
    path: '/admin',
    element: Admin,
    private: true,
    roles: ['admin'],
    layout: 'main',
  },
  // Ruta raíz: misma lógica que dashboard (ordenada al final para no pisar rutas más específicas)
  {
    path: '/',
    element: Dashboard,
    private: true,
    roles: ['admin', 'user'],
    layout: 'main',
  },
];

export default routeConfig;
export { Dashboard, Admin, Login, NotFound };
