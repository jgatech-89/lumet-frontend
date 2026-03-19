import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const STORAGE_KEY = 'lumet-theme-mode';

const ThemeContext = createContext(null);

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode debe usarse dentro de ThemeModeProvider');
  }
  return ctx;
};

const getInitialMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (_) {}
  return 'light';
};

const createAppTheme = (mode) => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2196f3',
        light: '#4dabf5',
        dark: '#1976d2',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#4dabf5',
        light: '#7ac0f8',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#1a1d20' : '#f8fafc',
        paper: isDark ? '#23262a' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e6edf3' : '#212b36',
        secondary: isDark ? '#8b949e' : '#637381',
      },
    },
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536, compact: 1400 },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      body1: { letterSpacing: '0.01em' },
      body2: { letterSpacing: '0.01em' },
    },
    shape: { borderRadius: 12 },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 12 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 600,
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
            '&:hover': {
              boxShadow: isDark ? '0 4px 12px rgba(33, 150, 243, 0.4)' : '0 4px 12px rgba(33, 150, 243, 0.25)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: isDark ? '0 4px 12px rgba(33, 150, 243, 0.5)' : '0 4px 12px rgba(33, 150, 243, 0.35)',
            },
          },
          containedPrimary: { color: '#ffffff' },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              },
              '&.Mui-focused fieldset': {
                borderWidth: '1px',
                borderColor: '#2196f3',
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': { borderBottom: 'none' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 10, fontWeight: 500 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'background-color 0.2s ease, transform 0.2s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
              transform: 'scale(1.05)',
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': { borderRadius: 10 },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          },
        },
      },
    },
  });
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {}
      return next;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      toggleMode,
    }),
    [mode, toggleMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
