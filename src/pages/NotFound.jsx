import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const NotFound = () => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography variant="h1" component="h1" color="primary.dark" gutterBottom>
      404
    </Typography>
    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
      Página no encontrada
    </Typography>
    <Button
      component={RouterLink}
      to="/dashboard"
      variant="contained"
      color="primary"
      sx={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
      }}
    >
      Ir al Dashboard
    </Button>
  </Box>
);

export default NotFound;
