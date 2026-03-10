import { Switch, FormControlLabel, Typography, Box } from '@mui/material';
import { useThemeMode } from '../../context/ThemeContext';

/** Icono: luna creciente */
const MoonIcon = ({ sx, ...rest }) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    sx={{ width: 18, height: 18, flexShrink: 0, color: 'text.secondary', ...sx }}
    {...rest}
  >
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
  </Box>
);

/** Icono: sol */
const SunIcon = ({ sx, ...rest }) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    sx={{ width: 18, height: 18, flexShrink: 0, color: 'text.secondary', ...sx }}
    {...rest}
  >
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM6 12c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1zm14 0c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1zm-9 7h2c.55 0 1-.45 1-1s-.45-1-1-1H11c-.55 0-1 .45-1 1s.45 1 1 1z" />
  </Box>
);

const DarkModeToggle = ({ showLabel = true, size = 'medium' }) => {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  const switchSize = 'small';
  const iconSize = size === 'small' ? 16 : 18;

  const buttonContent = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        borderRadius: 1.5,
        px: 1,
        py: 0.5,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {isDark ? <SunIcon sx={{ width: iconSize, height: iconSize }} /> : <MoonIcon sx={{ width: iconSize, height: iconSize }} />}
      <Switch
        checked={isDark}
        onChange={toggleMode}
        size={switchSize}
        aria-label={isDark ? 'Modo noche activo' : 'Activar modo noche'}
        sx={{
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                backgroundColor: '#ffffff',
                opacity: 1,
              },
              '& .MuiSwitch-thumb': {
                backgroundColor: '#374151',
              },
            },
          },
          '& .MuiSwitch-track': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            opacity: 0.8,
          },
          '& .MuiSwitch-thumb': {
            backgroundColor: '#ffffff',
          },
        }}
      />
    </Box>
  );

  if (!showLabel) {
    return buttonContent;
  }

  return (
    <FormControlLabel
      control={buttonContent}
      label={
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
          Modo noche
        </Typography>
      }
      labelPlacement="start"
      sx={{ m: 0, mr: 1, '& .MuiFormControlLabel-label': { ml: 1 } }}
    />
  );
};

export default DarkModeToggle;
