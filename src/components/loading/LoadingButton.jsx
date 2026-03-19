import { Button, CircularProgress } from '@mui/material';

/**
 * Botón que muestra estado de carga (spinner + texto opcional) y se deshabilita mientras carga.
 * Ideal para envío de formularios y acciones async.
 */
const LoadingButton = ({
  loading = false,
  loadingText = 'Enviando...',
  children,
  disabled,
  size = 'medium',
  ...buttonProps
}) => (
  <Button
    disabled={disabled || loading}
    aria-busy={loading}
    aria-label={loading ? loadingText : undefined}
    size={size}
    {...buttonProps}
  >
    {loading ? (
      <>
        <CircularProgress size={size === 'small' ? 18 : 22} color="inherit" sx={{ mr: 1.5 }} aria-hidden="true" />
        {loadingText}
      </>
    ) : (
      children
    )}
  </Button>
);

export default LoadingButton;
