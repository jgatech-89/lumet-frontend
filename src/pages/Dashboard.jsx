import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom color="primary.dark">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Bienvenido{user?.name ? `, ${user.name}` : user?.sub ? `, ${user.sub}` : ''}.
      </Typography>
      <Paper
        sx={{
          p: 2,
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Esta es el área privada. Solo usuarios autenticados con rol admin o user pueden verla.
          La autorización real la debe validar siempre el backend.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
