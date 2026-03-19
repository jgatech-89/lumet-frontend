import { Outlet } from 'react-router-dom';

/**
 * Layout raíz del router. AuthProvider está en App.jsx para que
 * incluso el error boundary (RouteErrorFallback) tenga contexto y no falle useAuth.
 */
const RootLayout = () => <Outlet />;

export default RootLayout;
