import { useState } from 'react';
import { Box, IconButton, SvgIcon, Typography, alpha } from '@mui/material';

const CloseIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </SvgIcon>
);

const PriorityHighIcon = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="19" r="2" />
    <path d="M10 3h4v12h-4z" />
  </SvgIcon>
);

const EventIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V8h14zM7 10h5v5H7z" />
  </SvgIcon>
);

// Access ends at this local date/time; the banner hides itself afterwards.
const ACCESS_ENDS_AT = new Date(2026, 8, 30, 23, 59, 59);

const SubscriptionBanner = () => {
  const [open, setOpen] = useState(() => Date.now() <= ACCESS_ENDS_AT.getTime());

  if (!open) return null;

  const dateLabel = ACCESS_ENDS_AT.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Box
      role="alert"
      sx={(theme) => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mx: { xs: 1, sm: 1.5 },
        mt: 1,
        px: { xs: 2, sm: 3 },
        py: 2,
        pr: 6,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
        bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
        flexShrink: 0,
      })}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'error.main',
          color: '#fff',
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <PriorityHighIcon fontSize="large" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 700, lineHeight: 1.4 }}>
          Suscripción por vencer
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          Tu acceso termina hoy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Para seguir utilizando Lumet sin interrupciones, renueva tu plan de suscripción.
        </Typography>
      </Box>

      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          mr: { sm: 2 },
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.45)}`,
          borderLeft: `5px solid ${theme.palette.error.main}`,
          bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
          boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.18)}`,
        })}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'error.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            animation: 'subscriptionPulse 1.8s ease-out infinite',
            '@keyframes subscriptionPulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.55)' },
              '70%': { boxShadow: '0 0 0 10px rgba(211, 47, 47, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
            },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          <EventIcon fontSize="small" />
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'error.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
            display="block"
          >
            Acceso disponible hasta
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 800, lineHeight: 1.3 }}>
            Hoy, {dateLabel} a las 11:59 p. m.
          </Typography>
          <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 500 }} display="block">
            Después de esta fecha tu cuenta será suspendida.
          </Typography>
        </Box>
      </Box>

      <IconButton
        aria-label="Cerrar aviso"
        size="small"
        onClick={() => setOpen(false)}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default SubscriptionBanner;
