import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Rutas públicas (ej. login). Si el usuario ya está autenticado,
 * redirige a /dashboard para evitar mostrar login de nuevo.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
