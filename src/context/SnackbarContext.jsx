import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext(null);

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar debe usarse dentro de SnackbarProvider');
  }
  return ctx;
};

const DEFAULT_ANCHOR = { vertical: 'top', horizontal: 'left' };
const DEFAULT_DURATION = 2000;

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [anchorOrigin, setAnchorOrigin] = useState(DEFAULT_ANCHOR);
  const [autoHideDuration, setAutoHideDuration] = useState(DEFAULT_DURATION);

  const showSnackbar = useCallback((msg, sev = 'success', opts = {}) => {
    setMessage(msg);
    setSeverity(sev);
    setAnchorOrigin(opts.anchorOrigin ?? DEFAULT_ANCHOR);
    setAutoHideDuration(opts.autoHideDuration ?? DEFAULT_DURATION);
    setOpen(true);
  }, []);

  const handleClose = useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        sx={{
          '&.MuiSnackbar-root': {
            animation: 'slideUp 0.35s ease-out',
            '@keyframes slideUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          },
        }}
      >
        <Alert
          role="alert"
          aria-live="polite"
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
