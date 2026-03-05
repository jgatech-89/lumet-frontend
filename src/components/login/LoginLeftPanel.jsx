import { Box, Typography } from '@mui/material';
import Logo from './Logo';

const LoginLeftPanel = () => (
  <Box
    sx={{
      position: 'relative',
      zIndex: 1,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '50%',
      flexShrink: 0,
      px: 5,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ position: 'absolute', top: 32, left: 40, zIndex: 2 }}>
      <Logo />
    </Box>

    {/* Bloque único: título + descripción + ilustración, centrado verticalmente en el panel */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: 480,
        position: 'relative',
        zIndex: 1,
        mt: '13.5vh',
      }}
    >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'rgba(0, 0, 0, 0.75)',
            mb: 0.3,
            letterSpacing: '-0.02em',
            lineHeight: 0.9,
            fontSize: { xs: '2.4rem', sm: '3.65rem' },
            animation: 'loginWelcomeIn 0.7s ease-out both',
            '@keyframes loginWelcomeIn': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          Bienvenido a
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 0,
            mb: 2,
            letterSpacing: '-0.02em',
            animation: 'loginLumetIn 0.7s ease-out 0.15s both',
            '@keyframes loginLumetIn': {
              from: { opacity: 0, transform: 'translateY(12px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Typography component="span" sx={{ fontSize: { xs: 28, sm: 50 }, fontWeight: 800, color: '#0d2137', lineHeight: 1 }}>
            Lumet
          </Typography>
          <Typography component="span" sx={{ fontSize: { xs: 28, sm: 50 }, fontWeight: 800, color: '#1976d2', lineHeight: 1 }}>
            .beta
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(24, 24, 24, 0.98)',
            mb: 2.3,
            mt: 2.1,
            maxWidth: 360,
            animation: 'loginDescIn 0.6s ease-out 0.3s both',
            '@keyframes loginDescIn': {
              from: { opacity: 0, transform: 'translateY(8px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          El sistema CRM diseñado para organizar y optimizar tu negocio.
        </Typography>

        <Box
          sx={{
            width: '100%',
            maxWidth: 460,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'float 12s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(2px, -3px) scale(1.005)' },
              '66%': { transform: 'translate(-2px, -4px) scale(1.008)' },
            },
          }}
        >
          <Box
            component="img"
            src="/login-illustration.png"
            alt="Ideas, datos y colaboración"
            sx={{
              width: '140%',
              height: 'auto',
              maxHeight: 380,
              objectFit: 'contain',
            }}
          />
        </Box>
    </Box>
  </Box>
);

export default LoginLeftPanel;
