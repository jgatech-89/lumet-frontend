import { createTheme } from '@mui/material/styles';

const palette = {
  primary: '#2196f3',
  primaryDark: '#1976d2',
  secondary: '#4dabf5',
  light1: '#7ac0f8',
  light2: '#a6d5fa',
  light3: '#d3eafd',
  white: '#ffffff',
  /** Fondo tipo dashboard SaaS */
  dashboardBg: '#f8fafc',
  /** Azul muy suave para item activo del sidebar */
  sidebarActiveBg: '#e8f4fd',
};

/** Pantallas 14" o menos (~1400px ancho, ~800px alto) */
const COMPACT_MEDIA = '@media (max-width: 1400px), (max-height: 800px)';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      compact: 1400, // pantallas 14" o menos
    },
  },
  palette: {
    primary: {
      main: palette.primary,
      light: palette.secondary,
      dark: palette.primaryDark,
      contrastText: palette.white,
    },
    secondary: {
      main: palette.secondary,
      light: palette.light1,
      contrastText: palette.white,
    },
    background: {
      default: palette.dashboardBg,
      paper: palette.white,
    },
    text: {
      primary: '#212b36',
      secondary: '#637381',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      letterSpacing: '0.01em',
    },
    body2: {
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)',
          },
        },
        containedPrimary: {
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: palette.white,
            '& fieldset': {
              borderColor: 'rgba(0,0,0,0.08)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0,0,0,0.15)',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '1px',
              borderColor: palette.primary,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: palette.white,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'background-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            borderRadius: 10,
          },
        },
      },
    },
  },
});

export default theme;
export { palette, COMPACT_MEDIA };
