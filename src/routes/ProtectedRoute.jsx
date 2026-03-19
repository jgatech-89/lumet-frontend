import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/loading';

/**
 * Protege rutas que requieren autenticación.
 * Si el usuario no está autenticado, redirige a /login.
 * NOTA: Esto es solo UX. El backend debe validar el token en cada request.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <PageLoader message="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
