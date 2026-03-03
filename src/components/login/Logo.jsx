import { Box, Typography } from '@mui/material';

/**
 * Logo Lumet.beta: icono de haz de luz + texto "lumet.beta".
 * Colores oscuros para contrastar con fondo claro; tamaño proporcional al texto.
 */
const Logo = ({ size = 'medium' }) => {
  const isSmall = size === 'small';
  const fontSize = isSmall ? 18 : 22;
  const iconHeight = Math.round(fontSize * 1.7);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        component="svg"
        viewBox="0 0 40 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        sx={{ height: iconHeight, width: 'auto', flexShrink: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="lumet-beam" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#0d2137" />
            <stop offset="25%" stopColor="#1e3a5f" />
            <stop offset="55%" stopColor="#2196f3" />
            <stop offset="85%" stopColor="#4dabf5" />
            <stop offset="100%" stopColor="#fef9e7" />
          </linearGradient>
        </defs>
        {/* Haz de luz: contorno oscuro para que se lea sobre fondo claro */}
        <path
          d="M20 56 L15 22 Q20 4 25 22 L20 56 Z"
          stroke="#0d2137"
          strokeWidth="0.8"
          strokeLinejoin="round"
          fill="url(#lumet-beam)"
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0, letterSpacing: '-0.02em' }}>
        <Typography
          component="span"
          sx={{
            fontSize,
            fontWeight: 700,
            color: '#0d2137',
            letterSpacing: 'inherit',
            lineHeight: 1,
          }}
        >
          Lumet
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize,
            fontWeight: 700,
            color: '#1976d2',
            letterSpacing: 'inherit',
            lineHeight: 1,
            ml: '-0.08em',
          }}
        >
          .beta
        </Typography>
      </Box>
    </Box>
  );
};

export default Logo;
