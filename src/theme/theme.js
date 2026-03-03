import { createTheme } from '@mui/material/styles';

const palette = {
  primary: '#2196f3',
  secondary: '#4dabf5',
  light1: '#7ac0f8',
  light2: '#a6d5fa',
  light3: '#d3eafd',
  white: '#ffffff',
};

const theme = createTheme({
  palette: {
    primary: {
      main: palette.primary,
      light: palette.secondary,
      dark: '#1976d2',
      contrastText: palette.white,
    },
    secondary: {
      main: palette.secondary,
      light: palette.light1,
      contrastText: palette.white,
    },
    background: {
      default: palette.white,
      paper: palette.white,
    },
    text: {
      primary: '#212b36',
      secondary: '#637381',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
});

export default theme;
export { palette };
