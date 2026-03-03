import { createTheme } from '@mui/material/styles';

const lumetPalette = {
  dark: '#2E6386',
  medium: '#6595BB',
  base: '#9BCBF3',
  light: '#CFE5F9',
  white: '#FFFFFF',
};

const theme = createTheme({
  palette: {
    primary: {
      main: lumetPalette.medium,
      dark: lumetPalette.dark,
      light: lumetPalette.base,
      contrastText: lumetPalette.white,
    },
    background: {
      default: lumetPalette.light,
      paper: lumetPalette.white,
    },
    text: {
      primary: lumetPalette.dark,
      secondary: lumetPalette.medium,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    allVariants: {
      color: lumetPalette.dark,
    },
  },
});

export default theme;
export { lumetPalette };
