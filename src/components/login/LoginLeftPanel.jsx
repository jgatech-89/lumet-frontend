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
          }}
        >
          Bienvenido a
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0, mb: 2, letterSpacing: '-0.02em' }}>
          <Typography component="span" sx={{ fontSize: { xs: 28, sm: 50 }, fontWeight: 800, color: '#0d2137', lineHeight: 1 }}>
            Lumet
          </Typography>
          <Typography component="span" sx={{ fontSize: { xs: 28, sm: 50 }, fontWeight: 800, color: '#1976d2', lineHeight: 1}}>
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
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-4px)' },
              '100%': { transform: 'translateY(0px)' },
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
