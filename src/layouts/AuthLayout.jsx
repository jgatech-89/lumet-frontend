import { Box } from '@mui/material';

/**
 * Layout para páginas de autenticación (login, etc.). Sin barra de navegación.
 */
const AuthLayout = ({ children }) => (
  <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch' }}>
    {children}
  </Box>
);

export default AuthLayout;
