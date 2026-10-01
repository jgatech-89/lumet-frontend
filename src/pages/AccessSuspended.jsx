import { useEffect } from 'react';
import { Box, Paper, SvgIcon, Typography, alpha } from '@mui/material';
import Logo from '../components/login/Logo';
import { clearTokens } from '../utils/auth';

const LockIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z" />
  </SvgIcon>
);

const AccessSuspended = () => {
  useEffect(() => {
    clearTokens();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          textAlign: 'center',
          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          boxShadow: `0 10px 30px ${alpha(theme.palette.error.main, 0.12)}`,
        })}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Logo />
        </Box>
        <Box
          sx={(theme) => ({
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2.5,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'error.main',
            bgcolor: alpha(theme.palette.error.main, 0.12),
          })}
        >
          <LockIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 700 }}>
          Suscripción vencida
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
          Tu acceso ha sido suspendido
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          El periodo de tu suscripción a Lumet ha finalizado y el acceso a la plataforma se encuentra interrumpido.
        </Typography>
        <Typography color="text.secondary">
          Para reactivar tu cuenta, ponte al día con el pago de tu suscripción y contacta al administrador.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AccessSuspended;
