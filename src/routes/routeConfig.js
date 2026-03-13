import { lazy } from 'react';

/**
 * Configuración centralizada de rutas.
 * Solo importa páginas desde src/pages. Las páginas son el punto de entrada hacia los módulos en app.
 *
 * path: ruta URL
 * element: componente (página, lazy)
 * private: si true, requiere autenticación (ProtectedRoute)
 * roles: array de roles permitidos (ej. ['admin', 'user']). Si no se define, no se valida rol.
 * layout: 'main' | 'auth' (DashboardLayout o AuthLayout)
 *
 * Flujo: Router → Page → Feature Module (app)
 *
 * IMPORTANTE: Las rutas protegidas y por rol son solo una capa de UX.
 * La seguridad real debe implementarse en el backend (validar token y permisos en cada request).
 */
const Dashboard = lazy(() => import('../pages/Dashboard'));
const NewClientPage = lazy(() => import('../pages/NewClientPage'));
const ConfigurationPage = lazy(() => import('../pages/ConfigurationPage'));
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
    roles: ['admin', 'user', 'usuario', 'cliente', 'invitado'],
    layout: 'main',
  },
  {
    path: '/nuevo-cliente',
    element: NewClientPage,
    private: true,
    roles: ['admin', 'user', 'usuario', 'cliente', 'invitado'],
    layout: 'main',
  },
  {
    path: '/configuracion',
    element: ConfigurationPage,
    private: true,
    roles: ['admin'],
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
    roles: ['admin', 'user', 'usuario', 'cliente', 'invitado'],
    layout: 'main',
  },
];

export default routeConfig;
export { Dashboard, NewClientPage, ConfigurationPage, Admin, Login, NotFound };
