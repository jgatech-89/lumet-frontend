import { createContext, useContext, useState, useCallback } from 'react';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';

const GlobalFeedbackContext = createContext(null);

export const useGlobalFeedback = () => {
  const ctx = useContext(GlobalFeedbackContext);
  if (!ctx) {
    throw new Error('useGlobalFeedback debe usarse dentro de GlobalFeedbackProvider');
  }
  return ctx;
};

/**
 * Provee estado global de loading (overlay) y error (snackbar).
 * Uso: setLoading(true) al iniciar petición, setLoading(false) al terminar;
 * setError('mensaje') para mostrar error global.
 */
export const GlobalFeedbackProvider = ({ children }) => {
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);

  const setLoading = useCallback((value) => {
    setLoadingState(Boolean(value));
  }, []);

  const setError = useCallback((message) => {
    setErrorState(message ?? null);
    setErrorOpen(Boolean(message));
  }, []);

  const closeError = useCallback(() => {
    setErrorOpen(false);
    setErrorState(null);
  }, []);

  return (
    <GlobalFeedbackContext.Provider value={{ setLoading, setError, loading, error }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          aria-busy="true"
          aria-live="polite"
          role="status"
          aria-label="Cargando"
        >
          <CircularProgress aria-hidden="true" />
        </Box>
      )}
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={closeError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          role="alert"
          aria-live="assertive"
          severity="error"
          variant="filled"
          onClose={closeError}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </GlobalFeedbackContext.Provider>
  );
};
