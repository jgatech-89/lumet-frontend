import { Box, Typography } from '@mui/material';

const Inicio = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
    }}
  >
    <Typography variant="h1" component="h1" color="primary.dark">
      Inicio
    </Typography>
  </Box>
);

export default Inicio;
