import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom color="primary.dark">
        Panel Admin
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Acceso restringido a rol admin. Usuario: {user?.sub ?? user?.email ?? '—'} (rol: {user?.role ?? '—'})
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          El backend debe validar el rol en cada request. Esta ruta es solo una capa de UX.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Admin;
