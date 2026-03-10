import { Box, Typography } from '@mui/material';
import logoIcon from '../../assets/logo-lumet.png';
import { useThemeMode } from '../../context/ThemeContext';

/**
 * Logo Lumet.beta: icono (PNG) + texto "Lumet.beta".
 */
const Logo = ({ size = 'medium' }) => {
  const { isDark } = useThemeMode();
  const isSmall = size === 'small';
  const fontSize = isSmall ? 20 : 24;
  const iconHeight = Math.round(fontSize * 2.35);

  const textColor = isDark ? '#ffffff' : '#0d2137';
  const dotColor = isDark ? '#90caf9' : '#1976d2';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        component="img"
        src={logoIcon}
        alt=""
        sx={{
          height: iconHeight,
          maxHeight: 60,
          width: 'auto',
          flexShrink: 0,
          display: 'block',
          objectFit: 'contain',
        }}
        aria-hidden
      />
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0, letterSpacing: '-0.02em' }}>
        <Typography
          component="span"
          sx={{
            fontSize,
            fontWeight: 700,
            color: textColor,
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
            color: dotColor,
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
