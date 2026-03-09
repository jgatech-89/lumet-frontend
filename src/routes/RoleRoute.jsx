import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Restringe el acceso por rol. Debe usarse dentro de una ruta ya protegida (ProtectedRoute).
 * Si el usuario no tiene ninguno de los roles permitidos, redirige a /dashboard.
 * NOTA: La autorización real debe hacerse en el backend. Esto es solo una capa de UX.
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role ?? user?.roles?.[0] ?? 'user';
  const hasRole = Array.isArray(allowedRoles) && allowedRoles.length > 0
    ? allowedRoles.includes(userRole)
    : true;

  if (!hasRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
