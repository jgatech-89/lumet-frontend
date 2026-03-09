import { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Typography, TextField, Button, Link } from '@mui/material';

const DIGIT_COUNT = 6;
const RESEND_COOLDOWN_SEC = 60;

const getInputSx = (hasValue) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#ffffff',
    width: 52,
    maxWidth: 52,
    minHeight: 56,
    textAlign: 'center',
    fontSize: '1.25rem',
    fontWeight: 600,
    transition: 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease',
    transform: hasValue ? 'scale(1.02)' : 'scale(1)',
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2196f3',
        borderWidth: 2,
      },
      boxShadow: '0 0 0 3px rgba(33,150,243,0.2)',
      transform: 'scale(1.04)',
    },
  },
  '& .MuiInputBase-input': {
    padding: '14px 8px',
    textAlign: 'center',
  },
});

const ConfirmCodeForm = ({ email, onSubmit, onResendCode, isLoading = false }) => {
  const [digits, setDigits] = useState(Array(DIGIT_COUNT).fill(''));
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c <= 0 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const focusInput = useCallback((index) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, DIGIT_COUNT).split('');
      const newDigits = [...digits];
      pasted.forEach((d, i) => {
        if (index + i < DIGIT_COUNT) newDigits[index + i] = d;
      });
      setDigits(newDigits);
      setError('');
      focusInput(Math.min(index + pasted.length, DIGIT_COUNT - 1));
      return;
    }
    const char = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError('');
    if (char && index < DIGIT_COUNT - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== DIGIT_COUNT) {
      setError('Ingresa los 6 dígitos del código');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Solo se permiten dígitos numéricos');
      return;
    }
    setError('');
    onSubmit({ code });
  };

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      noValidate
      sx={{
        width: '100%',
        maxWidth: 460,
        mx: 'auto',
        animation: 'fadeIn 0.6s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 1.5,
          fontSize: { xs: '1.35rem', sm: '1.7rem' },
        }}
      >
        Confirmar código
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 0.5 }}
        >
          Te enviamos un código de 6 dígitos al siguiente correo:
        </Typography>
        <Typography
          component="span"
          sx={{
            display: 'inline-block',
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '0.95rem',
            mb: 1,
          }}
        >
          {email}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Ingrésalo en los recuadros de abajo.
        </Typography>
      </Box>

      <Box
        component="fieldset"
        border="none"
        padding={0}
        margin={0}
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: 'center',
          flexWrap: 'nowrap',
          mb: 1,
        }}
        aria-describedby={error ? 'confirm-code-error' : undefined}
        aria-invalid={Boolean(error)}
      >
        <Box
          component="legend"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Código de verificación de 6 dígitos
        </Box>
        {digits.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              'aria-label': `Dígito ${index + 1} de 6`,
              autoComplete: index === 0 ? 'one-time-code' : 'off',
            }}
            error={Boolean(error)}
            sx={getInputSx(Boolean(digit))}
          />
        ))}
      </Box>
      {error && (
        <Typography
          id="confirm-code-error"
          variant="caption"
          color="error"
          role="alert"
          sx={{ display: 'block', textAlign: 'center', mb: 1 }}
        >
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 2, mb: 2 }}>
        {resendCooldown > 0 ? (
          <Typography variant="body2" color="text.secondary">
            Reenviar código en {resendCooldown} s
          </Typography>
        ) : (
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => {
              onResendCode();
              setResendCooldown(RESEND_COOLDOWN_SEC);
            }}
            sx={{
              display: 'block',
              color: 'text.secondary',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              p: 0,
              font: 'inherit',
              '&:hover': { textDecoration: 'underline', color: '#4dabf5' },
            }}
          >
            Reenviar código
          </Link>
        )}
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 2.5,
          height: 60,
          borderRadius: 2,
          bgcolor: '#2196f3',
          color: '#ffffff',
          fontWeight: 700,
          boxShadow: 'none',
          transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover:not(.Mui-disabled)': {
            bgcolor: '#4dabf5',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)',
          },
        }}
      >
        {isLoading ? 'Verificando...' : 'Confirmar'}
      </Button>
    </Box>
  );
};

export default ConfirmCodeForm;
